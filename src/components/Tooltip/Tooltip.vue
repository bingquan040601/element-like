<template>
  <span
    ref="triggerRef"
    class="el-like-tooltip__trigger"
    @mouseenter="onTriggerEnter"
    @mouseleave="onTriggerLeave"
    @click="onTriggerClick"
    @focusin="onTriggerFocusIn"
    @focusout="onTriggerFocusOut"
  >
    <slot />
  </span>
  <Teleport to="body">
    <Transition name="el-like-tooltip-fade">
      <div
        v-if="isVisible"
        :id="popperId"
        ref="popperRef"
        class="el-like-tooltip"
        :class="popperClass"
        role="tooltip"
        @mouseenter="onPopperEnter"
        @mouseleave="onPopperLeave"
      >
        <slot name="content">{{ content }}</slot>
        <span
          class="el-like-tooltip__arrow"
          :class="`is-${currentPlacement}`"
          aria-hidden="true"
        ></span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, useTemplateRef, watch } from 'vue'
import type { TooltipPlacement } from './props'
import { tooltipProps } from './props'

defineOptions({
  name: 'ElLike-Tooltip',
})

const props = defineProps(tooltipProps)
const emit = defineEmits<{
  'visible-change': [visible: boolean]
  'update:visible': [visible: boolean]
}>()

// 气泡与触发元素、视口边缘的间距（px）
const GAP = 8
const VIEWPORT_MARGIN = 8

const isVisible = ref(false)
// 实际生效的方位：首选位置空间不足时可能翻转到对侧，箭头跟随该值
const currentPlacement = ref<TooltipPlacement>(props.placement)
const popperId = useId()

const triggerRef = useTemplateRef<HTMLElement>('triggerRef')
const popperRef = useTemplateRef<HTMLElement>('popperRef')

let openTimer: ReturnType<typeof setTimeout> | undefined
let closeTimer: ReturnType<typeof setTimeout> | undefined
let rafId: number | undefined

const clearTimers = () => {
  clearTimeout(openTimer)
  clearTimeout(closeTimer)
  openTimer = undefined
  closeTimer = undefined
}

const show = async () => {
  if (isVisible.value) return
  isVisible.value = true
  // 等气泡渲染完成后再定位：此时才能测量到气泡自身尺寸
  await nextTick()
  updatePosition()
  syncAriaDescribedBy(true)
  addGlobalListeners()
  emit('visible-change', true)
  emit('update:visible', true)
}

const hide = () => {
  if (!isVisible.value) return
  isVisible.value = false
  syncAriaDescribedBy(false)
  removeGlobalListeners()
  emit('visible-change', false)
  emit('update:visible', false)
}

// 延时只对 hover 触发生效：点击、聚焦与手动调用都即时响应
const open = (delayed: boolean) => {
  clearTimers()
  if (delayed && props.openDelay > 0) {
    openTimer = setTimeout(() => {
      void show()
    }, props.openDelay)
  } else {
    void show()
  }
}

const close = (delayed: boolean) => {
  clearTimers()
  if (delayed && props.closeDelay > 0) {
    closeTimer = setTimeout(() => {
      hide()
    }, props.closeDelay)
  } else {
    hide()
  }
}

const onTriggerEnter = () => {
  if (props.manual || props.trigger !== 'hover') return
  open(true)
}

const onTriggerLeave = () => {
  if (props.manual || props.trigger !== 'hover') return
  close(true)
}

const onTriggerClick = () => {
  if (props.manual || props.trigger !== 'click') return
  if (isVisible.value) close(false)
  else open(false)
}

const onTriggerFocusIn = () => {
  if (props.manual || props.trigger !== 'focus') return
  open(false)
}

const onTriggerFocusOut = () => {
  if (props.manual || props.trigger !== 'focus') return
  close(false)
}

// 悬停时移入气泡取消待执行的关闭，移出气泡后才开始关闭延时
const onPopperEnter = () => {
  if (props.manual || props.trigger !== 'hover') return
  clearTimers()
}

const onPopperLeave = () => {
  if (props.manual || props.trigger !== 'hover') return
  close(true)
}

// click 触发时点击触发元素与气泡之外的区域关闭气泡
const onDocumentClick = (event: MouseEvent) => {
  const target = event.target as Node | null
  if (!target) return
  if (triggerRef.value?.contains(target) || popperRef.value?.contains(target)) return
  close(false)
}

const OPPOSITE: Record<TooltipPlacement, TooltipPlacement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

interface Position {
  left: number
  top: number
}

const positionFor = (placement: TooltipPlacement, trigger: DOMRect, popper: DOMRect): Position => {
  const centerX = trigger.left + trigger.width / 2
  const centerY = trigger.top + trigger.height / 2
  switch (placement) {
    case 'top':
      return { left: centerX - popper.width / 2, top: trigger.top - GAP - popper.height }
    case 'bottom':
      return { left: centerX - popper.width / 2, top: trigger.bottom + GAP }
    case 'left':
      return { left: trigger.left - GAP - popper.width, top: centerY - popper.height / 2 }
    case 'right':
      return { left: trigger.right + GAP, top: centerY - popper.height / 2 }
  }
}

const fitsViewport = (position: Position, popper: DOMRect, width: number, height: number) =>
  position.left >= VIEWPORT_MARGIN &&
  position.top >= VIEWPORT_MARGIN &&
  position.left + popper.width <= width - VIEWPORT_MARGIN &&
  position.top + popper.height <= height - VIEWPORT_MARGIN

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const updatePosition = () => {
  const trigger = triggerRef.value
  const popper = popperRef.value
  if (!trigger || !popper) return

  const triggerRect = trigger.getBoundingClientRect()
  const popperRect = popper.getBoundingClientRect()

  let placement = props.placement
  let position = positionFor(placement, triggerRect, popperRect)

  // 首选位置空间不足时翻转到对侧
  if (!fitsViewport(position, popperRect, window.innerWidth, window.innerHeight)) {
    placement = OPPOSITE[placement]
    position = positionFor(placement, triggerRect, popperRect)
  }

  // 翻转后仍放不下时夹紧到视口内，保证气泡完整可见
  position = {
    left: clamp(
      position.left,
      VIEWPORT_MARGIN,
      window.innerWidth - popperRect.width - VIEWPORT_MARGIN,
    ),
    top: clamp(
      position.top,
      VIEWPORT_MARGIN,
      window.innerHeight - popperRect.height - VIEWPORT_MARGIN,
    ),
  }

  currentPlacement.value = placement
  // 定位直接写入内联样式：避免响应式更新引入的额外渲染帧，
  // 让气泡在同一帧内出现在正确位置，不产生跳动
  popper.style.left = `${position.left}px`
  popper.style.top = `${position.top}px`
}

// 显示期间页面滚动或窗口缩放会移动触发元素，需要重算位置；
// rAF 节流避免高频滚动反复触发布局（无 rAF 的环境直接同步更新）
const scheduleUpdatePosition = () => {
  if (rafId !== undefined) return
  if (typeof requestAnimationFrame === 'function') {
    rafId = requestAnimationFrame(() => {
      rafId = undefined
      updatePosition()
    })
  } else {
    updatePosition()
  }
}

const onScrollOrResize = () => scheduleUpdatePosition()

const addGlobalListeners = () => {
  if (typeof window === 'undefined') return
  // scroll 用捕获监听：页面任意滚动容器滚动都会触发
  window.addEventListener('scroll', onScrollOrResize, true)
  window.addEventListener('resize', onScrollOrResize)
  if (props.trigger === 'click' && !props.manual) {
    document.addEventListener('click', onDocumentClick)
  }
}

const removeGlobalListeners = () => {
  if (typeof window === 'undefined') return
  window.removeEventListener('scroll', onScrollOrResize, true)
  window.removeEventListener('resize', onScrollOrResize)
  document.removeEventListener('click', onDocumentClick)
}

// 气泡显示期间把气泡 id 关联到触发元素（默认插槽的第一个元素），
// 屏幕阅读器可读出提示内容
const syncAriaDescribedBy = (described: boolean) => {
  const trigger = triggerRef.value?.firstElementChild
  if (!(trigger instanceof HTMLElement)) return
  if (described) trigger.setAttribute('aria-describedby', popperId)
  else trigger.removeAttribute('aria-describedby')
}

// visible 传入后（manual 模式配合 v-model:visible）由外部接管显示状态
watch(
  () => props.visible,
  (value) => {
    if (value === undefined || value === isVisible.value) return
    if (value) open(false)
    else close(false)
  },
  { immediate: true },
)

// placement 变化时同步箭头方位，显示中立即重算位置
watch(
  () => props.placement,
  (value) => {
    currentPlacement.value = value
    if (isVisible.value) updatePosition()
  },
)

onBeforeUnmount(() => {
  clearTimers()
  removeGlobalListeners()
  syncAriaDescribedBy(false)
})

// manual 模式的方法控制入口：通过模板 ref 调用
defineExpose({
  open: () => open(false),
  close: () => close(false),
  toggle: () => {
    if (isVisible.value) close(false)
    else open(false)
  },
})
</script>

<style lang="scss" scoped>
/* 组件样式统一维护在 styles/components/tooltip.scss，与其他组件共享全局 token 体系 */
</style>

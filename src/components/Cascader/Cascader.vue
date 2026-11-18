<template>
  <div
    ref="rootRef"
    v-bind="$attrs"
    class="el-like-cascader"
    :class="[
      `el-like-cascader--${size}`,
      {
        'is-disabled': disabled,
        'is-opened': isVisible,
        'is-clearable': showClear,
        'is-multiple': isMultiple,
      },
    ]"
  >
    <div class="el-like-cascader__wrapper" @click="handleTriggerClick">
      <div v-if="isMultiple && selectedNodes.length" class="el-like-cascader__tags">
        <span
          v-for="node in visibleTags"
          :key="nodeKey(node.pathValues)"
          class="el-like-cascader__tag"
          :title="getNodeLabel(node)"
        >
          <span class="el-like-cascader__tag-label">{{ getNodeLabel(node) }}</span>
          <button
            v-if="!disabled"
            type="button"
            class="el-like-cascader__tag-close"
            :aria-label="`移除 ${getNodeLabel(node)}`"
            tabindex="-1"
            @click.stop="removeNode(node)"
          >
            <Icon icon="xmark" aria-hidden="true" />
          </button>
        </span>
        <span
          v-if="collapsedTagCount > 0"
          class="el-like-cascader__tag is-collapse"
          :title="collapsedTagsTitle"
        >
          + {{ collapsedTagCount }}
        </span>
      </div>

      <input
        :id="`${panelId}-input`"
        ref="inputRef"
        class="el-like-cascader__input"
        :class="{ 'is-filterable': filterable }"
        :value="inputValue"
        :placeholder="inputPlaceholder"
        :disabled="disabled"
        :readonly="!filterable"
        role="combobox"
        :aria-label="ariaLabel"
        :aria-expanded="isVisible"
        :aria-controls="panelId"
        :aria-autocomplete="filterable ? 'list' : 'none'"
        :aria-activedescendant="
          isFiltering && suggestions.length
            ? getSuggestionElementId(suggestionActiveIndex)
            : undefined
        "
        autocomplete="off"
        spellcheck="false"
        @input="handleInput"
        @keydown="handleInputKeydown"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
      />

      <button
        v-if="showClear"
        type="button"
        class="el-like-cascader__clear"
        aria-label="清空选择"
        tabindex="-1"
        @click.stop="clearValue"
      >
        <Icon icon="circle-xmark" aria-hidden="true" />
      </button>
      <span class="el-like-cascader__arrow" aria-hidden="true" @click.stop="handleArrowClick">
        <Icon icon="angle-down" />
      </span>
    </div>
  </div>

  <Teleport to="body" :disabled="!teleported">
    <Transition name="el-like-cascader-zoom">
      <div
        v-if="isVisible"
        :id="panelId"
        ref="popperRef"
        class="el-like-cascader__popper"
        :class="popperClass"
        :data-placement="currentPlacement"
        :style="{ visibility: positioned ? 'visible' : 'hidden' }"
        @mousedown.prevent
        @click.stop
      >
        <div v-if="isFiltering" class="el-like-cascader__suggestions" role="listbox">
          <template v-if="suggestions.length">
            <div
              v-for="(node, index) in suggestions"
              :id="getSuggestionElementId(index)"
              :key="nodeKey(node.pathValues)"
              class="el-like-cascader__suggestion"
              :class="{
                'is-active': index === suggestionActiveIndex,
                'is-disabled': node.disabled,
                'is-checked': isNodeChecked(node),
              }"
              role="option"
              :aria-selected="isNodeChecked(node)"
              :aria-disabled="node.disabled"
              @click="handleSuggestionClick(node)"
              @mouseenter="suggestionActiveIndex = index"
            >
              <input
                v-if="isMultiple"
                type="checkbox"
                :checked="isNodeChecked(node)"
                :disabled="node.disabled"
                :aria-label="`选择 ${getNodeLabel(node)}`"
                tabindex="-1"
                @click.stop
                @change.stop="toggleNode(node)"
              />
              <span class="el-like-cascader__suggestion-label">
                <slot :node="node" :data="node.data">{{ getNodeLabel(node) }}</slot>
              </span>
              <Icon
                v-if="!isMultiple && isNodeChecked(node)"
                icon="check"
                class="el-like-cascader__check"
                aria-hidden="true"
              />
            </div>
          </template>
          <div v-else class="el-like-cascader__empty">{{ emptyText }}</div>
        </div>

        <div v-else class="el-like-cascader__menus">
          <template v-if="rootNodes.length">
            <ul
              v-for="(menu, menuIndex) in menus"
              :key="menuIndex"
              class="el-like-cascader__menu"
              role="menu"
            >
              <li v-for="node in menu" :key="nodeKey(node.pathValues)" role="none">
                <div
                  :id="getNodeElementId(node)"
                  class="el-like-cascader__node"
                  :class="{
                    'is-active': isNodeActive(node),
                    'is-disabled': node.disabled,
                    'is-checked': isNodeChecked(node),
                  }"
                  role="menuitem"
                  :tabindex="node.disabled ? -1 : 0"
                  :aria-disabled="node.disabled"
                  :aria-expanded="canExpand(node) ? isNodeActive(node) : undefined"
                  :aria-busy="node.loading"
                  @click="handleNodeClick(node)"
                  @mouseenter="handleNodeHover(node)"
                  @keydown.enter.prevent="handleNodeClick(node)"
                  @keydown.space.prevent="handleNodeSpace(node)"
                  @keydown.down.prevent="focusAdjacentNode($event, 1)"
                  @keydown.up.prevent="focusAdjacentNode($event, -1)"
                  @keydown.right.prevent="expandAndFocus(node)"
                  @keydown.left.prevent="focusParentNode(node)"
                >
                  <input
                    v-if="isMultiple"
                    type="checkbox"
                    :checked="getCheckboxState(node).checked"
                    :indeterminate="getCheckboxState(node).indeterminate"
                    :disabled="isCheckboxDisabled(node)"
                    :aria-label="`选择 ${getNodeLabel(node)}`"
                    tabindex="-1"
                    @click.stop
                    @change.stop="toggleNode(node)"
                  />
                  <input
                    v-else-if="config.checkStrictly"
                    type="radio"
                    :name="radioGroup"
                    :checked="isNodeChecked(node)"
                    :disabled="node.disabled"
                    :aria-label="`选择 ${getNodeLabel(node)}`"
                    tabindex="-1"
                    @click.stop
                    @change.stop="selectSingle(node)"
                  />
                  <span class="el-like-cascader__node-label">
                    <slot :node="node" :data="node.data">{{ node.label }}</slot>
                  </span>
                  <Icon
                    v-if="node.loading"
                    icon="spinner"
                    spin
                    class="el-like-cascader__suffix"
                    :aria-label="loadingText"
                  />
                  <Icon
                    v-if="!isMultiple && isNodeChecked(node) && !canExpand(node)"
                    icon="check"
                    class="el-like-cascader__check"
                    aria-hidden="true"
                  />
                  <Icon
                    v-if="canExpand(node)"
                    icon="angle-right"
                    class="el-like-cascader__suffix"
                    aria-hidden="true"
                  />
                </div>
              </li>
            </ul>
          </template>
          <div v-else class="el-like-cascader__empty">{{ noDataText }}</div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import Icon from '@/components/Icon/Icon.vue'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  reactive,
  ref,
  shallowRef,
  triggerRef,
  useId,
  useTemplateRef,
  watch,
} from 'vue'
import type {
  CascaderNode,
  CascaderNodeValue,
  CascaderOption,
  CascaderPlacement,
  CascaderValue,
} from './props'
import { cascaderProps, defaultCascaderConfig } from './props'

defineOptions({
  name: 'ElLike-Cascader',
  inheritAttrs: false,
})

const props = defineProps(cascaderProps)
const emit = defineEmits<{
  'update:modelValue': [value: CascaderValue]
  change: [value: CascaderValue]
  'visible-change': [visible: boolean]
  'expand-change': [path: CascaderNodeValue[]]
  'remove-tag': [value: CascaderNodeValue | CascaderNodeValue[]]
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  'load-error': [error: unknown, node: CascaderNode]
}>()

const GAP = 6
const VIEWPORT_MARGIN = 8
const panelId = `el-like-cascader-${useId()}`
const radioGroup = `${panelId}-radio`

const rootRef = useTemplateRef<HTMLElement>('rootRef')
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')
const popperRef = useTemplateRef<HTMLElement>('popperRef')

const config = computed(() => ({ ...defaultCascaderConfig, ...props.props }))
const isMultiple = computed(() => config.value.multiple)
const isVisible = ref(false)
const positioned = ref(false)
const currentPlacement = ref<CascaderPlacement>(props.placement)
const activePath = ref<CascaderNode[]>([])
const rootNodes = shallowRef<CascaderNode[]>([])
const searchKeyword = ref('')
const filterKeyword = ref('')
const suggestionActiveIndex = ref(0)

let frameId: number | undefined
let filterTimer: ReturnType<typeof setTimeout> | undefined
let filterSequence = 0

// pathValues 而非数组下标作为节点身份：异步追加或源数据重排后仍能还原来选中值
const nodeMap = new Map<string, CascaderNode>()
const valueMap = new Map<CascaderNodeValue, CascaderNode[]>()

const nodeKey = (path: CascaderNodeValue[]) =>
  JSON.stringify(path.map((value) => [typeof value, value]))

const getNodePath = (node: CascaderNode): CascaderNode[] => {
  const path: CascaderNode[] = []
  let current: CascaderNode | null = node
  while (current) {
    path.unshift(current)
    current = current.parent
  }
  return path
}

const createNodes = (options: CascaderOption[], parent: CascaderNode | null): CascaderNode[] =>
  options.map((data, index) => {
    const rawValue = data[config.value.value]
    const value: CascaderNodeValue =
      typeof rawValue === 'string' || typeof rawValue === 'number' ? rawValue : index
    const rawChildren = data[config.value.children]
    const childOptions = Array.isArray(rawChildren) ? (rawChildren as CascaderOption[]) : []
    const pathValues = [...(parent?.pathValues ?? []), value]
    const node = reactive<CascaderNode>({
      data,
      value,
      label: String(data[config.value.label] ?? value),
      level: (parent?.level ?? 0) + 1,
      leaf: config.value.lazy ? data[config.value.leaf] === true : childOptions.length === 0,
      disabled: data[config.value.disabled] === true,
      loading: false,
      loaded: !config.value.lazy || childOptions.length > 0,
      parent,
      children: [],
      pathValues,
    })

    nodeMap.set(nodeKey(pathValues), node)
    const sameValueNodes = valueMap.get(value) ?? []
    sameValueNodes.push(node)
    valueMap.set(value, sameValueNodes)
    node.children = createNodes(childOptions, node)
    return node
  })

const rebuildNodes = () => {
  nodeMap.clear()
  valueMap.clear()
  rootNodes.value = createNodes(props.options, null)
  activePath.value = []
  if (isVisible.value) void nextTick(updatePosition)
}

// options 需要深度监听；结构配置则逐项比较。不能直接 watch 一个新数组，
// 否则内联传入等价的 props 对象也会因数组引用变化而丢弃已懒加载的子节点。
watch(() => props.options, rebuildNodes, { deep: true, immediate: true })
const structuralConfigKeys = ['value', 'label', 'children', 'disabled', 'leaf', 'lazy'] as const
watch(config, (next, previous) => {
  if (structuralConfigKeys.some((key) => next[key] !== previous[key])) rebuildNodes()
})

const allNodes = computed(() => {
  const result: CascaderNode[] = []
  const visit = (nodes: CascaderNode[]) => {
    for (const node of nodes) {
      result.push(node)
      visit(node.children)
    }
  }
  visit(rootNodes.value)
  return result
})

const cloneModelValue = (value: CascaderValue): CascaderValue => {
  if (!Array.isArray(value)) return value
  return value.map((item) => (Array.isArray(item) ? [...item] : item)) as CascaderValue
}

const checkedValue = ref<CascaderValue>(cloneModelValue(props.modelValue))
watch(
  () => props.modelValue,
  (value) => {
    checkedValue.value = cloneModelValue(value)
  },
  { deep: true },
)

const selectedPaths = computed<CascaderNodeValue[][]>(() => {
  const value = checkedValue.value
  if (isMultiple.value) {
    if (!Array.isArray(value)) return []
    if (config.value.emitPath) {
      return value
        .filter((item): item is CascaderNodeValue[] => Array.isArray(item))
        .map((path) => path.filter((item) => !Array.isArray(item)))
    }
    return value
      .filter((item): item is CascaderNodeValue => !Array.isArray(item))
      .map((item) => [item])
  }

  if (value === null) return []
  if (Array.isArray(value)) {
    if (!config.value.emitPath || value.some((item) => Array.isArray(item))) return []
    return [value as CascaderNodeValue[]]
  }
  return [[value]]
})

const canSelectNode = (node: CascaderNode) => config.value.checkStrictly || node.leaf

const selectedNodes = computed(() => {
  const result: CascaderNode[] = []
  const seen = new Set<string>()
  // 建立对响应式节点树的依赖，options 更新或懒加载追加子节点后重新解析选中值
  if (allNodes.value.length === 0) return result
  for (const path of selectedPaths.value) {
    if (path.length === 0) continue
    let node: CascaderNode | undefined
    if (config.value.emitPath) {
      node = nodeMap.get(nodeKey(path))
    } else {
      const firstValue = path[0]
      if (firstValue !== undefined) {
        node = valueMap.get(firstValue)?.find((candidate) => canSelectNode(candidate))
      }
    }
    if (!node || !canSelectNode(node) || seen.has(nodeKey(node.pathValues))) continue
    seen.add(nodeKey(node.pathValues))
    result.push(node)
  }
  return result
})

const selectedKeySet = computed(
  () => new Set(selectedNodes.value.map((node) => nodeKey(node.pathValues))),
)
const isNodeChecked = (node: CascaderNode) => selectedKeySet.value.has(nodeKey(node.pathValues))

const getNodeLabel = (node: CascaderNode) =>
  props.showAllLevels
    ? getNodePath(node)
        .map((item) => item.label)
        .join(props.separator)
    : node.label

const visibleTags = computed(() =>
  props.collapseTags ? selectedNodes.value.slice(0, props.maxCollapseTags) : selectedNodes.value,
)
const collapsedTagCount = computed(() => selectedNodes.value.length - visibleTags.value.length)
const collapsedTagsTitle = computed(() =>
  selectedNodes.value.slice(props.maxCollapseTags).map(getNodeLabel).join('，'),
)

const inputValue = computed(() => {
  if (isMultiple.value) return searchKeyword.value
  if (isVisible.value && props.filterable) return searchKeyword.value
  const selected = selectedNodes.value[0]
  return selected ? getNodeLabel(selected) : ''
})

const inputPlaceholder = computed(() => {
  const selected = selectedNodes.value[0]
  if (!selected) return props.placeholder
  if (!isMultiple.value && isVisible.value && props.filterable) return getNodeLabel(selected)
  return ''
})

const showClear = computed(
  () => props.clearable && !props.disabled && selectedNodes.value.length > 0,
)

const getRawNodeValue = (node: CascaderNode): CascaderNodeValue | CascaderNodeValue[] =>
  config.value.emitPath ? [...node.pathValues] : node.value

const emitSelection = (nodes: CascaderNode[]) => {
  let value: CascaderValue
  if (isMultiple.value) {
    value = nodes.map(getRawNodeValue) as CascaderValue
  } else {
    value = nodes[0] ? getRawNodeValue(nodes[0]) : null
  }
  checkedValue.value = cloneModelValue(value)
  emit('update:modelValue', value)
  emit('change', value)
}

const getDescendantLeaves = (node: CascaderNode): CascaderNode[] => {
  if (node.leaf) return [node]
  return node.children.flatMap(getDescendantLeaves)
}

const getSelectableLeaves = (node: CascaderNode) =>
  getDescendantLeaves(node).filter((item) => !item.disabled)

const getCheckboxState = (node: CascaderNode) => {
  if (config.value.checkStrictly || node.leaf) {
    return { checked: isNodeChecked(node), indeterminate: false }
  }
  const leaves = getSelectableLeaves(node)
  const count = leaves.filter(isNodeChecked).length
  const checked = leaves.length > 0 && count === leaves.length
  return { checked, indeterminate: count > 0 && !checked }
}

const isCheckboxDisabled = (node: CascaderNode) =>
  node.disabled ||
  (!config.value.checkStrictly && !node.leaf && getSelectableLeaves(node).length === 0)

const toggleNode = (node: CascaderNode) => {
  if (!isMultiple.value || isCheckboxDisabled(node)) return
  const current = [...selectedNodes.value]

  if (config.value.checkStrictly || node.leaf) {
    const index = current.findIndex((item) => nodeKey(item.pathValues) === nodeKey(node.pathValues))
    if (index >= 0) current.splice(index, 1)
    else current.push(node)
  } else {
    const leaves = getSelectableLeaves(node)
    const allChecked = leaves.length > 0 && leaves.every(isNodeChecked)
    if (allChecked) {
      const removing = new Set(leaves.map((item) => nodeKey(item.pathValues)))
      emitSelection(current.filter((item) => !removing.has(nodeKey(item.pathValues))))
      return
    }
    const existing = new Set(current.map((item) => nodeKey(item.pathValues)))
    current.push(...leaves.filter((item) => !existing.has(nodeKey(item.pathValues))))
  }
  emitSelection(current)
}

const removeNode = (node: CascaderNode) => {
  if (props.disabled) return
  const rawValue = getRawNodeValue(node)
  emitSelection(
    selectedNodes.value.filter((item) => nodeKey(item.pathValues) !== nodeKey(node.pathValues)),
  )
  emit('remove-tag', rawValue)
}

const clearValue = () => {
  if (!showClear.value) return
  checkedValue.value = isMultiple.value ? [] : null
  emit('update:modelValue', checkedValue.value)
  emit('change', checkedValue.value)
  emit('clear')
  activePath.value = []
}

const canExpand = (node: CascaderNode) =>
  node.children.length > 0 || (config.value.lazy && !node.loaded && !node.leaf)

const menus = computed(() => {
  const result: CascaderNode[][] = [rootNodes.value]
  for (const node of activePath.value) {
    if (node.children.length > 0) result.push(node.children)
  }
  return result
})

const isNodeActive = (node: CascaderNode) => activePath.value[node.level - 1] === node

const handleLoadError = (error: unknown, node: CascaderNode) => {
  node.loading = false
  node.loaded = false
  emit('load-error', error, node)
}

const loadNode = (node: CascaderNode) => {
  if (!config.value.lazy || node.loading || node.loaded || node.leaf) return
  const lazyLoad = config.value.lazyLoad
  if (!lazyLoad) {
    node.loaded = true
    node.leaf = true
    return
  }

  node.loading = true
  let settled = false
  const resolve = (data: CascaderOption[] = []) => {
    if (settled) return
    settled = true
    // options 在请求期间可能已重建，过期结果不能写回新树
    if (nodeMap.get(nodeKey(node.pathValues)) === node) {
      node.children = createNodes(data, node)
      node.loaded = true
      node.leaf = node.children.length === 0
      triggerRef(rootNodes)
    }
    node.loading = false
    void nextTick(updatePosition)
  }

  try {
    const result = lazyLoad(node, resolve)
    if (Array.isArray(result)) {
      resolve(result)
    } else if (result && typeof result === 'object' && 'then' in result) {
      void result
        .then((data) => resolve(Array.isArray(data) ? data : []))
        .catch((error: unknown) => {
          if (settled) return
          settled = true
          handleLoadError(error, node)
        })
    }
  } catch (error) {
    settled = true
    handleLoadError(error, node)
  }
}

const expandNode = async (node: CascaderNode) => {
  if (node.disabled || !canExpand(node)) return
  const changed = activePath.value[node.level - 1] !== node
  activePath.value = getNodePath(node)
  if (changed) emit('expand-change', [...node.pathValues])
  loadNode(node)
  await nextTick()
  updatePosition()
}

const closeDropdown = (restoreFocus = false) => {
  if (!isVisible.value) return
  isVisible.value = false
  positioned.value = false
  activePath.value = []
  searchKeyword.value = ''
  filterKeyword.value = ''
  filterSequence += 1
  clearTimeout(filterTimer)
  removeGlobalListeners()
  emit('visible-change', false)
  if (restoreFocus) void nextTick(() => inputRef.value?.focus({ preventScroll: true }))
}

const selectSingle = (node: CascaderNode) => {
  if (isMultiple.value || node.disabled || !canSelectNode(node)) return
  activePath.value = getNodePath(node)
  if (!isNodeChecked(node)) emitSelection([node])
  closeDropdown(true)
}

const handleNodeClick = (node: CascaderNode) => {
  if (node.disabled) return
  if (canExpand(node)) void expandNode(node)
  else activePath.value = getNodePath(node)

  if (isMultiple.value) {
    if (!canExpand(node)) toggleNode(node)
  } else if (canSelectNode(node)) {
    selectSingle(node)
  }
}

const handleNodeHover = (node: CascaderNode) => {
  if (config.value.expandTrigger === 'hover') void expandNode(node)
}

const isFiltering = computed(
  () => isVisible.value && props.filterable && filterKeyword.value.trim().length > 0,
)

const suggestions = computed(() => {
  const keyword = filterKeyword.value.trim()
  if (!keyword) return []
  return allNodes.value.filter((node) => {
    if (!canSelectNode(node)) return false
    if (props.filterMethod) return props.filterMethod(node, keyword)
    return getNodePath(node)
      .map((item) => item.label)
      .join(props.separator)
      .toLocaleLowerCase()
      .includes(keyword.toLocaleLowerCase())
  })
})

const scheduleFilter = async (keyword: string) => {
  const sequence = ++filterSequence
  clearTimeout(filterTimer)
  if (!keyword.trim()) {
    filterKeyword.value = ''
    return
  }

  const applyFilter = async () => {
    let allowed = true
    if (props.beforeFilter) {
      try {
        allowed = await props.beforeFilter(keyword)
      } catch {
        allowed = false
      }
    }
    if (sequence !== filterSequence) return
    filterKeyword.value = allowed ? keyword : ''
  }

  if (props.debounce > 0) filterTimer = setTimeout(() => void applyFilter(), props.debounce)
  else await applyFilter()
}

watch(searchKeyword, (keyword) => void scheduleFilter(keyword))
watch(filterKeyword, () => {
  suggestionActiveIndex.value = 0
})
watch(
  suggestions,
  (items) => {
    suggestionActiveIndex.value = Math.min(
      suggestionActiveIndex.value,
      Math.max(0, items.length - 1),
    )
  },
  { flush: 'post' },
)

const handleInput = (event: Event) => {
  searchKeyword.value = (event.target as HTMLInputElement).value
  if (!isVisible.value) void openDropdown(true)
}

const handleSuggestionClick = (node: CascaderNode) => {
  if (node.disabled) return
  if (isMultiple.value) toggleNode(node)
  else selectSingle(node)
}

const getNodeElementId = (node: CascaderNode) =>
  `${panelId}-node-${encodeURIComponent(nodeKey(node.pathValues))}`
const getSuggestionElementId = (index: number) => `${panelId}-suggestion-${index}`

const focusAdjacentNode = (event: KeyboardEvent, offset: number) => {
  const elements = Array.from(
    popperRef.value?.querySelectorAll<HTMLElement>(
      '.el-like-cascader__node:not([aria-disabled="true"])',
    ) ?? [],
  )
  const index = elements.indexOf(event.currentTarget as HTMLElement)
  const target = elements[index + offset]
  target?.focus()
}

const focusParentNode = (node: CascaderNode) => {
  if (!node.parent) return
  document.getElementById(getNodeElementId(node.parent))?.focus()
}

const expandAndFocus = async (node: CascaderNode) => {
  if (!canExpand(node)) return
  await expandNode(node)
  const firstChild = node.children[0]
  if (firstChild) document.getElementById(getNodeElementId(firstChild))?.focus()
}

const handleNodeSpace = (node: CascaderNode) => {
  if (isMultiple.value) toggleNode(node)
  else if (canSelectNode(node)) selectSingle(node)
  else void expandNode(node)
}

const handleInputKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isVisible.value) {
    event.preventDefault()
    closeDropdown(true)
    return
  }
  if ((event.key === 'ArrowDown' || event.key === 'Enter') && !isVisible.value) {
    event.preventDefault()
    void openDropdown()
    return
  }
  if (isFiltering.value) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const offset = event.key === 'ArrowDown' ? 1 : -1
      suggestionActiveIndex.value = Math.max(
        0,
        Math.min(suggestions.value.length - 1, suggestionActiveIndex.value + offset),
      )
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const node = suggestions.value[suggestionActiveIndex.value]
      if (node) handleSuggestionClick(node)
    }
  }
  if (
    event.key === 'Backspace' &&
    isMultiple.value &&
    !searchKeyword.value &&
    selectedNodes.value.length > 0
  ) {
    event.preventDefault()
    const lastNode = selectedNodes.value[selectedNodes.value.length - 1]
    if (lastNode) removeNode(lastNode)
  }
}

const handleTriggerClick = () => {
  if (props.disabled) return
  if (!isVisible.value) void openDropdown()
  else if (!props.filterable) closeDropdown()
}

const handleArrowClick = () => {
  if (props.disabled) return
  if (isVisible.value) closeDropdown()
  else void openDropdown()
}

const updatePosition = () => {
  const root = rootRef.value
  const popper = popperRef.value
  if (!root || !popper) return

  const triggerRect = root.getBoundingClientRect()
  const popperRect = popper.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const computePosition = (placement: CascaderPlacement) => {
    const top = placement.startsWith('top')
      ? triggerRect.top - popperRect.height - GAP
      : triggerRect.bottom + GAP
    const left = placement.endsWith('end') ? triggerRect.right - popperRect.width : triggerRect.left
    return { top, left }
  }

  let placement = props.placement
  let position = computePosition(placement)
  const fits =
    position.top >= VIEWPORT_MARGIN &&
    position.top + popperRect.height <= viewportHeight - VIEWPORT_MARGIN
  if (!fits) {
    const opposite = placement.startsWith('top')
      ? placement.replace('top', 'bottom')
      : placement.replace('bottom', 'top')
    const oppositePosition = computePosition(opposite as CascaderPlacement)
    if (
      oppositePosition.top >= VIEWPORT_MARGIN &&
      oppositePosition.top + popperRect.height <= viewportHeight - VIEWPORT_MARGIN
    ) {
      placement = opposite as CascaderPlacement
      position = oppositePosition
    }
  }

  position.left = Math.max(
    VIEWPORT_MARGIN,
    Math.min(position.left, viewportWidth - popperRect.width - VIEWPORT_MARGIN),
  )
  position.top = Math.max(
    VIEWPORT_MARGIN,
    Math.min(position.top, viewportHeight - popperRect.height - VIEWPORT_MARGIN),
  )
  currentPlacement.value = placement
  popper.style.left = `${position.left}px`
  popper.style.top = `${position.top}px`
  popper.style.minWidth = `${triggerRect.width}px`
  positioned.value = true
}

const schedulePositionUpdate = () => {
  if (frameId !== undefined) return
  if (typeof requestAnimationFrame !== 'function') {
    updatePosition()
    return
  }
  frameId = requestAnimationFrame(() => {
    frameId = undefined
    updatePosition()
  })
}

const handleDocumentMouseDown = (event: MouseEvent) => {
  const target = event.target as Node | null
  if (!target || rootRef.value?.contains(target) || popperRef.value?.contains(target)) return
  closeDropdown()
}

const addGlobalListeners = () => {
  document.addEventListener('mousedown', handleDocumentMouseDown)
  window.addEventListener('resize', schedulePositionUpdate)
  window.addEventListener('scroll', schedulePositionUpdate, true)
}

const removeGlobalListeners = () => {
  document.removeEventListener('mousedown', handleDocumentMouseDown)
  window.removeEventListener('resize', schedulePositionUpdate)
  window.removeEventListener('scroll', schedulePositionUpdate, true)
  if (frameId !== undefined) {
    cancelAnimationFrame(frameId)
    frameId = undefined
  }
}

async function openDropdown(preserveKeyword = false) {
  if (props.disabled || isVisible.value) return
  isVisible.value = true
  positioned.value = false
  if (!preserveKeyword) searchKeyword.value = ''
  filterKeyword.value = ''
  const selected = selectedNodes.value[0]
  activePath.value = selected ? getNodePath(selected) : []
  addGlobalListeners()
  emit('visible-change', true)
  await nextTick()
  updatePosition()
}

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) closeDropdown()
  },
)
watch(
  () => props.placement,
  () => {
    if (isVisible.value) void nextTick(updatePosition)
  },
)

onBeforeUnmount(() => {
  filterSequence += 1
  clearTimeout(filterTimer)
  removeGlobalListeners()
})

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  toggleDropDownVisible: (visible?: boolean) => {
    const nextVisible = visible ?? !isVisible.value
    if (nextVisible) void openDropdown()
    else closeDropdown()
  },
  updatePopperPosition: updatePosition,
  getCheckedNodes: (leafOnly = false) =>
    selectedNodes.value.filter((node) => !leafOnly || node.leaf),
})
</script>

<style lang="scss" scoped>
/* 组件样式统一维护在 styles/components/cascader.scss，与其他组件共享全局 token 体系 */
</style>

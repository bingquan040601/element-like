# Icon 图标

对 `@fortawesome/vue-fontawesome` 的二次封装：业务侧只需传入图标名（**不含 `fa-` 前缀**），组件内部固定拼接 `fa-solid` 前缀——无需感知 fontawesome「风格前缀 + fa- 前缀」的命名规则。

- 图标名称查询：[fontawesome 官网图标库](https://fontawesome.com/icons)（当前注册了 free 系列的 solid 全集）
- 图标颜色默认继承父级文字颜色，可用 `type`（语义色）或 `color`（自定义颜色）指定
- 组件已全局注册，模板中直接使用 `<ElLike-Icon>`，无需 import

## 何时使用

需要独立展示图标，或配合按钮、菜单、输入框等组件使用。

## 基础用法

通过 `icon` 传入图标名（不含 `fa-` 前缀）：

```vue
<ElLike-Icon icon="user-secret" />
<ElLike-Icon icon="bars" />
<ElLike-Icon icon="shield-halved" />
```

## 类型 type

`type` 提供 5 种语义色，颜色消费设计 token（`--el-color-*`），随主题自动切换：

```vue
<ElLike-Icon icon="circle-info" type="primary" />
<ElLike-Icon icon="circle-info" type="success" />
<ElLike-Icon icon="circle-info" type="warning" />
<ElLike-Icon icon="circle-info" type="danger" />
<ElLike-Icon icon="circle-info" type="info" />
```

## 尺寸 size

透传 fontawesome 的 `size`，支持字面档位（`lg`、`xl` 等）与倍率档位（`2x` 等）：

```vue
<ElLike-Icon icon="camera" size="lg" />
<ElLike-Icon icon="camera" size="2x" />
<ElLike-Icon icon="camera" size="3x" />
```

## 旋转与翻转 rotation / flip

透传 fontawesome 的 `rotation` 与 `flip`：

```vue
<ElLike-Icon icon="arrow-up" :rotation="90" />
<ElLike-Icon icon="arrow-trend-up" flip="horizontal" />
<ElLike-Icon icon="arrow-trend-up" flip="both" />
```

## 动画

一组布尔开关，写上即为开启；动画 keyframes 由 fontawesome 自动注入的 CSS 提供，无需额外引入：

```vue
<ElLike-Icon icon="spinner" spin />
<ElLike-Icon icon="circle-notch" spin-pulse />
<ElLike-Icon icon="heart" beat />
<ElLike-Icon icon="bell" shake />
```

## 自定义颜色 color

`color` 以行内样式作用于图标，**优先级高于 `type`**：

```vue
<ElLike-Icon icon="heart" color="#8e44ad" />
<ElLike-Icon icon="bell" type="danger" color="#8e44ad" />
```

## API

### Attributes

| 属性名       | 说明                                      | 类型            | 可选值                                                       | 默认值 |
| ------------ | ----------------------------------------- | --------------- | ------------------------------------------------------------ | ------ |
| icon         | 图标名称（不含 `fa-` 前缀）               | string          | [fontawesome 图标名](https://fontawesome.com/icons)（solid） | —      |
| type         | 主题类型，映射语义色                      | string          | primary / success / warning / danger / info                  | —      |
| size         | 图标大小                                  | string          | 2xs / xs / sm / lg / xl / 2xl / 1x ~ 10x                     | —      |
| rotation     | 旋转角度                                  | string / number | 90 / 180 / 270                                               | —      |
| flip         | 翻转方向                                  | string          | horizontal / vertical / both                                 | —      |
| spin         | 旋转动画                                  | boolean         | —                                                            | false  |
| spin-reverse | 反向旋转动画                              | boolean         | —                                                            | false  |
| spin-pulse   | 步进式旋转动画                            | boolean         | —                                                            | false  |
| pulse        | 脉冲缩放动画                              | boolean         | —                                                            | false  |
| bounce       | 弹跳动画                                  | boolean         | —                                                            | false  |
| shake        | 抖动动画                                  | boolean         | —                                                            | false  |
| beat         | 心跳缩放动画                              | boolean         | —                                                            | false  |
| fade         | 淡入淡出动画                              | boolean         | —                                                            | false  |
| beat-fade    | 心跳 + 淡入淡出动画                       | boolean         | —                                                            | false  |
| flash        | 闪烁动画                                  | boolean         | —                                                            | false  |
| color        | 自定义颜色（行内样式，优先级高于 `type`） | string          | —                                                            | —      |

> `size`、`rotation`、`flip` 与各动画属性原样透传给 `font-awesome-icon`，语义与 fontawesome 官方文档一致；`type`、`color` 是本组件的自有属性，只作用于包装层，不会下发。

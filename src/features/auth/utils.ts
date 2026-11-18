import type { LocationQueryValue } from 'vue-router'

/** 只接受站内绝对路径，阻止 //external、反斜杠等外部跳转变体。 */
export const getSafeRedirect = (
  value: LocationQueryValue | LocationQueryValue[] | undefined,
): string => {
  if (
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\')
  ) {
    return value
  }
  return '/'
}

export const getUserInitial = (user: { nickname: string; username: string }): string =>
  (user.nickname || user.username).slice(0, 1).toUpperCase()

export const PASSWORD_RULE_MESSAGE = '密码需为 8-72 位'

/** 与后端注册接口的长度约束保持一致；最终校验仍以服务端为准。 */
export const validateNewPassword = (password: string): string =>
  password.length >= 8 && password.length <= 72 ? '' : PASSWORD_RULE_MESSAGE

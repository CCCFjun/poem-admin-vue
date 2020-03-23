/*
  与后台交互模块 （依赖已封装的ajax函数）
 */
import ajax from '@/config/ajax'
const BASE_URL = "/api/admin"
// const BASE_URL = "http://101.37.13.111:8085/api/admin"

// 校验管理员登录
export const reqLogin = (ano, admPsw) => ajax(BASE_URL + '/adminLogin', { ano, admPsw }, 'POST')
// 请求退出登录
export const reqLogOut = () => ajax(BASE_URL + '/adminLogOut')

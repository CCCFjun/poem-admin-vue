import ajax from '@/config/ajax'
// const BASE_URL = "/api/admin"
const BASE_URL = "http://101.37.13.111:8085/api/admin"

// 获取全部用户信息
export const reqGetUserList = () => ajax(BASE_URL + '/getUserList')
// 请求更新用户登录状态
export const reqUpdateUserInfo = (row) => ajax(BASE_URL + '/updateUserInfo', row, 'POST')
// 请求搜索用户信息
export const reqSearchUserList = (userPhone, userName, userSex) => ajax(BASE_URL + '/searchUserInfo', { userPhone, userName, userSex })
// 请求添加用户信息
export const reqInsertUserInfo = (temp) => ajax(BASE_URL + '/insertUserInfo', temp, 'POST')

import ajax from '@/config/ajax'
// const BASE_URL = "/api/admin"
const BASE_URL = "http://101.37.13.111:8085/api/admin"

// 获取全部公告信息
export const reqGetNoticesList = () => ajax(BASE_URL + '/getNoticesList')
// 获取搜素公告信息
export const reqSearchNoticesList = (noticeContent, adminName) => ajax(BASE_URL + '/searchNoticesList', { noticeContent, adminName })
// 请求添加公告信息
export const reqInsertNoticeInfo = (temp) => ajax(BASE_URL + '/insertNoticeInfo', temp, 'POST')
// 请求更新公告内容
export const reqUpdateNoticeInfo = (row) => ajax(BASE_URL + '/updateNoticeInfo', row, 'POST')
// 请求删除公告
export const reqDeleteNotice = (noticeId) => ajax(BASE_URL + '/deleteNotice', { noticeId }, 'POST')

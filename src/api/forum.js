import ajax from '@/config/ajax'
// const BASE_URL = "/api/admin"
const BASE_URL = "http://101.37.13.111:8085/api/admin"

export const reqGetPostList = () => ajax(BASE_URL + '/getPostList')

// 获取搜素帖子信息
export const reqSearchPostList = (content, labelId) => ajax(BASE_URL + '/searchPostList', { content, labelId })
// 请求删除帖子
export const reqDeletePost = (pid) => ajax(BASE_URL + '/deletePost', { pid }, 'POST')
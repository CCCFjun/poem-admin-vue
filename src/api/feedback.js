import ajax from '@/config/ajax'
const BASE_URL = "/api/admin"
// const BASE_URL = "http://101.37.13.111:8085/api/admin"

// 获取未回复留言条数
export const reqGetUnReplyCount = () => ajax(BASE_URL + '/getUnReplyCount')
// 获取全部留言信息
export const reqGetFeedbacksList = () => ajax(BASE_URL + '/getFeedbacksList')
// 获取搜索留言信息
export const reqSearchFeedbacksList = (feedbackContent, userName, admAnswer, admName, feedbackStatus) => ajax(BASE_URL + '/searchFeedbacksList',
  { feedbackContent, userName, admAnswer, admName, feedbackStatus })
// 删除留言
export const reqDeleteFeedback = (feedbackId) => ajax(BASE_URL + '/deleteFeedback', { feedbackId }, 'POST')
// 回复留言
export const reqReplyFeedback = (temp) => ajax(BASE_URL + '/replyFeedback', temp, 'POST')

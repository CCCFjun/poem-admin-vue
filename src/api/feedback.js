import ajax from '@/config/ajax'
// const BASE_URL = "/api/admin"
const BASE_URL = "http://101.37.13.111:8085/api/admin"


// 获取全部留言信息
export const reqGetFeedbacksList = () => ajax(BASE_URL + '/getFeedbacksList')
// 获取搜索留言信息
export const reqSearchFeedbacksList = (feedbackContent) => ajax(BASE_URL + '/searchFeedbacksList',{ feedbackContent })
// 删除留言
export const reqDeleteFeedback = (feedbackId) => ajax(BASE_URL + '/deleteFeedback', { feedbackId }, 'POST')
// 删除留言
export const reqReadFeedbacks = (fid) => ajax(BASE_URL + '/readFeedback', { fid }, 'POST')

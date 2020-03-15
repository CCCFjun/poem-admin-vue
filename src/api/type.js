import ajax from '@/config/ajax'
const BASE_URL = '/api/admin'

// 获取全部题型信息
export const reqGetTypesList = () => ajax(BASE_URL + '/getTypesList')
// 获取搜索题型信息
export const reqSearchTypesList = (langName, isRecommend) => ajax(BASE_URL + '/searchTypesList', { langName, isRecommend })
// 请求添加题型信息
export const reqInsertTypeInfo = (temp) => ajax(BASE_URL + '/insertTypeInfo', temp, 'POST')
// 请求更新题型信息
export const reqUpdateTypeInfo = (row) => ajax(BASE_URL + '/updateTypeInfo', row, 'POST')
// 请求删除题型
export const reqDeleteType = (langId) => ajax(BASE_URL + '/deleteType', { langId }, 'POST')

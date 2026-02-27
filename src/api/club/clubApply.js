import request from '@/utils/request'

// 查询新社团申请列表
export function listClubApply(query) {
  return request({
    url: '/system/clubApply/list',
    method: 'get',
    params: query
  })
}

// 查询新社团申请详情
export function getClubApply(applyId) {
  return request({
    url: '/system/clubApply/' + applyId,
    method: 'get'
  })
}

// 审核新社团申请
export function reviewClubApply(data) {
  return request({
    url: '/system/clubApply/review',
    method: 'put',
    data: data
  })
}

// 删除新社团申请
export function delClubApply(applyId) {
  return request({
    url: '/system/clubApply/' + applyId,
    method: 'delete'
  })
}

// 导出新社团申请
export function exportClubApply(query) {
  return request({
    url: '/system/clubApply/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  })
}

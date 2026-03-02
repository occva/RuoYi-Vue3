import request from '@/utils/request'

// 获取社团列表
export function listClubs(query) {
  return request({
    url: '/api/app/club/list',
    method: 'get',
    params: query
  })
}

// 获取我的社团
export function getMyClubs() {
  return request({
    url: '/api/app/club/my',
    method: 'get'
  })
}

// 获取社团详情
export function getClub(id) {
  return request({
    url: '/api/app/club/' + id,
    method: 'get'
  })
}

// 获取热门社团
export function listPopularClubs(limit = 6) {
  return request({
    url: '/api/app/club/popular',
    method: 'get',
    params: { limit }
  })
}

// 申请创建社团
export function applyClub(data) {
  return request({
    url: '/api/app/club/apply',
    method: 'post',
    data: data
  })
}

// 申请加入社团
export function joinClub(data) {
  return request({
    url: '/api/app/club/join',
    method: 'post',
    data: data
  })
}

// 收藏/取消收藏社团
export function toggleFavorite(clubId) {
  return request({
    url: '/api/app/club/favorite/' + clubId,
    method: 'post'
  })
}

// 退出社团
export function quitClub(clubId) {
  return request({
    url: '/api/app/club/quit/' + clubId,
    method: 'post'
  })
}

// 撤回入社申请
export function cancelJoinApplication(applicationId) {
  return request({
    url: '/api/app/club/cancel-join/' + applicationId,
    method: 'post'
  })
}

// 撤回创建社团申请
export function cancelCreateApplication(applyId) {
  return request({
    url: '/api/app/club/cancel-create/' + applyId,
    method: 'post'
  })
}

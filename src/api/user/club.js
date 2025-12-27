import request from '@/utils/request'

// 获取社团列表
export function listClubs(query) {
  return request({
    url: '/api/user/club/list',
    method: 'get',
    params: query
  })
}

// 获取社团详情
export function getClub(id) {
  return request({
    url: '/api/user/club/' + id,
    method: 'get'
  })
}

// 获取热门社团
export function listPopularClubs(limit = 6) {
  return request({
    url: '/api/user/club/popular',
    method: 'get',
    params: { limit }
  })
}

// 申请创建社团
export function applyClub(data) {
  return request({
    url: '/api/user/club/apply',
    method: 'post',
    data: data
  })
}

// 申请加入社团
export function joinClub(data) {
  return request({
    url: '/api/user/club/join',
    method: 'post',
    data: data
  })
}

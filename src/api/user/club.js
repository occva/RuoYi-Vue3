import request from '@/utils/request'

// 获取社团列表
export function listClubs(query) {
  return request({
    url: '/mock/clubs.json',
    method: 'get',
    baseURL: '' // Override to use local public folder
  })
}

// 获取社团详情
export function getClub(id) {
  return request({
    url: '/mock/clubs.json',
    method: 'get',
    baseURL: ''
  }).then(res => {
    // 模拟后端根据ID查询
    const club = res.data.find(c => c.id === parseInt(id))
    if (club) {
      return {
        code: 200,
        msg: '操作成功',
        data: club
      }
    } else {
      return Promise.reject('未找到指定社团')
    }
  })
}

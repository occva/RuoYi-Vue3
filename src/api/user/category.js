import request from '@/utils/request'

// 获取分类列表
export function listCategories() {
    return request({
        url: '/api/user/category/list',
        method: 'get'
    })
}

// 获取分类详情
export function getCategory(id) {
    return request({
        url: '/api/user/category/' + id,
        method: 'get'
    })
}

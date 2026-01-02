import request from '@/utils/request'

// 查询社团荣誉/成就列表
export function listAchievement(query) {
    return request({
        url: '/system/achievement/list',
        method: 'get',
        params: query
    })
}

// 查询社团荣誉/成就详细
export function getAchievement(achievementId) {
    return request({
        url: '/system/achievement/' + achievementId,
        method: 'get'
    })
}

// 新增社团荣誉/成就
export function addAchievement(data) {
    return request({
        url: '/system/achievement',
        method: 'post',
        data: data
    })
}

// 修改社团荣誉/成就
export function updateAchievement(data) {
    return request({
        url: '/system/achievement',
        method: 'put',
        data: data
    })
}

// 删除社团荣誉/成就
export function delAchievement(achievementId) {
    return request({
        url: '/system/achievement/' + achievementId,
        method: 'delete'
    })
}

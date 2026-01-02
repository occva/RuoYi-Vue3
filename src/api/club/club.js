import request from '@/utils/request'

// 查询社团列表
export function listClub(query) {
    return request({
        url: '/system/club/list',
        method: 'get',
        params: query
    })
}

// 查询社团详细
export function getClub(clubId) {
    return request({
        url: '/system/club/' + clubId,
        method: 'get'
    })
}

// 新增社团
export function addClub(data) {
    return request({
        url: '/system/club',
        method: 'post',
        data: data
    })
}

// 修改社团
export function updateClub(data) {
    return request({
        url: '/system/club',
        method: 'put',
        data: data
    })
}

// 删除社团
export function delClub(clubId) {
    return request({
        url: '/system/club/' + clubId,
        method: 'delete'
    })
}

// 修改社团状态
export function updateClubStatus(clubIds, status) {
    const data = {
        clubIds,
        status
    }
    return request({
        url: '/system/club/status',
        method: 'put',
        data: data
    })
}

// 设置热门社团
export function updateClubPopular(clubIds, isPopular) {
    const data = {
        clubIds,
        isPopular
    }
    return request({
        url: '/system/club/popular',
        method: 'put',
        data: data
    })
}

// 导出社团
export function exportClub(query) {
    return request({
        url: '/system/club/export',
        method: 'post',
        params: query,
        responseType: 'blob'
    })
}

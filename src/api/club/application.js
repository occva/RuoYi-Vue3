import request from '@/utils/request'

// 查询入社申请列表
export function listApplication(query) {
    return request({
        url: '/system/application/list',
        method: 'get',
        params: query
    })
}

// 查询入社申请详细
export function getApplication(applicationId) {
    return request({
        url: '/system/application/' + applicationId,
        method: 'get'
    })
}

// 审核入社申请
export function reviewApplication(data) {
    return request({
        url: '/system/application/review',
        method: 'put',
        data: data
    })
}

// 删除入社申请
export function delApplication(applicationId) {
    return request({
        url: '/system/application/' + applicationId,
        method: 'delete'
    })
}

// 导出入社申请
export function exportApplication(query) {
    return request({
        url: '/system/application/export',
        method: 'post',
        params: query,
        responseType: 'blob'
    })
}

// 获取入社申请统计数据
export function getApplicationStat(query) {
    return request({
        url: '/system/application/stat',
        method: 'get',
        params: query
    })
}

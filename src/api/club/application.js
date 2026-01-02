import request from '@/utils/request'

// 查询入社申请列表
export function listApplication(query) {
    return request({
        url: '/club/application/list',
        method: 'get',
        params: query
    })
}

// 查询入社申请详细
export function getApplication(applicationId) {
    return request({
        url: '/club/application/' + applicationId,
        method: 'get'
    })
}

// 审核入社申请
export function reviewApplication(data) {
    return request({
        url: '/club/application/review',
        method: 'put',
        data: data
    })
}

// 删除入社申请
export function delApplication(applicationId) {
    return request({
        url: '/club/application/' + applicationId,
        method: 'delete'
    })
}

import request from '@/utils/request'

// 查询活动报名列表
export function listRegistration(query) {
    return request({
        url: '/club/registration/list',
        method: 'get',
        params: query
    })
}

// 查询活动报名详细
export function getRegistration(registrationId) {
    return request({
        url: '/club/registration/' + registrationId,
        method: 'get'
    })
}

// 修改活动报名
export function updateRegistration(data) {
    return request({
        url: '/club/registration',
        method: 'put',
        data: data
    })
}

// 签到
export function checkin(registrationId) {
    return request({
        url: '/club/registration/checkin/' + registrationId,
        method: 'put'
    })
}

// 删除活动报名
export function delRegistration(registrationId) {
    return request({
        url: '/club/registration/' + registrationId,
        method: 'delete'
    })
}

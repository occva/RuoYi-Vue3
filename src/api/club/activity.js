import request from '@/utils/request'

// 查询社团活动列表
export function listActivity(query) {
    return request({
        url: '/club/activity/list',
        method: 'get',
        params: query
    })
}

// 查询社团活动详细
export function getActivity(activityId) {
    return request({
        url: '/club/activity/' + activityId,
        method: 'get'
    })
}

// 新增社团活动
export function addActivity(data) {
    return request({
        url: '/club/activity',
        method: 'post',
        data: data
    })
}

// 修改社团活动
export function updateActivity(data) {
    return request({
        url: '/club/activity',
        method: 'put',
        data: data
    })
}

// 删除社团活动
export function delActivity(activityId) {
    return request({
        url: '/club/activity/' + activityId,
        method: 'delete'
    })
}

// 获取活动统计数据
export function getActivityStat(query) {
    return request({
        url: '/club/activity/stat',
        method: 'get',
        params: query
    })
}

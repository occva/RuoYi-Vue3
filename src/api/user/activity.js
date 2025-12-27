import request from '@/utils/request'

// 获取活动列表
export function listActivities(query) {
    return request({
        url: '/api/user/activity/list',
        method: 'get',
        params: query
    })
}

// 获取社团的活动列表
export function listActivitiesByClub(clubId) {
    return request({
        url: '/api/user/activity/club/' + clubId,
        method: 'get'
    })
}

// 获取活动详情
export function getActivity(id) {
    return request({
        url: '/api/user/activity/' + id,
        method: 'get'
    })
}

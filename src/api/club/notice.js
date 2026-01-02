import request from '@/utils/request'

// 查询社团公告列表
export function listNotice(query) {
    return request({
        url: '/club/notice/list',
        method: 'get',
        params: query
    })
}

// 查询社团公告详细
export function getNotice(noticeId) {
    return request({
        url: '/club/notice/' + noticeId,
        method: 'get'
    })
}

// 新增社团公告
export function addNotice(data) {
    return request({
        url: '/club/notice',
        method: 'post',
        data: data
    })
}

// 修改社团公告
export function updateNotice(data) {
    return request({
        url: '/club/notice',
        method: 'put',
        data: data
    })
}

// 删除社团公告
export function delNotice(noticeId) {
    return request({
        url: '/club/notice/' + noticeId,
        method: 'delete'
    })
}

import request from '@/utils/request'

// 获取公告列表
export function listNotices(query) {
    return request({
        url: '/api/user/notice/list',
        method: 'get',
        params: query
    })
}

// 获取社团的公告列表
export function listNoticesByClub(clubId) {
    return request({
        url: '/api/user/notice/club/' + clubId,
        method: 'get'
    })
}

// 获取公告详情
export function getNotice(id) {
    return request({
        url: '/api/user/notice/' + id,
        method: 'get'
    })
}

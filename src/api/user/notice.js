import request from '@/utils/request'

// 获取公告列表
export function listNotices(query) {
    return request({
        url: '/api/app/notice/list',
        method: 'get',
        params: query
    })
}

// 获取社团的公告列表
export function listNoticesByClub(clubId) {
    return request({
        url: '/api/app/notice/club/' + clubId,
        method: 'get'
    })
}

// 获取公告详情
export function getNotice(id) {
    return request({
        url: '/api/app/notice/' + id,
        method: 'get'
    })
}

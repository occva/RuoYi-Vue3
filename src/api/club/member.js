import request from '@/utils/request'

// 查询社团成员列表
export function listMember(query) {
    return request({
        url: '/club/member/list',
        method: 'get',
        params: query
    })
}

// 查询社团成员详细
export function getMember(memberId) {
    return request({
        url: '/club/member/' + memberId,
        method: 'get'
    })
}

// 新增社团成员
export function addMember(data) {
    return request({
        url: '/club/member',
        method: 'post',
        data: data
    })
}

// 修改社团成员
export function updateMember(data) {
    return request({
        url: '/club/member',
        method: 'put',
        data: data
    })
}

// 删除社团成员
export function delMember(memberId) {
    return request({
        url: '/club/member/' + memberId,
        method: 'delete'
    })
}

// 导出社团成员
export function exportMember(query) {
    return request({
        url: '/club/member/export',
        method: 'post',
        params: query,
        responseType: 'blob'
    })
}

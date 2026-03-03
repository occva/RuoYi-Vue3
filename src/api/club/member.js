import request from '@/utils/request'

// 查询社团成员列表
export function listMember(query) {
    return request({
        url: '/system/member/list',
        method: 'get',
        params: query
    })
}

// 查询社团成员详细
export function getMember(memberId) {
    return request({
        url: '/system/member/' + memberId,
        method: 'get'
    })
}

// 新增社团成员
export function addMember(data) {
    return request({
        url: '/system/member',
        method: 'post',
        data: data
    })
}

// 修改社团成员
export function updateMember(data) {
    return request({
        url: '/system/member',
        method: 'put',
        data: data
    })
}

// 转让社长
export function transferPresident(data) {
    return request({
        url: '/system/member/transfer-president',
        method: 'put',
        data: data
    })
}

// 任命副社长
export function appointVicePresident(data) {
    return request({
        url: '/system/member/appoint-vice-president',
        method: 'put',
        data: data
    })
}

// 撤销副社长
export function revokeVicePresident(data) {
    return request({
        url: '/system/member/revoke-vice-president',
        method: 'put',
        data: data
    })
}

// 删除社团成员
export function delMember(memberId) {
    return request({
        url: '/system/member/' + memberId,
        method: 'delete'
    })
}

// 导出社团成员
export function exportMember(query) {
    return request({
        url: '/system/member/export',
        method: 'post',
        params: query,
        responseType: 'blob'
    })
}

// 获取成员统计数据
export function getMemberStat(query) {
    return request({
        url: '/system/member/stat',
        method: 'get',
        params: query
    })
}

import request from '@/utils/request'

export function getNotificationSummary() {
  return request({
    url: '/api/app/notification/summary',
    method: 'get'
  })
}

export function listNotifications(query) {
  return request({
    url: '/api/app/notification/list',
    method: 'get',
    params: query
  })
}

export function markNotificationRead(data) {
  return request({
    url: '/api/app/notification/read',
    method: 'post',
    data
  })
}

export function markAllNotificationsRead() {
  return request({
    url: '/api/app/notification/read-all',
    method: 'post'
  })
}

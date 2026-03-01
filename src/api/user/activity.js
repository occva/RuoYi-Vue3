import request from '@/utils/request'

export function listActivities(query) {
  return request({
    url: '/api/app/activity/list',
    method: 'get',
    params: query
  })
}

export function listActivitiesByClub(clubId) {
  return request({
    url: '/api/app/activity/club/' + clubId,
    method: 'get'
  })
}

export function listMyActivities() {
  return request({
    url: '/api/app/activity/my',
    method: 'get'
  })
}

export function getActivity(id) {
  return request({
    url: '/api/app/activity/' + id,
    method: 'get'
  })
}

export function registerActivity(activityId) {
  return request({
    url: '/api/app/activity/register/' + activityId,
    method: 'post'
  })
}

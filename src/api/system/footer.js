import request from '@/utils/request'

export function getFooterConfig() {
  return request({
    url: '/system/footer',
    method: 'get'
  })
}

export function updateFooterConfig(data) {
  return request({
    url: '/system/footer',
    method: 'put',
    data
  })
}

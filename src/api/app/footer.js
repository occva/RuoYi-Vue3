import request from '@/utils/request'

export function getFooterConfig() {
  return request({
    url: '/api/app/footer',
    method: 'get',
    headers: {
      isToken: false
    }
  })
}

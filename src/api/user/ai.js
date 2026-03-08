import request from '@/utils/request'
import { getToken } from '@/utils/auth'

const GUEST_ID_KEY = 'ai_guest_id'
const baseApi = import.meta.env.VITE_APP_BASE_API || ''

function generateGuestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `guest_${crypto.randomUUID()}`
  }
  return `guest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

function getGuestId() {
  const cached = localStorage.getItem(GUEST_ID_KEY)
  if (cached) {
    return cached
  }
  const guestId = generateGuestId()
  localStorage.setItem(GUEST_ID_KEY, guestId)
  return guestId
}

function buildHeaders(extraHeaders = {}) {
  const headers = {
    'X-AI-Guest-Id': getGuestId(),
    ...extraHeaders
  }
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

export function sendMessage(data) {
  return request({
    url: '/api/app/ai/chat',
    method: 'post',
    headers: buildHeaders(),
    data
  })
}

export function getChatHistory(sessionId) {
  return request({
    url: '/api/app/ai/chat/history',
    method: 'get',
    headers: buildHeaders(),
    params: { sessionId }
  })
}

export function getActiveSession() {
  return request({
    url: '/api/app/ai/chat/session',
    method: 'get',
    headers: buildHeaders()
  })
}

export function streamChat(sessionId, message, { onChunk, onDone, onError }) {
  const controller = new AbortController()

  fetch(`${baseApi}/api/app/ai/chat/stream`, {
    method: 'POST',
    headers: buildHeaders({
      Accept: 'text/event-stream',
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ sessionId, message }),
    signal: controller.signal
  })
    .then(async response => {
      const contentType = response.headers.get('content-type') || ''

      if (!response.ok || !contentType.includes('text/event-stream')) {
        let messageText = `请求失败（${response.status}）`
        if (response.status === 429) {
          messageText = '未登录用户最多可对话5次，请登录后继续'
        }
        try {
          const payload = await response.json()
          messageText = payload?.msg || payload?.message || messageText
        } catch (parseError) {
          const payloadText = await response.text().catch(() => '')
          if (payloadText) {
            const firstDataLine = payloadText
              .split('\n')
              .find(line => line.trim().startsWith('data:'))
            if (firstDataLine) {
              const sseText = firstDataLine.replace(/^data:\s*/, '').trim()
              messageText = sseText || messageText
            } else {
              messageText = payloadText
            }
          }
        }
        throw new Error(messageText)
      }

      if (!response.body) {
        throw new Error('浏览器不支持流式响应')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      function read() {
        reader.read()
          .then(({ done, value }) => {
            if (done) {
              onDone?.()
              return
            }

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (!line.startsWith('data:')) {
                continue
              }
              const data = line.slice(5).trim()
              if (!data) {
                continue
              }
              if (data === '[DONE]') {
                onDone?.()
                return
              }
              onChunk?.(data)
            }

            read()
          })
          .catch(err => {
            if (err.name !== 'AbortError') {
              onError?.(err)
            }
          })
      }

      read()
    })
    .catch(err => {
      if (err.name !== 'AbortError') {
        onError?.(err)
      }
    })

  return () => controller.abort()
}

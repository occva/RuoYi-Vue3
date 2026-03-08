<template>
  <div class="ai-assistant-container">
    <transition name="ai-fab">
      <button v-if="!isOpen" class="ai-float-btn" @click="openChat" title="社团助手">
        <span class="fab-pulse"></span>
        <svg class="fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/>
          <circle cx="12" cy="10" r="1" fill="currentColor" stroke="none"/>
          <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/>
        </svg>
      </button>
    </transition>

    <transition name="ai-window">
      <div v-if="isOpen" class="ai-chat-window">
        <div class="ai-header">
          <div class="ai-header-left">
            <div class="ai-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z"/><circle cx="9" cy="14" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="14" r="1.5" fill="currentColor" stroke="none"/><path d="M9 18h6" stroke-linecap="round"/></svg>
            </div>
            <div class="ai-header-info">
              <span class="ai-name">社团智能助手</span>
              <span class="ai-status">
                <span class="status-dot"></span>
                在线
              </span>
            </div>
          </div>
          <button class="ai-close-btn" @click="closeChat" title="关闭">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="ai-messages" ref="messagesRef">
          <div v-if="messages.length === 0" class="ai-welcome">
            <div class="welcome-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z"/><circle cx="9" cy="14" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="14" r="1.5" fill="currentColor" stroke="none"/><path d="M9 18h6" stroke-linecap="round"/></svg>
            </div>
            <h3 class="welcome-title">你好，我是你的社团助手</h3>
            <p class="welcome-desc">可以帮你查询社团、活动和加入流程。</p>
            <div class="preset-questions">
              <button v-for="q in presetQuestions" :key="q" class="preset-btn" @click="sendPreset(q)">
                {{ q }}
              </button>
            </div>
          </div>

          <template v-for="msg in messages" :key="msg.id">
            <div :class="['msg-row', msg.role === 'user' ? 'msg-user' : 'msg-ai']">
              <div v-if="msg.role === 'assistant'" class="msg-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z"/><circle cx="9" cy="14" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="14" r="1.5" fill="currentColor" stroke="none"/><path d="M9 18h6" stroke-linecap="round"/></svg>
              </div>
              <div :class="['msg-bubble', msg.role === 'user' ? 'bubble-user' : 'bubble-ai']">
                <div v-if="msg.role === 'assistant'" class="msg-content" v-html="renderMarkdown(msg.content)"></div>
                <div v-else class="msg-content">{{ msg.content }}</div>
              </div>
            </div>
          </template>

          <div v-if="isTyping && !streamingReplyStarted" class="msg-row msg-ai">
            <div class="msg-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z"/><circle cx="9" cy="14" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="14" r="1.5" fill="currentColor" stroke="none"/><path d="M9 18h6" stroke-linecap="round"/></svg>
            </div>
            <div class="msg-bubble bubble-ai typing-bubble">
              <div class="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="messages.length > 0 && !isTyping" class="quick-actions">
          <button v-for="q in quickQuestions" :key="q" class="quick-btn" @click="sendPreset(q)">{{ q }}</button>
        </div>

        <div class="ai-input-area">
          <div class="input-wrapper">
            <textarea
              ref="inputRef"
              v-model="inputValue"
              placeholder="输入你的问题..."
              rows="1"
              @keydown.enter.exact.prevent="handleSend"
              @input="autoResize"
            ></textarea>
          </div>
          <button class="send-btn" :disabled="!inputValue.trim() || isTyping" @click="handleSend">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted, onUnmounted, computed } from 'vue'
import { streamChat, getChatHistory, getActiveSession } from '@/api/user/ai'
import useUserStore from '@/store/modules/user'

const isOpen = ref(false)
const inputValue = ref('')
const isTyping = ref(false)
const streamingReplyStarted = ref(false)
const messagesRef = ref(null)
const inputRef = ref(null)
const sessionId = ref('')
let abortStream = null

const messages = ref([])
const CHAT_SESSION_KEY_PREFIX = 'ai_chat_session:'
const userStore = useUserStore()
const identityScope = computed(() => userStore.id ? `user:${userStore.id}` : 'guest')

const presetQuestions = [
  '有哪些社团？',
  '如何加入社团？',
  '如何创建社团？',
  '近期有什么活动？'
]

const quickQuestions = [
  '推荐社团',
  '编程社团',
  '活动查询'
]

onMounted(() => {
  void initSession(identityScope.value, { forceRemote: true })
})

watch(identityScope, (nextScope, prevScope) => {
  if (nextScope === prevScope) return
  stopStreaming()
  messages.value = []
  inputValue.value = ''
  void initSession(nextScope, { forceRemote: true }).then(() => {
    if (isOpen.value) {
      loadHistory()
    }
  })
})

function getSessionStorageKey(scope) {
  return `${CHAT_SESSION_KEY_PREFIX}${scope}`
}

function isUserScope(scope) {
  return typeof scope === 'string' && scope.startsWith('user:')
}

function extractSessionId(payload) {
  if (!payload) return ''
  if (typeof payload.sessionId === 'string') return payload.sessionId.trim()
  if (payload.data && typeof payload.data.sessionId === 'string') return payload.data.sessionId.trim()
  return ''
}

async function resolveRemoteSessionId() {
  try {
    const res = await getActiveSession()
    return extractSessionId(res)
  } catch (_) {
    return ''
  }
}

async function initSession(scope, options = {}) {
  const key = getSessionStorageKey(scope)
  const saved = (localStorage.getItem(key) || '').trim()
  let nextSessionId = ''

  if (isUserScope(scope) && options.forceRemote) {
    nextSessionId = await resolveRemoteSessionId()
  }

  if (!nextSessionId) {
    nextSessionId = saved
  }

  if (!nextSessionId) {
    nextSessionId = generateSessionId()
  }

  sessionId.value = nextSessionId
  localStorage.setItem(key, nextSessionId)
}

function generateSessionId() {
  return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

async function openChat() {
  isOpen.value = true
  if (!sessionId.value) {
    await initSession(identityScope.value, { forceRemote: true })
  }
  if (sessionId.value && messages.value.length === 0) {
    await loadHistory()
  }
  nextTick(() => inputRef.value?.focus())
}

function stopStreaming() {
  if (abortStream) {
    abortStream()
    abortStream = null
  }
  isTyping.value = false
  streamingReplyStarted.value = false
}

function closeChat() {
  stopStreaming()
  isOpen.value = false
}

onUnmounted(() => {
  stopStreaming()
})

async function loadHistory() {
  try {
    const res = await getChatHistory(sessionId.value)
    const data = res.data || res
    if (Array.isArray(data) && data.length > 0) {
      messages.value = data
        .filter(m => m.role !== 'system')
        .map((m, i) => ({
          id: m.id || `${m.role}_${i}`,
          role: m.role,
          content: m.content || ''
        }))
      scrollToBottom()
    }
  } catch (_) {
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTo({
        top: messagesRef.value.scrollHeight,
        behavior: 'smooth'
      })
    }
  })
}

watch([() => messages.value.length, isOpen], () => {
  scrollToBottom()
})

function autoResize() {
  const el = inputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
}

function sendPreset(question) {
  inputValue.value = question.replace(/^[^\s]*\s/, '')
  handleSend()
}

function handleSend() {
  const msg = inputValue.value.trim()
  if (!msg || isTyping.value) return

  messages.value.push({
    id: `u_${Date.now()}`,
    role: 'user',
    content: msg
  })

  inputValue.value = ''
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
    }
  })

  isTyping.value = true
  streamingReplyStarted.value = false
  scrollToBottom()

  const aiMsgId = `ai_${Date.now()}`
  abortStream = streamChat(sessionId.value, msg, {
    onChunk: (chunk) => {
      let aiMsg = messages.value.find(m => m.id === aiMsgId)
      if (!aiMsg) {
        aiMsg = { id: aiMsgId, role: 'assistant', content: '' }
        messages.value.push(aiMsg)
      }
      if (!streamingReplyStarted.value) {
        streamingReplyStarted.value = true
      }
      aiMsg.content += chunk
      scrollToBottom()
    },
    onDone: () => {
      isTyping.value = false
      streamingReplyStarted.value = false
      abortStream = null
      const aiMsg = messages.value.find(m => m.id === aiMsgId)
      if (!aiMsg) {
        messages.value.push({
          id: aiMsgId,
          role: 'assistant',
          content: '抱歉，暂未获取到有效回复，请稍后重试。'
        })
      }
      scrollToBottom()
    },
    onError: (err) => {
      isTyping.value = false
      streamingReplyStarted.value = false
      abortStream = null
      const fallbackText = err?.message || '抱歉，连接出现问题，请稍后重试。'
      const aiMsg = messages.value.find(m => m.id === aiMsgId)
      if (aiMsg) {
        if (!aiMsg.content) aiMsg.content = fallbackText
      } else {
        messages.value.push({
          id: aiMsgId,
          role: 'assistant',
          content: fallbackText
        })
      }
      scrollToBottom()
    }
  })
}

function renderMarkdown(text) {
  if (!text) return ''
  const escaped = normalizeMessageText(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const lines = escaped.split('\n')
  const blocks = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i].trim()
    if (!line) {
      i += 1
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const firstNumber = Number((line.match(/^(\d+)\.\s+/) || [])[1] || 1)
      const items = []
      while (i < lines.length) {
        const current = lines[i].trim()
        const headMatch = current.match(/^(\d+)\.\s+(.+)$/)
        if (!headMatch) break
        i += 1

        const itemBlocks = [`<div>${renderInlineMarkdown(headMatch[2])}</div>`]
        const subItems = []

        while (i < lines.length) {
          const nextLine = lines[i].trim()
          if (!nextLine) {
            i += 1
            continue
          }
          if (/^\d+\.\s+/.test(nextLine)) {
            break
          }

          const bulletMatch = nextLine.match(/^[-*]\s+(.+)$/)
          if (bulletMatch) {
            subItems.push(`<li>${renderInlineMarkdown(bulletMatch[1])}</li>`)
            i += 1
            continue
          }

          itemBlocks.push(`<div>${renderInlineMarkdown(nextLine)}</div>`)
          i += 1
        }

        if (subItems.length > 0) {
          itemBlocks.push(`<ul class="md-list md-list-ul">${subItems.join('')}</ul>`)
        }
        items.push(`<li>${itemBlocks.join('')}</li>`)
      }
      blocks.push(`<ol class="md-list md-list-ol" start="${firstNumber}">${items.join('')}</ol>`)
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const items = []
      while (i < lines.length) {
        const current = lines[i].trim()
        const match = current.match(/^[-*]\s+(.+)$/)
        if (!match) break
        items.push(`<li>${renderInlineMarkdown(match[1])}</li>`)
        i += 1
      }
      blocks.push(`<ul class="md-list md-list-ul">${items.join('')}</ul>`)
      continue
    }

    blocks.push(`<p>${renderInlineMarkdown(line)}</p>`)
    i += 1
  }

  return blocks.join('')
}

function normalizeMessageText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/(\S)\s+(\d+\.\s)/g, '$1\n$2')
    .replace(/([^\n])(\d+\.\s)/g, (all, prev, marker) => (/\s/.test(prev) ? all : `${prev}\n${marker}`))
    .replace(/([^\n])([-*]\s)/g, (all, prev, marker) => (/\s/.test(prev) ? all : `${prev}\n${marker}`))
}

function renderInlineMarkdown(content) {
  return content
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
}
</script>
<style lang="scss" scoped>
.ai-assistant-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif;
}

/* ===== 濞搭喖濮╅幐澶愭尦 ===== */
.ai-float-btn {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 8px 24px -6px rgba(37, 99, 235, 0.55),
    0 2px 8px -2px rgba(37, 99, 235, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    transform: scale(1.08) translateY(-2px);
    box-shadow:
      0 12px 32px -4px rgba(37, 99, 235, 0.6),
      0 4px 12px -2px rgba(37, 99, 235, 0.35);
  }

  &:active {
    transform: scale(0.96);
  }

  .fab-icon {
    width: 24px;
    height: 24px;
    position: relative;
    z-index: 1;
  }

  .fab-pulse {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.25);
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.15); opacity: 0; }
}

/* ===== 閼卞﹤銇夌粣妤€褰?===== */
.ai-chat-window {
  position: fixed;
  bottom: 1rem;
  right: 1.5rem;
  width: min(420px, calc(100vw - 2rem));
  height: min(620px, calc(100vh - 6rem));
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid rgba(148, 174, 226, 0.25);
  box-shadow:
    0 25px 60px -12px rgba(15, 60, 160, 0.2),
    0 8px 24px -8px rgba(15, 60, 160, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.8) inset;
}

/* ===== Header ===== */
.ai-header {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 40%, #3b82f6 100%);
  padding: 0.85rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.08), transparent);
    pointer-events: none;
  }
}

.ai-header-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  position: relative;
  z-index: 1;
}

.ai-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;

  svg {
    width: 20px;
    height: 20px;
  }
}

.ai-header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-name {
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.01em;
}

.ai-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 6px rgba(74, 222, 128, 0.6);
}

.ai-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  position: relative;
  z-index: 1;

  svg { width: 16px; height: 16px; }

  &:hover {
    background: rgba(255, 255, 255, 0.22);
    color: #fff;
  }
}

/* ===== Messages ===== */
.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: linear-gradient(180deg, #f8faff 0%, #ffffff 100%);

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(148, 174, 226, 0.3);
    border-radius: 10px;
  }
}

/* Welcome */
.ai-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1rem 1rem;
}

.welcome-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #dbeafe, #eff6ff);
  border: 1px solid rgba(147, 178, 235, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  margin-bottom: 0.85rem;

  svg { width: 28px; height: 28px; }
}

.welcome-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.35rem;
}

.welcome-desc {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0 0 1.2rem;
}

.preset-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  justify-content: center;
  padding: 0 0.5rem;
}

.preset-btn {
  padding: 0.5rem 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(147, 178, 235, 0.35);
  background: #fff;
  color: #374151;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    border-color: #3b82f6;
    color: #1d4ed8;
    background: #eff6ff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px -4px rgba(59, 130, 246, 0.25);
  }
}

/* Message rows */
.msg-row {
  display: flex;
  gap: 0.5rem;
  max-width: 100%;
  animation: msgIn 0.3s ease-out;
}

@keyframes msgIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.msg-user {
  justify-content: flex-end;
}

.msg-ai {
  justify-content: flex-start;
}

.msg-avatar {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #dbeafe, #eff6ff);
  border: 1px solid rgba(147, 178, 235, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  flex-shrink: 0;
  margin-top: 2px;

  svg { width: 15px; height: 15px; }
}

.msg-bubble {
  max-width: 82%;
  padding: 0.65rem 0.85rem;
  border-radius: 14px;
  font-size: 0.88rem;
  line-height: 1.6;
  word-wrap: break-word;
}

.bubble-ai {
  background: #fff;
  color: #1f2937;
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-top-left-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.bubble-user {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  border-top-right-radius: 4px;
  box-shadow: 0 2px 8px -2px rgba(37, 99, 235, 0.35);
}

/* Markdown content */
.msg-content {
  :deep(p) {
    margin: 0 0 0.45rem 0;
  }

  :deep(p:last-child) {
    margin-bottom: 0;
  }

  :deep(strong) {
    font-weight: 700;
    color: #111827;
  }

  :deep(em) {
    font-style: italic;
  }

  :deep(code) {
    background: rgba(243, 244, 246, 0.8);
    padding: 0.1em 0.35em;
    border-radius: 4px;
    font-size: 0.85em;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    color: #e11d48;
  }

  :deep(.md-list) {
    margin: 0.35rem 0 0.35rem 1.25rem;
    padding-left: 0.2rem;
  }

  :deep(.md-list li) {
    margin: 0.2rem 0;
  }

  :deep(.md-list-ol) {
    list-style: decimal;
  }

  :deep(.md-list-ul) {
    list-style: disc;
  }
}

.bubble-user .msg-content {
  :deep(strong) { color: #fff; }
  :deep(code) {
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
  }
}

/* Typing indicator */
.typing-bubble {
  padding: 0.75rem 1rem;
}

.typing-dots {
  display: flex;
  gap: 4px;

  span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #94a3b8;
    animation: typingBounce 1.4s infinite ease-in-out;
    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes typingBounce {
  0%, 80%, 100% { transform: scale(1); opacity: 0.4; }
  40% { transform: scale(1.2); opacity: 1; }
}

/* Quick actions */
.quick-actions {
  display: flex;
  gap: 0.35rem;
  padding: 0.45rem 1rem;
  overflow-x: auto;
  flex-shrink: 0;
  border-top: 1px solid rgba(243, 244, 246, 0.8);

  &::-webkit-scrollbar { height: 0; }
}

.quick-btn {
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(209, 213, 219, 0.6);
  background: #fff;
  color: #4b5563;
  font-size: 0.72rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    color: #2563eb;
    background: #f0f7ff;
  }
}

/* ===== Input ===== */
.ai-input-area {
  padding: 0.65rem 0.85rem;
  background: #fff;
  border-top: 1px solid rgba(229, 231, 235, 0.6);
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}

.input-wrapper {
  flex: 1;
  background: #f9fafb;
  border: 1px solid rgba(209, 213, 219, 0.75);
  border-radius: 12px;
  padding: 0.5rem 0.75rem;
  transition: all 0.2s;

  &:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background: #fff;
  }

  textarea {
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    background: transparent;
    font-size: 0.88rem;
    line-height: 1.5;
    color: #111827;
    font-family: inherit;
    max-height: 120px;

    &::placeholder {
      color: #9ca3af;
    }
  }
}

.send-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
  box-shadow: 0 4px 12px -4px rgba(37, 99, 235, 0.45);

  svg { width: 16px; height: 16px; }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px -4px rgba(37, 99, 235, 0.5);
  }

  &:active:not(:disabled) {
    transform: scale(0.96);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    box-shadow: none;
  }
}

/* ===== Transitions ===== */
.ai-fab-enter-active { animation: fabIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.ai-fab-leave-active { animation: fabIn 0.2s ease-in reverse; }

@keyframes fabIn {
  from { opacity: 0; transform: scale(0.5) rotate(-15deg); }
  to { opacity: 1; transform: scale(1) rotate(0deg); }
}

.ai-window-enter-active { animation: windowIn 0.35s cubic-bezier(0.34, 1.2, 0.64, 1); }
.ai-window-leave-active { animation: windowIn 0.2s ease-in reverse; }

@keyframes windowIn {
  from { opacity: 0; transform: translateY(16px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ===== Mobile ===== */
@media (max-width: 640px) {
  .ai-chat-window {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
    border: none;
  }

  .ai-float-btn {
    width: 50px;
    height: 50px;
  }

  .ai-assistant-container {
    bottom: 1rem;
    right: 1rem;
  }
}
</style>

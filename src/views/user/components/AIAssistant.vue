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
      <div v-if="isOpen" :class="['ai-chat-window', isDocked ? 'is-docked' : '']">
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
          <div class="ai-header-actions">
            <button class="ai-icon-btn" @click="toggleHistory" title="历史会话">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5h18M3 12h18M3 19h18"/></svg>
            </button>
            <button class="ai-icon-btn" @click="toggleDocked" :title="isDocked ? '恢复小窗' : '侧边全屏'">
              <svg v-if="!isDocked" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M16 3v3a2 2 0 0 0 2 2h3"/><path d="M8 21v-3a2 2 0 0 0-2-2H3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>
            </button>
            <button class="ai-icon-btn" @click="startNewChat" title="新对话">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            </button>
            <button class="ai-icon-btn" @click="closeChat" title="关闭">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <div v-if="showHistory" class="history-panel">
          <div class="history-head">
            <span>历史会话</span>
            <button class="history-refresh" @click="loadSessions" title="刷新">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>
            </button>
          </div>
          <div v-if="sessionsLoading" class="history-empty">加载中...</div>
          <div v-else-if="chatSessions.length === 0" class="history-empty">暂无历史会话</div>
          <div v-else class="history-list">
            <div
              v-for="item in chatSessions"
              :key="item.sessionId"
              :class="['history-item', item.sessionId === sessionId ? 'is-active' : '']"
            >
              <button class="history-select" @click="switchSession(item.sessionId)">
                <span class="history-title">{{ item.title || '新对话' }}</span>
                <span class="history-meta">{{ formatSessionTime(item.latestTime) }} · {{ item.messageCount || 0 }} 条</span>
              </button>
              <button class="history-delete" @click="removeSession(item.sessionId)" title="删除会话">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
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
                <ToolTraceBlock v-if="msg.role === 'assistant'" :tools="msg.tools" />
                <div v-if="msg.role === 'assistant'" class="msg-content" v-html="renderMarkdown(msg.content)"></div>
                <div v-else class="msg-content">{{ msg.content }}</div>
                <div v-if="canShowMessageActions(msg)" class="msg-actions">
                  <button
                    type="button"
                    class="msg-action-btn"
                    :class="{ 'is-done': copiedMessageId === msg.id }"
                    :title="copiedMessageId === msg.id ? '已复制' : '复制'"
                    :aria-label="copiedMessageId === msg.id ? '已复制' : '复制'"
                    @click="copyMessage(msg)"
                  >
                    <el-icon><Check v-if="copiedMessageId === msg.id" /><CopyDocument v-else /></el-icon>
                  </button>
                  <button
                    v-if="canRegenerateMessage(msg)"
                    type="button"
                    class="msg-action-btn"
                    title="重新生成"
                    aria-label="重新生成"
                    @click="regenerateMessage(msg)"
                  >
                    <el-icon><RefreshRight /></el-icon>
                  </button>
                </div>
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
          <button type="button" class="quick-refresh-btn" title="换一批" aria-label="换一批" @click="changeQuickQuestions">
            <el-icon><RefreshRight /></el-icon>
          </button>
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
          <button
            class="send-btn"
            :class="{ 'is-pausing': isTyping }"
            :disabled="!inputValue.trim() && !isTyping"
            :title="isTyping ? '暂停回复' : '发送'"
            :aria-label="isTyping ? '暂停回复' : '发送'"
            @click="handleSendButton"
          >
            <svg v-if="isTyping" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="7" y="6" width="3.5" height="12" rx="1"></rect>
              <rect x="13.5" y="6" width="3.5" height="12" rx="1"></rect>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check, CopyDocument, RefreshRight } from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'
import { streamChat, getChatHistory, getActiveSession, getChatSessions, deleteChatSession } from '@/api/user/ai'
import useUserStore from '@/store/modules/user'
import ToolTraceBlock from './ToolTraceBlock.vue'

const isOpen = ref(false)
const inputValue = ref('')
const isTyping = ref(false)
const streamingReplyStarted = ref(false)
const isDocked = ref(false)
const messagesRef = ref(null)
const inputRef = ref(null)
const sessionId = ref('')
const showHistory = ref(false)
const sessionsLoading = ref(false)
const chatSessions = ref([])
const activeAssistantMessageId = ref('')
const copiedMessageId = ref('')
const quickQuestionPage = ref(0)
let abortStream = null
let copiedTimer = null
let overlayObserver = null

const messages = ref([])
const CHAT_SESSION_KEY_PREFIX = 'ai_chat_session:'
const CHAT_UI_STATE_KEY = 'ai_chat_ui_state'
const KEEP_OPEN_ROUTE_NAMES = new Set(['UserHome', 'UserClubList', 'UserActivities', 'UserMyClubs'])
const userStore = useUserStore()
const route = useRoute()
const identityScope = computed(() => userStore.id ? `user:${userStore.id}` : 'guest')
const markdownRenderer = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  typographer: false
})

const presetQuestions = [
  '有哪些社团？',
  '如何加入社团？',
  '如何创建社团？',
  '近期有什么活动？',
  '推荐几个适合新生的社团',
  '我报名了哪些活动？',
  '我的入社申请状态？',
  '收藏的社团有哪些？'
]

const QUICK_QUESTION_BATCH_SIZE = 3
const quickQuestionPool = [
  '推荐社团',
  '编程社团',
  '活动查询',
  '我的社团',
  '我的收藏',
  '报名活动',
  '申请状态',
  '招新社团',
  '公益活动',
  '文艺社团',
  '体育社团',
  '创建社团'
]

const latestAssistantMessageId = computed(() => {
  for (let i = messages.value.length - 1; i >= 0; i -= 1) {
    const msg = messages.value[i]
    if (msg.role === 'assistant' && msg.content) {
      return msg.id
    }
  }
  return ''
})

const quickQuestions = computed(() => {
  const start = quickQuestionPage.value * QUICK_QUESTION_BATCH_SIZE
  const selected = quickQuestionPool.slice(start, start + QUICK_QUESTION_BATCH_SIZE)

  if (selected.length === QUICK_QUESTION_BATCH_SIZE) {
    return selected
  }

  return selected.concat(quickQuestionPool.slice(0, QUICK_QUESTION_BATCH_SIZE - selected.length))
})

onMounted(() => {
  window.addEventListener('ai-assistant:close', closeChat)
  watchElementPlusOverlays()
  restoreUiState()
  void initSession(identityScope.value, { forceRemote: true }).then(() => {
    if (isOpen.value) {
      loadHistory()
      loadSessions()
      nextTick(() => inputRef.value?.focus())
    }
  })
})

watch([isOpen, isDocked], () => {
  syncDockedLayout()
  persistUiState()
}, { immediate: true })

watch(
  () => route.name,
  (nextName, prevName) => {
    if (!prevName || !isOpen.value) return
    if (isKeepOpenRoute(nextName)) {
      syncDockedLayout()
      persistUiState()
      return
    }
    closeChat()
  }
)

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

function isKeepOpenRoute(routeName) {
  return KEEP_OPEN_ROUTE_NAMES.has(String(routeName || ''))
}

function readUiState() {
  if (typeof sessionStorage === 'undefined') {
    return null
  }

  try {
    return JSON.parse(sessionStorage.getItem(CHAT_UI_STATE_KEY) || '{}')
  } catch (_) {
    return null
  }
}

function restoreUiState() {
  if (!isKeepOpenRoute(route.name)) {
    return
  }

  const state = readUiState()
  if (!state?.isOpen) {
    return
  }

  isOpen.value = true
  isDocked.value = state.isDocked === true
}

function persistUiState() {
  if (typeof sessionStorage === 'undefined') {
    return
  }

  if (!isKeepOpenRoute(route.name) || !isOpen.value) {
    sessionStorage.removeItem(CHAT_UI_STATE_KEY)
    return
  }

  sessionStorage.setItem(CHAT_UI_STATE_KEY, JSON.stringify({
    isOpen: true,
    isDocked: isDocked.value === true
  }))
}

async function openChat() {
  isOpen.value = true
  if (!sessionId.value) {
    await initSession(identityScope.value, { forceRemote: true })
  }
  if (sessionId.value && messages.value.length === 0) {
    await loadHistory()
  }
  loadSessions()
  nextTick(() => inputRef.value?.focus())
}

function stopStreaming() {
  if (abortStream) {
    abortStream()
    abortStream = null
  }
  activeAssistantMessageId.value = ''
  isTyping.value = false
  streamingReplyStarted.value = false
}

function closeChat() {
  stopStreaming()
  isOpen.value = false
  persistUiState()
}

function toggleDocked() {
  isDocked.value = !isDocked.value
  scrollToBottom()
  nextTick(() => inputRef.value?.focus())
}

function syncDockedLayout() {
  setDockedLayout(isOpen.value && isDocked.value)
}

function setDockedLayout(enabled) {
  if (typeof document === 'undefined') return
  document.body.classList.toggle('ai-assistant-docked', enabled)
}

function watchElementPlusOverlays() {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') {
    return
  }

  overlayObserver = new MutationObserver((mutations) => {
    if (!isOpen.value) return

    const hasOverlay = mutations.some(mutation =>
      Array.from(mutation.addedNodes).some(node => isElementPlusOverlay(node))
    )

    if (hasOverlay) {
      closeChat()
    }
  })

  overlayObserver.observe(document.body, { childList: true })
}

function isElementPlusOverlay(node) {
  if (!(node instanceof HTMLElement)) {
    return false
  }

  return node.classList.contains('el-overlay') ||
    node.classList.contains('el-message-box__wrapper') ||
    node.classList.contains('el-drawer__wrapper') ||
    Boolean(node.querySelector('.el-overlay, .el-message-box__wrapper, .el-drawer__wrapper'))
}

function startNewChat() {
  stopStreaming()
  showHistory.value = false
  messages.value = []
  inputValue.value = ''
  sessionId.value = generateSessionId()
  localStorage.setItem(getSessionStorageKey(identityScope.value), sessionId.value)
  nextTick(() => inputRef.value?.focus())
}

async function toggleHistory() {
  showHistory.value = !showHistory.value
  if (showHistory.value) {
    await loadSessions()
  }
}

async function loadSessions() {
  sessionsLoading.value = true
  try {
    const res = await getChatSessions()
    const data = res.data || res
    chatSessions.value = Array.isArray(data) ? data : []
  } catch (_) {
    chatSessions.value = []
  } finally {
    sessionsLoading.value = false
  }
}

async function switchSession(nextSessionId) {
  if (!nextSessionId || nextSessionId === sessionId.value) {
    showHistory.value = false
    return
  }
  stopStreaming()
  sessionId.value = nextSessionId
  localStorage.setItem(getSessionStorageKey(identityScope.value), sessionId.value)
  messages.value = []
  inputValue.value = ''
  showHistory.value = false
  await loadHistory()
  nextTick(() => inputRef.value?.focus())
}

async function removeSession(targetSessionId) {
  if (!targetSessionId) return
  try {
    await deleteChatSession(targetSessionId)
    chatSessions.value = chatSessions.value.filter(item => item.sessionId !== targetSessionId)
    if (targetSessionId === sessionId.value) {
      messages.value = []
      sessionId.value = generateSessionId()
      localStorage.setItem(getSessionStorageKey(identityScope.value), sessionId.value)
    }
  } catch (_) {
  }
}

onUnmounted(() => {
  stopStreaming()
  window.removeEventListener('ai-assistant:close', closeChat)
  overlayObserver?.disconnect()
  overlayObserver = null
  if (copiedTimer) {
    clearTimeout(copiedTimer)
    copiedTimer = null
  }
  setDockedLayout(false)
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
          content: m.content || '',
          tools: m.tools || []
        }))
    }
    scrollToBottom()
  } catch (_) {
  }
}

function formatSessionTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const pad = n => String(n).padStart(2, '0')
  if (isToday) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`
  }
  return `${date.getMonth() + 1}/${date.getDate()}`
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

function changeQuickQuestions() {
  const totalPages = Math.ceil(quickQuestionPool.length / QUICK_QUESTION_BATCH_SIZE)
  quickQuestionPage.value = (quickQuestionPage.value + 1) % totalPages
}

function handleSendButton() {
  if (isTyping.value) {
    stopStreaming()
    return
  }
  handleSend()
}

function handleSend() {
  const msg = inputValue.value.trim()
  if (!msg || isTyping.value) return
  submitMessage(msg, { appendUser: true })
}

function submitMessage(msg, options = {}) {
  const appendUser = options.appendUser !== false

  if (appendUser) {
    messages.value.push({
      id: `u_${Date.now()}`,
      role: 'user',
      content: msg
    })
  }

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
  activeAssistantMessageId.value = aiMsgId
  abortStream = streamChat(sessionId.value, msg, {
    onTool: (tool) => {
      let aiMsg = messages.value.find(m => m.id === aiMsgId)
      if (!aiMsg) {
        aiMsg = { id: aiMsgId, role: 'assistant', content: '', tools: [] }
        messages.value.push(aiMsg)
      }
      if (!Array.isArray(aiMsg.tools)) {
        aiMsg.tools = []
      }
      aiMsg.tools.push(tool)
      scrollToBottom()
    },
    onChunk: (chunk) => {
      let aiMsg = messages.value.find(m => m.id === aiMsgId)
      if (!aiMsg) {
        aiMsg = { id: aiMsgId, role: 'assistant', content: '', tools: [] }
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
      activeAssistantMessageId.value = ''
      const aiMsg = messages.value.find(m => m.id === aiMsgId)
      if (!aiMsg) {
        messages.value.push({
          id: aiMsgId,
          role: 'assistant',
          content: '抱歉，暂未获取到有效回复，请稍后重试。',
          tools: []
        })
      }
      loadSessions()
      scrollToBottom()
    },
    onError: (err) => {
      isTyping.value = false
      streamingReplyStarted.value = false
      abortStream = null
      activeAssistantMessageId.value = ''
      const fallbackText = err?.message || '抱歉，连接出现问题，请稍后重试。'
      const aiMsg = messages.value.find(m => m.id === aiMsgId)
      if (aiMsg) {
        if (!aiMsg.content) aiMsg.content = fallbackText
      } else {
        messages.value.push({
          id: aiMsgId,
          role: 'assistant',
          content: fallbackText,
          tools: []
        })
      }
      scrollToBottom()
    }
  })
}

function canShowMessageActions(msg) {
  return msg.role === 'assistant' && Boolean(msg.content) && msg.id !== activeAssistantMessageId.value
}

function canRegenerateMessage(msg) {
  return canShowMessageActions(msg) && msg.id === latestAssistantMessageId.value && !isTyping.value
}

async function copyMessage(msg) {
  const text = msg?.content || ''
  if (!text) return

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.setAttribute('readonly', 'readonly')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      textarea.style.pointerEvents = 'none'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    copiedMessageId.value = msg.id
    if (copiedTimer) {
      clearTimeout(copiedTimer)
    }
    copiedTimer = window.setTimeout(() => {
      copiedMessageId.value = ''
      copiedTimer = null
    }, 1400)
  } catch (_) {
    ElMessage.error('复制失败，请手动选择文本')
  }
}

function regenerateMessage(msg) {
  if (!canRegenerateMessage(msg)) return

  const assistantIndex = messages.value.findIndex(item => item.id === msg.id)
  if (assistantIndex <= 0) return

  for (let i = assistantIndex - 1; i >= 0; i -= 1) {
    const prev = messages.value[i]
    if (prev.role === 'user' && prev.content) {
      messages.value.splice(assistantIndex, messages.value.length - assistantIndex)
      submitMessage(prev.content, { appendUser: false })
      return
    }
  }
}

function renderMarkdown(text) {
  if (!text) return ''
  return markdownRenderer.render(normalizeMessageText(text))
}

function normalizeMessageText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
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

:global(body) {
  --ai-docked-width: min(430px, 100vw);
}

:global(body.ai-assistant-docked) {
  padding-right: var(--ai-docked-width);
  overflow-x: hidden;
  transition: padding-right 0.22s ease;
}

:global(body.ai-assistant-docked .fixed-header),
:global(body.ai-assistant-docked .navbar),
:global(body.ai-assistant-docked .app-header),
:global(body.ai-assistant-docked .layout-header) {
  right: var(--ai-docked-width);
  width: auto;
  transition: right 0.22s ease, width 0.22s ease;
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

.ai-chat-window.is-docked {
  top: 0;
  right: 0;
  bottom: 0;
  width: min(430px, 100vw);
  height: 100vh;
  border-radius: 0;
  border-top: none;
  border-right: none;
  border-bottom: none;
  box-shadow: -1px 0 0 rgba(148, 163, 184, 0.26);
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

.ai-header-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  position: relative;
  z-index: 1;
}

.ai-icon-btn {
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

  svg { width: 16px; height: 16px; }

  &:hover {
    background: rgba(255, 255, 255, 0.22);
    color: #fff;
  }
}

.history-panel {
  flex-shrink: 0;
  max-height: 220px;
  overflow: hidden;
  background: #f8fafc;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  padding: 0.65rem 0.85rem;
}

.history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #0f172a;
  font-size: 0.82rem;
  font-weight: 700;
}

.history-refresh {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    color: #2563eb;
    background: #e0ecff;
  }
}

.history-list {
  display: grid;
  gap: 0.35rem;
  max-height: 160px;
  overflow-y: auto;
  padding-right: 0.15rem;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.35);
    border-radius: 999px;
  }
}

.history-item {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 8px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.36rem 0.42rem 0.36rem 0.6rem;

  &:hover {
    border-color: rgba(59, 130, 246, 0.35);
    background: #eff6ff;
  }

  &.is-active {
    border-color: #3b82f6;
    background: #dbeafe;
  }
}

.history-select {
  min-width: 0;
  flex: 1;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0.08rem 0;
  text-align: left;
  display: grid;
  gap: 0.12rem;
}

.history-delete {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 13px;
    height: 13px;
  }

  &:hover {
    color: #dc2626;
    background: #fee2e2;
  }
}

.history-title {
  color: #1f2937;
  font-size: 0.8rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-meta {
  color: #94a3b8;
  font-size: 0.68rem;
}

.history-empty {
  padding: 0.8rem 0;
  color: #94a3b8;
  font-size: 0.78rem;
  text-align: center;
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
  line-height: 1.68;
  word-wrap: break-word;
  overflow-wrap: anywhere;
}

.ai-chat-window.is-docked .msg-bubble {
  max-width: 88%;
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
  letter-spacing: 0;

  :deep(p) {
    margin: 0 0 0.62rem 0;
  }

  :deep(p:last-child),
  :deep(ul:last-child),
  :deep(ol:last-child) {
    margin-bottom: 0;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    margin: 0.75rem 0 0.48rem;
    color: #111827;
    font-weight: 800;
    line-height: 1.35;
    letter-spacing: 0;
  }

  :deep(h1) {
    font-size: 1.08rem;
  }

  :deep(h2) {
    font-size: 1rem;
  }

  :deep(h3),
  :deep(h4) {
    font-size: 0.94rem;
  }

  :deep(h1:first-child),
  :deep(h2:first-child),
  :deep(h3:first-child),
  :deep(h4:first-child) {
    margin-top: 0;
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

  :deep(pre) {
    margin: 0.65rem 0;
    padding: 0.68rem 0.78rem;
    overflow-x: auto;
    border-radius: 8px;
    background: #0f172a;
    color: #e2e8f0;
    line-height: 1.58;
  }

  :deep(pre code) {
    background: transparent;
    padding: 0;
    color: inherit;
  }

  :deep(ul),
  :deep(ol) {
    margin: 0.45rem 0 0.45rem 1.2rem;
    padding-left: 0.45rem;
  }

  :deep(li) {
    margin: 0.42rem 0;
    padding-left: 0.1rem;
  }

  :deep(li::marker) {
    color: #2563eb;
    font-weight: 800;
  }

  :deep(blockquote) {
    margin: 0.65rem 0;
    padding: 0.1rem 0 0.1rem 0.75rem;
    border-left: 3px solid #93c5fd;
    color: #475569;
  }

  :deep(table) {
    display: block;
    width: 100%;
    max-width: 100%;
    margin: 0.7rem 0;
    overflow-x: auto;
    border-collapse: collapse;
    border-spacing: 0;
    font-size: 0.9rem;
    line-height: 1.55;
  }

  :deep(thead) {
    background: #f8fafc;
  }

  :deep(th),
  :deep(td) {
    min-width: 5.5rem;
    padding: 0.42rem 0.55rem;
    border: 1px solid rgba(148, 163, 184, 0.32);
    text-align: left;
    vertical-align: top;
    white-space: normal;
    word-break: break-word;
  }

  :deep(th) {
    color: #111827;
    font-weight: 700;
  }

  :deep(hr) {
    margin: 0.7rem 0;
    border: none;
    border-top: 1px solid rgba(148, 163, 184, 0.22);
  }

  :deep(a) {
    color: #1d4ed8;
    text-decoration: none;
    font-weight: 600;
  }

  :deep(a:hover) {
    text-decoration: underline;
  }
}

.bubble-user .msg-content {
  :deep(strong) { color: #fff; }
  :deep(code) {
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
  }
}

.msg-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.35rem;
  margin-top: 0.42rem;
  padding-top: 0.42rem;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
}

.msg-action-btn {
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  padding: 0;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s ease;

  .el-icon {
    font-size: 15px;
  }

  &:hover {
    color: #1d4ed8;
    background: #eff6ff;
  }

  &.is-done {
    color: #16a34a;
    background: #dcfce7;
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

.quick-refresh-btn {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid rgba(209, 213, 219, 0.68);
  background: #fff;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 30px;
  cursor: pointer;
  transition: all 0.2s;

  .el-icon {
    font-size: 14px;
  }

  &:hover {
    border-color: #3b82f6;
    color: #2563eb;
    background: #f0f7ff;
    transform: rotate(18deg);
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

  &.is-pausing {
    background: linear-gradient(135deg, #64748b, #94a3b8);
    box-shadow: 0 4px 12px -4px rgba(71, 85, 105, 0.45);
  }

  &.is-pausing:hover {
    box-shadow: 0 6px 16px -4px rgba(71, 85, 105, 0.5);
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
  :global(body.ai-assistant-docked) {
    padding-right: 0;
  }

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

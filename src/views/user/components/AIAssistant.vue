<template>
  <div class="ai-assistant-container">
    <!-- 悬浮按钮 -->
    <transition name="fade">
      <button v-if="!isOpen" class="ai-float-btn" @click="isOpen = true" title="社团助手">
        <el-icon :size="24"><ChatLineSquare /></el-icon>
      </button>
    </transition>

    <!-- 聊天窗口 -->
    <transition name="slide-up">
      <div v-if="isOpen" class="ai-chat-window">
        <div class="ai-header">
          <div class="ai-title">
            <el-icon><Service /></el-icon>
            社团智能助手
          </div>
          <button class="ai-close-btn" @click="isOpen = false">
            <el-icon><Close /></el-icon>
          </button>
        </div>

        <div class="ai-messages" ref="messagesRef">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message-row"
            :style="{ justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start' }"
          >
            <div v-if="msg.type === 'ai'" class="ai-avatar">
              <el-icon><Service /></el-icon>
            </div>
            <div :class="['message', msg.type === 'ai' ? 'message-ai' : 'message-user']">
              {{ msg.text }}
            </div>
          </div>
          <div v-if="isTyping" class="message-row">
            <div class="ai-avatar"><el-icon><Service /></el-icon></div>
            <div class="message message-ai typing">正在输入...</div>
          </div>
        </div>

        <div class="ai-input-area">
          <el-input
            v-model="inputValue"
            placeholder="输入你的问题..."
            @keyup.enter="handleSend"
          />
          <el-button type="primary" circle :disabled="!inputValue.trim()" @click="handleSend">
            <el-icon><Promotion /></el-icon>
          </el-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

const isOpen = ref(false)
const inputValue = ref('')
const isTyping = ref(false)
const messagesRef = ref(null)

const messages = ref([
  { id: 1, type: 'ai', text: '你好！我是社团智能助手。我可以为你介绍各个社团，或者回答关于加入社团的问题。' }
])

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

watch([messages, isOpen], () => {
  scrollToBottom()
})

const handleSend = () => {
  if (!inputValue.value.trim()) return

  const userMsg = { id: Date.now(), type: 'user', text: inputValue.value }
  messages.value.push(userMsg)
  const query = inputValue.value
  inputValue.value = ''
  isTyping.value = true

  setTimeout(() => {
    const responseText = generateResponse(query)
    messages.value.push({ id: Date.now() + 1, type: 'ai', text: responseText })
    isTyping.value = false
  }, 1000)
}

const generateResponse = (query) => {
  const lowerQuery = query.toLowerCase()
  if (lowerQuery.includes('编程') || lowerQuery.includes('coding')) {
    return '"编程魔法师"社团非常适合你！他们每周三晚上聚会，讨论最新的技术栈（如React, Node.js），还经常举办黑客马拉松。'
  }
  if (lowerQuery.includes('音乐') || lowerQuery.includes('music')) {
    return '如果你喜欢音乐，一定要去看看"乐器合奏团"。他们每周一排练，经常在校园活动中表演。'
  }
  if (lowerQuery.includes('摄影') || lowerQuery.includes('photo')) {
    return '"摄影俱乐部"是捕捉美好瞬间的好去处。他们组织外出采风，并且有定期的作品展览。'
  }
  if (lowerQuery.includes('辩论') || lowerQuery.includes('debate')) {
    return '"辩论协会"可以锻炼你的口才和逻辑思维。他们每周二讨论热点话题。'
  }
  if (lowerQuery.includes('加入') || lowerQuery.includes('报名')) {
    return '加入社团非常简单！只需点击社团卡片进入详情页，然后点击"申请加入"按钮填写申请表即可。'
  }
  if (lowerQuery.includes('你好') || lowerQuery.includes('hi')) {
    return '你好！有什么我可以帮你的吗？'
  }
  return '抱歉，我暂时无法回答这个问题。你可以尝试询问关于"编程"、"音乐"、"摄影"等特定社团的信息。'
}
</script>

<style lang="scss" scoped>
.ai-assistant-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}

.ai-float-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
  border: none;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: scale(1.1);
  }
}

.ai-chat-window {
  position: fixed;
  bottom: 1rem;
  right: 2rem;
  width: 25vw;
  min-width: 320px;
  max-width: 450px;
  height: 60vh;
  min-height: 400px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.ai-header {
  background: linear-gradient(to right, #3b82f6, #60a5fa);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.ai-title {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ai-close-btn {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

.ai-messages {
  flex: 1;
  background-color: #f9fafb;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-row {
  display: flex;
  align-items: flex-end;
}

.ai-avatar {
  width: 24px;
  height: 24px;
  background: #e0e7ff;
  color: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.message {
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-ai {
  background-color: white;
  color: #1f2937;
  border-bottom-left-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.message-user {
  background-color: #3b82f6;
  color: white;
  border-bottom-right-radius: 2px;
}

.typing {
  font-style: italic;
  color: #9ca3af;
}

.ai-input-area {
  padding: 1rem;
  background: white;
  border-top: 1px solid #f3f4f6;
  display: flex;
  gap: 0.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  animation: slideUp 0.3s ease-out;
}
.slide-up-leave-active {
  animation: slideUp 0.3s ease-out reverse;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .ai-chat-window {
    width: 90vw;
    height: 70vh;
    right: 5vw;
    bottom: 1rem;
  }
}
</style>

<template>
  <div class="notification-center">
    <el-badge :value="badgeValue" :hidden="!unreadCount" :max="99" class="notification-badge">
      <button
        type="button"
        class="notification-trigger"
        :class="{ 'is-active': drawerVisible }"
        aria-label="打开通知中心"
        @click="openDrawer"
      >
        <el-icon :size="18"><Bell /></el-icon>
      </button>
    </el-badge>

    <el-drawer
      v-model="drawerVisible"
      size="420px"
      append-to-body
      class="notification-drawer"
    >
      <template #header>
        <div class="drawer-header">
          <div class="drawer-heading">
            <div class="drawer-title-row">
              <div class="drawer-title">通知中心</div>
              <el-tag class="drawer-unread-tag" type="danger" effect="dark" round>{{ unreadCount }} 未读</el-tag>
            </div>
            <div class="drawer-subtitle">只展示我加入的社团公告，并保留全站公告</div>
          </div>
        </div>
      </template>

      <div class="drawer-toolbar">
        <div class="filter-tabs">
          <button
            type="button"
            class="filter-tab"
            :class="{ 'is-active': filterMode === 'all' }"
            @click="filterMode = 'all'"
          >
            全部
          </button>
          <button
            type="button"
            class="filter-tab"
            :class="{ 'is-active': filterMode === 'unread' }"
            @click="filterMode = 'unread'"
          >
            未读
          </button>
        </div>
        <el-button text type="primary" :disabled="!unreadCount" @click="handleMarkAllRead">全部已读</el-button>
      </div>

      <div v-loading="listLoading" class="drawer-body">
        <template v-if="filteredNotifications.length">
          <article
            v-for="item in filteredNotifications"
            :key="`${item.noticeSource}-${item.noticeId}`"
            class="notification-item"
            :class="{ 'is-unread': item.readStatus === '0' }"
            @click="openDetail(item)"
          >
            <div class="item-head">
              <div class="item-tags">
                <span class="source-tag" :class="item.noticeSource === 'system' ? 'is-system' : 'is-club'">
                  {{ item.noticeSource === 'system' ? '全站公告' : (item.clubName || '社团公告') }}
                </span>
                <span v-if="item.readStatus === '0'" class="unread-dot">未读</span>
                <span v-else class="read-flag">已读</span>
              </div>
              <button
                v-if="item.readStatus === '0'"
                type="button"
                class="mark-read-btn"
                @click.stop="markSingleRead(item)"
              >
                标为已读
              </button>
            </div>
            <div class="item-title">{{ item.noticeTitle }}</div>
            <div class="item-preview">{{ getPlainPreview(item.noticeContent) }}</div>
            <div class="item-meta">
              <span>{{ formatPublishTime(item.publishTime) }}</span>
              <span v-if="item.publisherName">{{ item.publisherName }}</span>
            </div>
          </article>
        </template>
        <el-empty v-else description="暂无通知" />
      </div>
    </el-drawer>

    <el-dialog
      v-model="detailVisible"
      append-to-body
      destroy-on-close
      width="720px"
      class="notification-detail-dialog"
    >
      <template #header>
        <div class="detail-header">
          <div class="detail-tags">
            <span class="source-tag" :class="activeNotification?.noticeSource === 'system' ? 'is-system' : 'is-club'">
              {{ activeNotification?.noticeSource === 'system' ? '全站公告' : (activeNotification?.clubName || '社团公告') }}
            </span>
            <span class="detail-time">{{ formatPublishTime(activeNotification?.publishTime) }}</span>
          </div>
          <div class="detail-title">{{ activeNotification?.noticeTitle }}</div>
        </div>
      </template>

      <div v-if="activeNotification" class="detail-body">
        <el-image
          v-if="activeNotification.coverUrl"
          :src="getImgUrl(activeNotification.coverUrl)"
          fit="cover"
          class="detail-cover"
        />
        <div class="detail-content" v-html="sanitizedDetailContent"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Bell } from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'
import useUserStore from '@/store/modules/user'
import { getToken } from '@/utils/auth'
import { getImgUrl, parseTime } from '@/utils/ruoyi'
import {
  getNotificationSummary,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '@/api/user/notification'

const userStore = useUserStore()
const emit = defineEmits(['open-overlay'])

const drawerVisible = ref(false)
const detailVisible = ref(false)
const listLoading = ref(false)
const unreadCount = ref(0)
const notifications = ref([])
const filterMode = ref('all')
const activeNotification = ref(null)

let socket = null
let reconnectTimer = null
let reconnectAttempt = 0
let manualClose = false

const badgeValue = computed(() => unreadCount.value)

const filteredNotifications = computed(() => {
  if (filterMode.value === 'unread') {
    return notifications.value.filter(item => item.readStatus === '0')
  }
  return notifications.value
})

const sanitizedDetailContent = computed(() => sanitizeHtml(activeNotification.value?.noticeContent || ''))

watch(
  () => userStore.token,
  async (token) => {
    if (!token) {
      unreadCount.value = 0
      notifications.value = []
      activeNotification.value = null
      disconnectSocket(true)
      return
    }

    await loadSummary()
    connectSocket()
  },
  { immediate: true }
)

watch(drawerVisible, (visible) => {
  if (visible) {
    loadNotifications()
    loadSummary()
  }
})

onBeforeUnmount(() => {
  disconnectSocket(true)
})

function openDrawer() {
  emit('open-overlay')
  drawerVisible.value = true
}

async function loadSummary(showToastOnIncrease = false) {
  const previousUnread = unreadCount.value

  try {
    const response = await getNotificationSummary()
    unreadCount.value = Number(response?.data?.unreadCount || 0)

    if (showToastOnIncrease && unreadCount.value > previousUnread) {
      const increase = unreadCount.value - previousUnread
      ElNotification({
        title: '通知中心',
        message: increase === 1 ? '收到 1 条新通知' : `收到 ${increase} 条新通知`,
        type: 'info',
        duration: 2500,
        position: 'bottom-right'
      })
    }
  } catch (_) {
  }
}

async function loadNotifications() {
  listLoading.value = true
  try {
    const response = await listNotifications({ pageNum: 1, pageSize: 30 })
    notifications.value = Array.isArray(response?.rows) ? response.rows : []
    if (typeof response?.unreadCount !== 'undefined') {
      unreadCount.value = Number(response.unreadCount || 0)
    }
  } finally {
    listLoading.value = false
  }
}

async function openDetail(item) {
  activeNotification.value = item
  detailVisible.value = true
  if (item.readStatus === '0') {
    await markSingleRead(item, true)
  }
}

async function markSingleRead(item, silent = false) {
  if (!item || item.readStatus === '1') {
    return
  }

  try {
    await markNotificationRead({
      noticeSource: item.noticeSource,
      noticeId: item.noticeId
    })
    item.readStatus = '1'
    unreadCount.value = Math.max(0, unreadCount.value - 1)
    if (!silent) {
      ElMessage.success('已标记为已读')
    }
  } catch (_) {
  }
}

async function handleMarkAllRead() {
  if (!unreadCount.value) {
    return
  }

  try {
    await markAllNotificationsRead()
    notifications.value = notifications.value.map(item => ({
      ...item,
      readStatus: '1'
    }))
    unreadCount.value = 0
    ElMessage.success('已全部标记为已读')
  } catch (_) {
  }
}

function connectSocket() {
  if (!userStore.token || typeof window === 'undefined') {
    return
  }

  disconnectSocket(true)
  manualClose = false

  try {
    socket = new WebSocket(buildSocketUrl())
  } catch (_) {
    scheduleReconnect()
    return
  }

  socket.onopen = () => {
    reconnectAttempt = 0
  }

  socket.onmessage = async (event) => {
    const payload = parseSocketMessage(event.data)
    if (payload?.type !== 'notification_refresh') {
      return
    }

    await loadSummary(true)
    if (drawerVisible.value) {
      await loadNotifications()
    }
  }

  socket.onerror = () => {
    socket?.close()
  }

  socket.onclose = () => {
    socket = null
    if (!manualClose && userStore.token) {
      scheduleReconnect()
    }
  }
}

function disconnectSocket(forceStopReconnect = false) {
  manualClose = forceStopReconnect

  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  if (socket) {
    const currentSocket = socket
    socket = null
    currentSocket.onopen = null
    currentSocket.onmessage = null
    currentSocket.onerror = null
    currentSocket.onclose = null
    currentSocket.close()
  }
}

function scheduleReconnect() {
  if (reconnectTimer || !userStore.token) {
    return
  }

  reconnectAttempt += 1
  const delay = Math.min(5000, 1000 * reconnectAttempt)
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null
    connectSocket()
  }, delay)
}

function buildSocketUrl() {
  const token = getToken()
  const baseApi = import.meta.env.VITE_APP_BASE_API || ''

  if (/^https?:\/\//i.test(baseApi)) {
    const target = new URL(baseApi)
    target.protocol = target.protocol === 'https:' ? 'wss:' : 'ws:'
    target.pathname = `${target.pathname.replace(/\/$/, '')}/api/app/ws/notification`
    target.searchParams.set('token', token)
    return target.toString()
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const normalizedBase = baseApi.startsWith('/') ? baseApi : `/${baseApi}`
  return `${protocol}//${window.location.host}${normalizedBase}/api/app/ws/notification?token=${encodeURIComponent(token || '')}`
}

function parseSocketMessage(message) {
  try {
    return JSON.parse(message)
  } catch (_) {
    return null
  }
}

function formatPublishTime(value) {
  return value ? parseTime(value, '{y}-{m}-{d} {h}:{i}') : '刚刚'
}

function getPlainPreview(html) {
  const text = stripHtml(html)
  if (!text) {
    return '暂无内容'
  }
  return text.length > 72 ? `${text.slice(0, 72)}...` : text
}

function stripHtml(html) {
  if (!html || typeof window === 'undefined') {
    return ''
  }
  const doc = new DOMParser().parseFromString(String(html), 'text/html')
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim()
}

function sanitizeHtml(html) {
  if (typeof window === 'undefined') {
    return ''
  }
  if (!html) {
    return '<p>暂无内容</p>'
  }

  const doc = new DOMParser().parseFromString(String(html), 'text/html')
  doc.querySelectorAll('script,style,iframe,frame,object,embed,link,meta,form,input,button,textarea,select').forEach(node => node.remove())

  doc.body.querySelectorAll('*').forEach((node) => {
    Array.from(node.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase()
      const value = attr.value?.trim() || ''

      if (name.startsWith('on')) {
        node.removeAttribute(attr.name)
        return
      }

      if (['href', 'src', 'xlink:href'].includes(name) && /^(javascript|data):/i.test(value)) {
        node.removeAttribute(attr.name)
        return
      }

      if (name === 'style' && /expression|javascript:/i.test(value)) {
        node.removeAttribute(attr.name)
      }
    })
  })

  return doc.body.innerHTML || '<p>暂无内容</p>'
}
</script>

<style lang="scss" scoped>
.notification-center {
  margin-right: 0.55rem;
}

.notification-badge {
  :deep(.el-badge__content) {
    border: none;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    line-height: 18px;
    font-size: 11px;
    font-weight: 700;
    box-shadow: 0 8px 18px -12px rgba(220, 38, 38, 0.9);
  }
}

.notification-trigger {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(155, 182, 235, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
  color: #607397;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 14px 24px -24px rgba(25, 76, 191, 0.85);

  &:hover {
    color: #1f4fae;
    transform: translateY(-1px);
    border-color: rgba(46, 95, 200, 0.32);
    background: rgba(248, 251, 255, 0.96);
  }

  &.is-active {
    color: #1d4ed8;
    border-color: rgba(37, 99, 235, 0.34);
    background: rgba(235, 243, 255, 0.96);
  }
}

.drawer-header {
  padding-right: 2.4rem;
}

.drawer-heading {
  min-width: 0;
}

.drawer-title-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.drawer-unread-tag {
  flex-shrink: 0;
}

.drawer-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #142849;
}

.drawer-subtitle {
  margin-top: 0.22rem;
  font-size: 0.82rem;
  color: #667892;
}

.drawer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.filter-tabs {
  display: inline-flex;
  padding: 0.25rem;
  border-radius: 999px;
  background: #f2f6ff;
  border: 1px solid rgba(145, 170, 222, 0.22);
}

.filter-tab {
  border: none;
  background: transparent;
  color: #6980a5;
  border-radius: 999px;
  height: 30px;
  padding: 0 0.95rem;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &.is-active {
    color: #173f93;
    background: #ffffff;
    box-shadow: 0 10px 18px -18px rgba(17, 67, 170, 0.9);
  }
}

.drawer-body {
  min-height: 280px;
}

.notification-item {
  padding: 0.95rem 1rem;
  border-radius: 18px;
  border: 1px solid rgba(207, 220, 240, 0.88);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(246, 249, 255, 0.94));
  cursor: pointer;
  transition: all 0.2s ease;

  & + & {
    margin-top: 0.85rem;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(117, 152, 224, 0.3);
    box-shadow: 0 18px 30px -26px rgba(15, 46, 106, 0.45);
  }

  &.is-unread {
    border-color: rgba(67, 114, 220, 0.24);
    box-shadow: 0 14px 28px -28px rgba(29, 78, 216, 0.58);
  }
}

.item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.item-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem;
  min-width: 0;
}

.source-tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.16rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.3;

  &.is-system {
    color: #8a5a00;
    background: rgba(254, 243, 199, 0.92);
  }

  &.is-club {
    color: #1d4ed8;
    background: rgba(219, 234, 254, 0.94);
  }
}

.unread-dot,
.read-flag {
  display: inline-flex;
  align-items: center;
  font-size: 0.74rem;
  font-weight: 600;
  line-height: 1;
  padding-top: 0.02rem;
}

.unread-dot {
  color: #d93025;
}

.read-flag {
  color: #94a3b8;
}

.mark-read-btn {
  border: none;
  padding: 0;
  background: transparent;
  color: #2563eb;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
}

.item-title {
  margin-top: 0.72rem;
  color: #17263f;
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1.5;
}

.item-preview {
  margin-top: 0.38rem;
  color: #5d6d85;
  font-size: 0.85rem;
  line-height: 1.7;
}

.item-meta {
  margin-top: 0.72rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  color: #8ca0bb;
  font-size: 0.74rem;
}

.detail-header {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.detail-tags {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.detail-time {
  color: #94a3b8;
  font-size: 0.82rem;
}

.detail-title {
  color: #0f172a;
  font-size: 1.32rem;
  font-weight: 700;
  line-height: 1.5;
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-cover {
  width: 100%;
  border-radius: 18px;
  overflow: hidden;

  :deep(img) {
    display: block;
    width: 100%;
    max-height: 260px;
    object-fit: cover;
  }
}

.detail-content {
  color: #334155;
  font-size: 0.95rem;
  line-height: 1.9;

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 14px;
  }

  :deep(p) {
    margin: 0 0 1rem;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 1.2rem;
  }
}

@media (max-width: 768px) {
  .notification-center {
    margin-right: 0;
  }
}
</style>

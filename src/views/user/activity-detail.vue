<template>
  <div class="activity-detail-page">
    <div v-if="loading" class="container loading">
      <el-skeleton :rows="10" animated />
    </div>

    <template v-else-if="activity">
      <section class="activity-header">
        <div class="header-overlay"></div>
        <img :src="getImgUrl(activity.coverUrl) || defaultCover" class="header-bg-img" />
        <div class="container header-content">
          <div class="header-text">
            <el-tag :type="getStatusType(activity.status)" class="status-tag">
              {{ getStatusText(activity.status) }}
            </el-tag>
            <h1 class="page-title">{{ activity.activityTitle }}</h1>
            <div class="header-meta">
              <span class="meta-item">
                <el-icon><School /></el-icon>
                <span class="meta-label">主办方:</span>
                <span class="meta-value link" @click="$router.push(`/user/club/${activity.clubId}`)">
                  {{ activity.clubName }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <div class="container content-layout">
        <main class="main-column">
          <div class="info-grid">
            <div class="info-card">
              <div class="icon-box blue">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="info-text">
                <span class="label">开始时间</span>
                <span class="value">{{ formatDate(activity.startTime) }}</span>
              </div>
            </div>
            <div class="info-card">
              <div class="icon-box green">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="info-text">
                <span class="label">结束时间</span>
                <span class="value">{{ formatDate(activity.endTime) }}</span>
              </div>
            </div>
            <div class="info-card">
              <div class="icon-box orange">
                <el-icon><Location /></el-icon>
              </div>
              <div class="info-text">
                <span class="label">活动地点</span>
                <span class="value">{{ activity.location || '待定' }}</span>
              </div>
            </div>
            <div class="info-card">
              <div class="icon-box purple">
                <el-icon><User /></el-icon>
              </div>
              <div class="info-text">
                <span class="label">参与人数</span>
                <span class="value">{{ activity.currentParticipants || 0 }} / {{ activity.maxParticipants || '不限' }}</span>
              </div>
            </div>
          </div>

          <section class="panel-card description-section">
            <h2 class="section-title">活动详情</h2>
            <div class="rich-text-content" v-html="formatContent(activity.description)"></div>
          </section>

        </main>

        <aside class="sidebar-column">
          <div class="action-card">
            <div class="action-header">
              <h3>报名参与</h3>
              <p class="time-range">{{ formatTimeRange(activity) }}</p>
            </div>

            <div class="action-body">
              <el-button
                :type="isRegistered(activity) ? 'success' : 'primary'"
                size="large"
                class="action-btn"
                :plain="isRegistered(activity)"
                :disabled="!canRegister(activity)"
                @click="handleSignUp"
              >
                {{ getBtnText(activity) }}
              </el-button>
              <p v-if="isRegistered(activity)" class="action-tip">你已报名该活动，可在"我的社团-我的活动"中查看</p>
            </div>

            <div class="action-footer" v-if="activity.contactInfo">
              <div class="contact-row">
                <el-icon><Phone /></el-icon>
                <span>咨询: {{ activity.contactInfo }}</span>
              </div>
            </div>
          </div>

          <!-- 已报名名单 -->
          <section class="panel-card participants-section" v-loading="registrationLoading">
            <div class="section-title-row">
              <h2 class="section-title">已报名名单</h2>
              <span class="participant-count">共 {{ registrations.length }} 人</span>
            </div>
            <div class="participant-list">
              <template v-if="registrations.length > 0">
                <article
                  v-for="item in registrations"
                  :key="item.registrationId || `${item.userId}-${item.registrationTime}`"
                  class="participant-item"
                >
                  <div class="participant-avatar">
                    <img :src="getAvatarUrl(item.avatar)" class="avatar-img" />
                  </div>
                  <div class="participant-main">
                    <h4 class="participant-name">{{ item.nickName || item.userName || '匿名用户' }}</h4>
                    <p class="participant-time">报名时间：{{ formatDateTime(item.registrationTime) }}</p>
                  </div>
                </article>
              </template>
              <el-empty v-else description="暂无报名记录" :image-size="70" />
            </div>
          </section>
        </aside>
      </div>
    </template>

    <div v-else class="container not-found">
      <el-empty description="未找到活动信息" />
      <el-button @click="$router.push('/user/activities')">返回活动列表</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Calendar, Timer, Location, User, School, Phone } from '@element-plus/icons-vue'
import { getActivity, registerActivity, listActivityRegistrations } from '@/api/user/activity'
import defaultCover from '@/assets/images/profile.jpg'

import { getImgUrl } from '@/utils/ruoyi'

const route = useRoute()
const router = useRouter()
const activity = ref(null)
const registrations = ref([])
const loading = ref(true)
const registrationLoading = ref(false)

onMounted(() => {
  loadData()
})

watch(() => route.params.id, () => {
  loadData()
})

const normalizeRows = (response) => response?.data || response?.rows || []

const loadRegistrations = async (activityId) => {
  registrationLoading.value = true
  try {
    const response = await listActivityRegistrations(activityId)
    registrations.value = normalizeRows(response)
  } catch {
    registrations.value = []
  } finally {
    registrationLoading.value = false
  }
}

const loadData = async () => {
  const id = route.params.id
  if (!id) {
    activity.value = null
    registrations.value = []
    loading.value = false
    return
  }

  loading.value = true
  const [activityRes] = await Promise.allSettled([
    getActivity(id),
    loadRegistrations(id)
  ])

  if (activityRes.status === 'fulfilled') {
    activity.value = activityRes.value.data
  } else {
    activity.value = null
  }
  loading.value = false
}

const formatDate = (dateStr) => {
  if (!dateStr) return '待定'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  return date.toLocaleString('zh-CN', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '--'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const formatTimeRange = (act) => {
  if (!act) return ''
  const start = formatDate(act.registrationStart || act.startTime)
  const end = formatDate(act.registrationEnd || act.endTime)
  return `${start} ~ ${end}`
}

const formatContent = (text) => {
  if (!text) return '暂无活动介绍'
  if (!text.includes('<')) {
    return text.replace(/\n/g, '<br>')
  }
  return text
}

const getAvatarUrl = (avatar) => {
  const resolved = getImgUrl(avatar)
  return resolved || defaultCover
}

const getStatusType = (status) => {
  const map = { '0': 'primary', '1': 'success', '2': 'info', '3': 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { '0': '即将开始', '1': '进行中', '2': '已结束', '3': '已取消' }
  return map[status] || status
}

const isRegistered = (act) => {
  if (!act) return false
  const value = act.hasRegistered ?? act.isRegistered ?? act.registered
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') return ['1', 'true', 'y', 'yes'].includes(value.toLowerCase())
  return false
}

const getBtnText = (act) => {
  if (!act) return '不可报名'
  if (isRegistered(act)) return '已报名'
  if (act.status === '0' || act.status === '1') return '立即报名'
  if (act.status === '2') return '活动已结束'
  return '不可报名'
}

const canRegister = (act) => {
  if (!act) return false
  if (isRegistered(act)) return false
  if (act.status !== '0' && act.status !== '1') return false

  const now = Date.now()
  if (act.registrationStart && now < new Date(act.registrationStart).getTime()) return false
  if (act.registrationEnd && now > new Date(act.registrationEnd).getTime()) return false
  if (act.endTime && now > new Date(act.endTime).getTime()) return false
  if (act.maxParticipants && act.currentParticipants >= act.maxParticipants) return false
  return true
}

const extractBizError = (error) => {
  const message = typeof error === 'string'
    ? error
    : (error?.message || error?.msg || '')
  const errorKey = error?.data?.errorKey || ''
  return { message, errorKey }
}

const isNeedClubMemberError = (error) => {
  const { message, errorKey } = extractBizError(error)
  return errorKey === 'ACTIVITY_NEED_CLUB_MEMBER' || message.includes('ACTIVITY_NEED_CLUB_MEMBER')
}

const handleSignUp = async () => {
  if (!activity.value?.activityId || !canRegister(activity.value)) return
  try {
    const response = await registerActivity(activity.value.activityId)
    ElMessage.success(response.msg || '报名成功')
    activity.value.hasRegistered = true
    const current = Number(activity.value.currentParticipants || 0)
    if (!Number.isNaN(current)) {
      activity.value.currentParticipants = current + 1
    }
    await loadRegistrations(activity.value.activityId)
  } catch (error) {
    if (isNeedClubMemberError(error)) {
      setTimeout(() => {
        router.push(`/user/club/${activity.value.clubId}`)
      }, 3000)
    }
  }
}
</script>

<style lang="scss" scoped>
.activity-detail-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 8% 10%, rgba(129, 140, 248, 0.12), transparent 35%),
    radial-gradient(circle at 90% 2%, rgba(56, 189, 248, 0.1), transparent 30%),
    #f8fafc;
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.loading,
.not-found {
  padding: 4rem 0;
  text-align: center;
}

.activity-header {
  position: relative;
  height: 340px;
  color: #fff;
  overflow: hidden;
  margin-bottom: 2.5rem;
}

.header-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.42;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.86));
}

.header-content {
  position: relative;
  height: 100%;
  display: flex;
  align-items: flex-end;
  padding-bottom: 2.4rem;
}

.header-text {
  max-width: 860px;
}

.status-tag {
  margin-bottom: 1rem;
  font-weight: 700;
  border: none;
  padding: 6px 12px;
}

.page-title {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 900;
  margin: 0 0 1rem 0;
  line-height: 1.25;
}

.header-meta {
  display: flex;
  gap: 1.25rem;

  .meta-item {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.92);
  }

  .link {
    color: #bfdbfe;
    cursor: pointer;
    text-decoration: underline;

    &:hover {
      color: #dbeafe;
    }
  }
}

.content-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
  padding-bottom: 4rem;

  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 2fr) minmax(300px, 360px);
    align-items: start;
  }
}

.main-column {
  min-width: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-card {
  background: #fff;
  padding: 1rem 1.1rem;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  box-shadow: 0 10px 22px -20px rgba(15, 23, 42, 0.45);

  .icon-box {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;

    &.blue { background: #eff6ff; color: #3b82f6; }
    &.green { background: #ecfdf3; color: #10b981; }
    &.orange { background: #fff7ed; color: #f97316; }
    &.purple { background: #f5f3ff; color: #8b5cf6; }
  }

  .info-text {
    display: flex;
    flex-direction: column;
    min-width: 0;

    .label {
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 0.2rem;
    }

    .value {
      font-size: 0.95rem;
      color: #0f172a;
      font-weight: 700;
      word-break: break-word;
    }
  }
}

.panel-card {
  background: linear-gradient(180deg, #ffffff 0%, #fcfdff 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 10px 24px -20px rgba(15, 23, 42, 0.4);
  padding: 1.35rem;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 1rem 0;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.participant-count {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
}

.rich-text-content {
  line-height: 1.85;
  color: #334155;
  font-size: 1rem;
}

.participants-section {
  margin-bottom: 0;
}

.participant-list {
  max-height: 260px;
  overflow-y: auto;
  min-height: 60px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.85rem 0.2rem;
  border-bottom: 1px dashed #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
}

.participant-avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 999px;
  }
}

.participant-main {
  min-width: 0;
}

.participant-name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
}

.participant-time {
  margin: 0.2rem 0 0 0;
  font-size: 0.82rem;
  color: #64748b;
}

.sidebar-column {
  position: sticky;
  top: 96px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 24px -16px rgba(99, 102, 241, 0.25);
  overflow: hidden;
}

.action-header {
  background: linear-gradient(135deg, var(--el-color-primary-dark-2, #4338CA) 0%, var(--el-color-primary, #6366f1) 100%);
  padding: 1.4rem 1.2rem;
  color: #fff;
  text-align: center;

  h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1.25rem;
    font-weight: 800;
  }

  .time-range {
    margin: 0;
    opacity: 0.95;
    font-size: 0.8rem;
    line-height: 1.45;
    padding: 0.5rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.24);
  }
}

.action-body {
  padding: 1.2rem;
}

.action-btn {
  width: 100%;
  font-weight: 700;
  height: 46px;
  font-size: 1rem;
}

.action-tip {
  margin: 0.7rem 0 0;
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.55;
}

.action-footer {
  border-top: 1px solid #f1f5f9;
  padding: 0.9rem 1.2rem;
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: #475569;
  font-size: 0.88rem;
  justify-content: center;
}

@media (max-width: 1024px) {
  .activity-header {
    height: 300px;
  }

  .sidebar-column {
    position: static;
  }
}
</style>

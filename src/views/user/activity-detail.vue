<template>
  <div class="activity-detail-page">
    <div v-if="loading" class="container loading">
      <el-skeleton :rows="10" animated />
    </div>

    <template v-else-if="activity">
      <!-- Activity Header (Cover & Title) -->
      <section class="activity-header">
        <div class="header-overlay"></div>
        <img :src="activity.coverUrl || defaultCover" class="header-bg-img" />
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
        <!-- Main Content -->
        <main class="main-column">
          <!-- Info Grid -->
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
                <span class="value">{{ activity.location }}</span>
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

          <!-- Description -->
          <section class="description-section">
            <h2 class="section-title">活动详情</h2>
            <div class="rich-text-content" v-html="formatContent(activity.description)"></div>
          </section>
        </main>

        <!-- Sidebar -->
        <aside class="sidebar-column">
          <!-- Action Card -->
          <div class="action-card">
            <div class="action-header">
              <h3>报名参与</h3>
              <p class="time-range">{{ formatTimeRange(activity) }}</p>
            </div>
            
            <div class="action-body">
              <el-button 
                type="primary" 
                size="large" 
                class="action-btn"
                :disabled="!canRegister(activity)"
                @click="handleSignUp"
              >
                {{ getBtnText(activity.status) }}
              </el-button>
            </div>
            
            <div class="action-footer">
              <div class="contact-row" v-if="activity.contactInfo">
                <el-icon><Phone /></el-icon>
                <span>咨询: {{ activity.contactInfo }}</span>
              </div>
            </div>
          </div>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Calendar, Timer, Location, User, School, Phone } from '@element-plus/icons-vue'
import { getActivity, registerActivity } from '@/api/user/activity'
import defaultCover from '@/assets/images/profile.jpg'

const route = useRoute()
const router = useRouter()
const activity = ref(null)
const loading = ref(true)

onMounted(() => {
  loadData()
})

const loadData = () => {
  const id = route.params.id
  if (!id) return

  loading.value = true
  getActivity(id).then(response => {
    activity.value = response.data
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

const formatDate = (dateStr) => {
  if (!dateStr) return '待定'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTimeRange = (act) => {
  if (!act) return ''
  const start = formatDate(act.registrationStart || act.startTime)
  const end = formatDate(act.endTime)
  return `${start} ~ ${end}`
}

const formatContent = (text) => {
  if (!text) return ''
  if (!text.includes('<')) {
    return text.replace(/\n/g, '<br>')
  }
  return text
}

const getStatusType = (status) => {
  const map = { '0': 'primary', '1': 'success', '2': 'info', '3': 'danger' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { '0': '即将开始', '1': '进行中', '2': '已结束', '3': '已取消' }
  return map[status] || status
}

const getBtnText = (status) => {
  if (status === '0' || status === '1') return '立即报名'
  if (status === '2') return '活动已结束'
  return '不可报名'
}

const canRegister = (act) => {
  if (!act) return false
  if (act.status !== '0' && act.status !== '1') return false
  
  const now = new Date().getTime()
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
  if (!activity.value?.activityId) return
  try {
    const response = await registerActivity(activity.value.activityId)
    ElMessage.success(response.msg || '报名成功')
    router.push({ path: '/user/my-clubs', query: { tab: 'activities' } })
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
  background: #f9fafb;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.loading, .not-found {
  padding: 4rem 0;
  text-align: center;
}

.activity-header {
  position: relative;
  height: 350px;
  background-color: #1f2937;
  color: white;
  overflow: hidden;
  margin-bottom: 3rem;
}

.header-bg-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.4;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
}

.header-content {
  position: relative;
  height: 100%;
  display: flex;
  align-items: flex-end;
  padding-bottom: 3rem;
}

.header-text {
  max-width: 800px;
}

.status-tag {
  margin-bottom: 1rem;
  font-weight: 600;
  padding: 6px 12px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.header-meta {
  display: flex;
  gap: 1.5rem;
  opacity: 0.9;
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
  }
  
  .link {
      color: #60a5fa;
      cursor: pointer;
      text-decoration: underline;
      &:hover { color: #93c5fd; }
  }
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  padding-bottom: 4rem;
  
  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.info-card {
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);

  .icon-box {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    
    &.blue { background: #eff6ff; color: #3b82f6; }
    &.green { background: #f0fdf4; color: #22c55e; }
    &.orange { background: #fff7ed; color: #f97316; }
    &.purple { background: #faf5ff; color: #a855f7; }
  }
  
  .info-text {
      display: flex;
      flex-direction: column;
      
      .label { font-size: 0.85rem; color: #6b7280; font-weight: 500; }
      .value { font-size: 1rem; color: #111827; font-weight: 600; }
  }
}

.description-section {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.rich-text-content {
  line-height: 1.8;
  color: #374151;
  font-size: 1.05rem;
}

.sidebar-column {
  position: relative;
  background: transparent;
  padding: 0;
  margin-bottom: 0;
}

.action-card {
    background: white;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    overflow: hidden;
    position: sticky;
    top: 100px;
}

.action-header {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    padding: 2rem;
    color: white;
    text-align: center;
    
    h3 { margin: 0 0 1rem 0; font-size: 1.5rem; }
    p { margin: 0; opacity: 0.9; font-size: 0.85rem; line-height: 1.5; }
    .time-range {
        background: rgba(255, 255, 255, 0.1);
        padding: 0.5rem;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.15);
    }
}

.action-body {
    padding: 2rem;
}

.action-btn {
    width: 100%;
    font-weight: 700;
    height: 50px;
    font-size: 1.1rem;
}

.action-footer {
    border-top: 1px solid #f3f4f6;
    padding: 1rem 2rem;
    background: #f9fafb;
}

.contact-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #4b5563;
    font-size: 0.9rem;
    justify-content: center;
}
</style>

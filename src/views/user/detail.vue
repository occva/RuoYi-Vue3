<template>
  <div class="club-detail-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="container loading">
      <el-skeleton :rows="10" animated />
    </div>

    <template v-else-if="club">
      <!-- 头部区域 -->
      <div class="club-header-section">
        <div class="container club-header-container">
          <!-- 收藏按钮 -->
          <button
            class="club-favorite-btn"
            :class="{ 'is-loading': favoriteLoading }"
            :disabled="favoriteLoading"
            @click="toggleFavorite"
            :title="isFavorite ? '取消收藏' : '收藏社团'"
          >
            <el-icon :size="24" :color="isFavorite ? '#ef4444' : '#9ca3af'">
              <component :is="isFavorite ? 'StarFilled' : 'Star'" />
            </el-icon>
          </button>

          <div class="club-profile-image-wrapper">
            <img :src="getImgUrl(club.logoUrl)" :alt="club.clubName" class="club-profile-image" />
          </div>

          <div class="club-header-info">
            <span class="club-badge">{{ club.categoryName || '校园社团' }}</span>
            <h1 class="club-title">{{ club.clubName }}</h1>
            <div class="club-meta-grid">
              <div class="club-meta-item">
                <el-icon><User /></el-icon>
                <span>社长: <strong>{{ club.presidentName }}</strong></span>
              </div>
              <div class="club-meta-item">
                <el-icon><Clock /></el-icon>
                <span>成立时间: <strong>{{ formatDate(club.foundedDate) || formatDate(club.createTime) }}</strong></span>
              </div>
              <div class="club-meta-item" v-if="club.remark">
                <el-icon><Calendar /></el-icon>
                <span>{{ club.remark }}</span>
              </div>
              <div class="club-meta-item" v-if="club.location">
                <el-icon><Location /></el-icon>
                <span>{{ club.location }}</span>
              </div>
            </div>
            <div class="club-description">
              <p>{{ club.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 主内容区域 -->
      <div class="container new-club-content">
        <div v-if="!club.member" class="status-banner" :class="club.hasApplied ? 'is-pending' : 'is-none'">
          <div class="banner-text">
            <h3 v-if="club.hasApplied">您的申请正在审核中</h3>
            <h3 v-else>期待您的加入，与我们共同成长</h3>
            <p v-if="!club.hasApplied">成为 {{ club.clubName }} 的一员，开启你的精彩旅程</p>
          </div>
          <div class="banner-action" v-if="!club.hasApplied">
            <el-button type="primary" size="large" class="join-btn" @click="isModalOpen = true">
              立即申请加入
            </el-button>
          </div>
        </div>

        <div class="modules-container club-content-layout">
          <div class="main-module">
            <div class="module-header">
              <span class="header-title">近期活动</span>
            </div>
            <div v-if="club.activities && club.activities.length > 0" class="activity-grid">
              <div v-for="activity in displayedActivities" :key="activity.activityId" class="new-activity-card">
                <div class="act-date-badge">
                  <span class="act-day">{{ getDay(activity.startTime) }}</span>
                  <span class="act-month">{{ getMonth(activity.startTime) }}月</span>
                </div>
                <div class="act-info">
                  <h4 class="act-title">{{ activity.activityTitle }}</h4>
                  <div class="act-meta">
                    <span class="act-loc"><el-icon><Location /></el-icon>{{ activity.location }}</span>
                  </div>
                  <div class="act-status-row">
                    <el-tag :type="getStatusType(activity.status)" size="small" effect="light" round>
                      {{ getStatusText(activity.status) }}
                    </el-tag>
                    <el-tag
                      v-if="isActivityRegistered(activity)"
                      type="success"
                      size="small"
                      effect="light"
                      round
                    >
                      已报名
                    </el-tag>
                  </div>
                </div>
                <div class="act-actions">
                  <el-button plain @click="showActivityDetail(activity)">查看详情</el-button>
                  <el-button
                    v-if="activity.status === '0' || activity.status === '1'"
                    :type="isActivityRegistered(activity) ? 'success' : 'primary'"
                    :plain="isActivityRegistered(activity)"
                    :disabled="isActivityRegistered(activity) || !canRegister(activity)"
                    @click="signUpActivity(activity)"
                  >
                    {{ isActivityRegistered(activity) ? '已报名' : '参与报名' }}
                  </el-button>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无公开活动" />
            <div v-if="activityDisplayCount < (club.activities?.length || 0)" class="load-more-btn">
              <el-button plain @click="loadMoreActivities">展开更多活动 ({{ club.activities.length - activityDisplayCount }})</el-button>
            </div>
          </div>

          <div class="side-module">
            <div class="info-panel stats-panel">
              <div class="panel-header">社团档案</div>
              <div class="stats-grid">
                <div class="stat-item" v-if="club.categoryName">
                  <div class="stat-icon-wrapper is-category">
                    <el-icon><CollectionTag /></el-icon>
                  </div>
                  <div class="stat-info">
                    <span class="stat-label">社团类别</span>
                    <span class="stat-value">{{ club.categoryName }}</span>
                  </div>
                </div>

                <div class="stat-item">
                  <div class="stat-icon-wrapper is-member">
                    <el-icon><UserFilled /></el-icon>
                  </div>
                  <div class="stat-info">
                    <span class="stat-label">社团人数</span>
                    <span class="stat-value">
                      {{ club.memberCount || 0 }}
                      <span class="stat-sub" v-if="club.maxMembers">/ {{ club.maxMembers }}</span>
                    </span>
                  </div>
                </div>

                <div class="stat-item">
                  <div class="stat-icon-wrapper is-status" :class="club.isRecruiting === '1' ? 'active' : 'inactive'">
                    <el-icon><DataLine /></el-icon>
                  </div>
                  <div class="stat-info">
                    <span class="stat-label">招新状态</span>
                    <span class="stat-value" :class="{ 'text-blue': club.isRecruiting === '1' }">
                      {{ club.isRecruiting === '1' ? '正在招新' : '暂未开放' }}
                    </span>
                  </div>
                </div>

                <div class="stat-item">
                  <div class="stat-icon-wrapper is-view">
                    <el-icon><View /></el-icon>
                  </div>
                  <div class="stat-info">
                    <span class="stat-label">浏览热度</span>
                    <span class="stat-value">{{ club.viewCount || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="info-panel" v-if="club.notices && club.notices.length > 0">
              <div class="panel-header">社团公告</div>
              <div class="notice-list">
                <div v-for="notice in club.notices" :key="notice.noticeId" class="new-notice-item" @click="viewNotice(notice)">
                  <div class="notice-dot"></div>
                  <div class="notice-content-box">
                    <div class="notice-t">{{ notice.noticeTitle }}</div>
                    <div class="notice-d">{{ notice.publishTime }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="info-panel" v-if="club.contactPhone || club.contactEmail || club.contactQq || club.contactWechat">
              <div class="panel-header">联系我们</div>
              <div class="contact-list">
                <div v-if="club.contactPhone" class="contact-row">
                  <div class="icon-box is-phone"><el-icon><Phone /></el-icon></div>
                  <div class="contact-text">
                    <div class="c-label">联系电话</div>
                    <span class="contact-val">{{ club.contactPhone }}</span>
                  </div>
                </div>
                <div v-if="club.contactEmail" class="contact-row">
                  <div class="icon-box is-email"><el-icon><Message /></el-icon></div>
                  <div class="contact-text">
                    <div class="c-label">电子邮箱</div>
                    <span class="contact-val">{{ club.contactEmail }}</span>
                  </div>
                </div>
                <div v-if="club.contactQq" class="contact-row">
                  <div class="icon-box is-qq"><el-icon><ChatDotSquare /></el-icon></div>
                  <div class="contact-text">
                    <div class="c-label">QQ / 群</div>
                    <span class="contact-val">{{ club.contactQq }}</span>
                  </div>
                </div>
                <div v-if="club.contactWechat" class="contact-row">
                  <div class="icon-box is-wechat"><el-icon><ChatRound /></el-icon></div>
                  <div class="contact-text">
                    <div class="c-label">微信联系</div>
                    <span class="contact-val">{{ club.contactWechat }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <el-empty v-else description="未找到社团信息" />

    <!-- 申请弹窗 -->
    <el-dialog v-model="isModalOpen" :title="`申请加入 ${club?.clubName || ''}`" width="500px">
      <el-form ref="applyFormRef" :model="applicationForm" :rules="applyRules" label-position="top">
        <el-form-item label="姓名" prop="name">
           <el-input v-model="applicationForm.name" placeholder="请输入您的姓名" />
        </el-form-item>
        <el-form-item label="学号" prop="studentId">
           <el-input v-model="applicationForm.studentId" placeholder="请输入您的学号" />
         </el-form-item>
        <el-form-item label="申请理由" prop="reason">
          <el-input
            v-model="applicationForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请简述您加入社团的理由..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isModalOpen = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleApply">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Clock, Calendar, Location, Star, StarFilled, Phone, Message, View, CollectionTag, UserFilled, DataLine, ChatDotSquare, ChatRound } from '@element-plus/icons-vue'
import { getClub, joinClub, toggleFavorite as toggleFavoriteApi } from '@/api/user/club'
import { listActivitiesByClub, registerActivity } from '@/api/user/activity'
import { listNoticesByClub } from '@/api/user/notice'
import { getImgUrl } from '@/utils/ruoyi'

const route = useRoute()
const router = useRouter()
const club = ref(null)
const loading = ref(true)
const isFavorite = ref(false)
const favoriteLoading = ref(false)
const isModalOpen = ref(false)
const submitLoading = ref(false)
const applyFormRef = ref(null)
const activityDisplayCount = ref(10)

const displayedActivities = computed(() => {
  if (!club.value?.activities) return []
  return club.value.activities.slice(0, activityDisplayCount.value)
})

const loadMoreActivities = () => {
  activityDisplayCount.value += 10
}

const applicationForm = ref({
  clubId: undefined,
  name: '',
  studentId: '',
  reason: ''
})

const applyRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  studentId: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入申请理由', trigger: 'blur' }]
}

const loadClub = () => {
  const id = route.params.id
  if (!id) return

  loading.value = true
  getClub(id).then(async response => {
    const clubData = response.data
    if (response.viewStatPaused) {
      ElMessage.warning(response.viewStatTip || '访问过于频繁，已暂停浏览热度统计')
    }

    // Concurrently fetch related data
    try {
      const [activitiesRes, noticesRes] = await Promise.all([
        listActivitiesByClub(id),
        listNoticesByClub(id)
      ])
      // Handle list responses which might be in .rows or .data depending on structure
      clubData.activities = activitiesRes.data || activitiesRes.rows || []
      clubData.notices = noticesRes.data || noticesRes.rows || []
    } catch (e) {
      console.error('Failed to load related data', e)
    }

    club.value = clubData
    // Read favorite status from backend
    isFavorite.value = clubData.favorite || false
    loading.value = false
  }).catch(() => {
    club.value = null
    loading.value = false
  })
}

onMounted(loadClub)
watch(() => route.params.id, loadClub)

const toggleFavorite = async () => {
  if (!club.value || favoriteLoading.value) return
  favoriteLoading.value = true
  try {
    const res = await toggleFavoriteApi(club.value.clubId)
    if (res.code === 200) {
      isFavorite.value = !isFavorite.value
      ElMessage.success(res.msg || (isFavorite.value ? '已添加到收藏' : '已取消收藏'))
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    // 非200场景已由全局响应拦截器提示，这里避免重复弹窗
    console.warn('toggle favorite failed:', error?.message || error)
  } finally {
    favoriteLoading.value = false
  }
}


const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.split(' ')[0] // Returns YYYY-MM-DD
}

const getMonth = (date) => new Date(date).getMonth() + 1
const getDay = (date) => new Date(date).getDate()

const getStatusType = (status) => {
  const types = { '0': 'primary', '1': 'success', '2': 'info', '3': 'danger' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { '0': '即将开始', '1': '进行中', '2': '已结束', '3': '已取消' }
  return texts[status] || status
}

const showActivityDetail = (activity) => {
  router.push(`/user/activity/${activity.activityId}`)
}

const isActivityRegistered = (activity) => {
  if (!activity) return false
  const value = activity.hasRegistered ?? activity.isRegistered ?? activity.registered
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') return ['1', 'true', 'y', 'yes'].includes(value.toLowerCase())
  return false
}

const canRegister = (act) => {
  if (!act) return false
  if (isActivityRegistered(act)) return false
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

const signUpActivity = (activity) => {
  registerActivity(activity.activityId).then(response => {
    ElMessage.success(response.msg || ('报名成功: ' + activity.activityTitle))
    activity.hasRegistered = true
    const current = Number(activity.currentParticipants || 0)
    if (!Number.isNaN(current)) {
      activity.currentParticipants = current + 1
    }
  }).catch((error) => {
    if (isNeedClubMemberError(error)) {
      const targetClubId = activity?.clubId || club.value?.clubId
      if (!targetClubId) return
      setTimeout(() => {
        router.push(`/user/club/${targetClubId}`)
      }, 3000)
    }
  })
}

const viewNotice = (notice) => {
  ElMessageBox.alert(notice.noticeContent, notice.noticeTitle, {
    confirmButtonText: '关闭',
    dangerouslyUseHTMLString: false
  })
}

const handleApply = () => {
  if (!applyFormRef.value) return

  applyFormRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      const data = {
        clubId: club.value.clubId,
        clubName: club.value.clubName, // Add clubName to ensure proper data storage
        studentId: applicationForm.value.studentId,
        realName: applicationForm.value.name,
        applyReason: applicationForm.value.reason
      }
      joinClub(data).then(res => {
        ElMessage.success(res.msg || '申请已提交')
        isModalOpen.value = false
        applicationForm.value = { name: '', studentId: '', reason: '' }
        submitLoading.value = false
        if (club.value) {
          club.value.hasApplied = true
        }
      }).catch(() => {
        submitLoading.value = false
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.club-detail-page {
  background: #f8fafc;
  min-height: 100vh;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.loading {
  padding: 4rem 0;
}

.club-header-section {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 3rem 0;
  margin-bottom: 2rem;
  position: relative;
}

.club-header-container {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  align-items: center;
  position: relative;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
  }
}

.club-favorite-btn {
  position: absolute;
  top: 0;
  right: 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  z-index: 10;

  &:hover {
    transform: scale(1.1);
  }

  &:disabled,
  &.is-loading {
    cursor: not-allowed;
    opacity: 0.7;
    transform: none;
  }
}

.club-profile-image-wrapper {
  flex-shrink: 0;
  width: 100%;
  max-width: 300px;
}

.club-profile-image {
  width: 100%;
  height: 200px;
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

.club-header-info {
  flex: 1;
  width: 100%;
  padding-right: 3rem;
}

.club-badge {
  display: inline-block;
  background-color: #eff6ff;
  color: #3b82f6;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.club-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 1rem;
  line-height: 1.1;
}

.club-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.club-meta-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #6b7280;

  .el-icon {
    color: #9ca3af;
  }
}

.club-description {
  p {
    line-height: 1.7;
    color: #4b5563;
    font-size: 1.05rem;
  }
}

.new-club-content {
  padding-bottom: 4rem;
}
.club-content-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
  align-items: start;
  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1fr) minmax(320px, 380px);
    gap: 2.5rem;
    align-items: stretch;
  }
}
.status-banner {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 2.5rem 3rem;
  border-radius: 20px;
  margin-bottom: 3rem;
  color: #fff;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  background-color: #3b82f6;
  @media (min-width: 768px) {
    flex-direction: row;
    text-align: left;
  }
}
.status-banner.is-none {
  background-color: #1e293b;
}
.status-banner.is-member {
  background-color: #0f766e;
}
.status-banner.is-pending {
  background-color: #d97706;
}
.banner-text h3 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #fff;
}
.banner-text p {
  color: #cbd5e1;
  font-size: 1.1rem;
  margin: 0;
}
.join-btn {
  font-size: 1.1rem;
  padding: 1.5rem 2.5rem;
  border-radius: 999px;
  background-color: #fff;
  color: #1e293b;
  border: none;
  font-weight: 700;
  transition: all 0.3s ease;
  margin-top: 1.5rem;
  @media (min-width: 768px) {
    margin-top: 0;
  }
}
.join-btn:hover {
  background-color: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  color: #3b82f6;
}
.modules-container {
  width: 100%;
}
.main-module {
  min-width: 0;
}
.side-module {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  @media (min-width: 1024px) {
    width: auto;
    padding-left: 1.5rem;
    border-left: 1px solid #e8edf5;
  }
}
.module-header,
.panel-header {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 1.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  position: relative;
  display: inline-block;
  padding-bottom: 0.75rem;
}
.module-header::after,
.panel-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: #3b82f6;
  border-radius: 2px;
}
.activity-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: stretch;
  grid-auto-rows: 1fr;
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1024px) {
    grid-template-columns: 1fr;
  }
  @media (min-width: 1360px) {
    grid-template-columns: repeat(2, 1fr);
  }
}
.new-activity-card {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  grid-template-areas:
    "date info"
    "date actions";
  column-gap: 1rem;
  row-gap: 0.75rem;
  min-height: 164px;
  height: 100%;
  align-content: start;
}
.new-activity-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.08);
}
.act-date-badge {
  grid-area: date;
  background-color: #f8fafc;
  border-radius: 12px;
  width: 64px;
  min-height: 120px;
  padding: 0.75rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #f1f5f9;
}
.act-day {
  font-size: 1.5rem;
  font-weight: 800;
  color: #3b82f6;
  line-height: 1;
}
.act-month {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
  font-weight: 600;
}
.act-info {
  grid-area: info;
  min-width: 0;
}
.act-title {
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.act-meta {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}
.act-loc {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.act-status-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.act-actions {
  grid-area: actions;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.act-actions :deep(.el-button) {
  min-width: 88px;
}
.info-panel {
  background: #f8fafc;
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid #f1f5f9;
}

/* 首个档案卡标题与左侧“近期活动”标题顶线对齐 */
.stats-panel {
  padding-top: 0;
}
.new-notice-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px dashed #e2e8f0;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.new-notice-item:hover {
  transform: translateX(4px);
}
.new-notice-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.notice-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #3b82f6;
  margin-top: 0.4rem;
  flex-shrink: 0;
}
.notice-content-box {
  flex: 1;
}
.notice-t {
  color: #334155;
  font-weight: 600;
  margin-bottom: 0.25rem;
  line-height: 1.4;
}
.notice-d {
  font-size: 0.8rem;
  color: #94a3b8;
}
.contact-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.contact-row {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: #fff;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  transition: transform 0.2s ease;
}
.contact-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}
.icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  flex-shrink: 0;
}
.icon-box.is-phone { background-color: #eff6ff; color: #3b82f6; }
.icon-box.is-email { background-color: #fef2f2; color: #ef4444; }
.icon-box.is-qq { background-color: #f0fdf4; color: #10b981; }
.icon-box.is-wechat { background-color: #fffbeb; color: #f59e0b; }
.contact-text {
  display: flex;
  flex-direction: column;
}
.c-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.2rem;
}
.contact-val {
  color: #1e293b;
  font-weight: 600;
  font-size: 0.95rem;
  word-break: break-all;
}
.load-more-btn {
  margin-top: 2rem;
  text-align: center;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  grid-auto-rows: 1fr;
}
.stat-item {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  background: #fff;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  min-height: 132px;
}
.stat-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}
.stat-icon-wrapper.is-category,
.stat-icon-wrapper.is-member,
.stat-icon-wrapper.is-status.active,
.stat-icon-wrapper.is-status.inactive,
.stat-icon-wrapper.is-view {
  background: #eff6ff;
  color: #3b82f6;
}
.stat-info {
  display: flex;
  flex-direction: column;
}
.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}
.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}
.stat-sub {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 500;
}
.text-blue {
  color: #3b82f6 !important;
}
</style>



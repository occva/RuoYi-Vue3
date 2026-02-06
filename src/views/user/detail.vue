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
          <button class="club-favorite-btn" @click="toggleFavorite" :title="isFavorite ? '取消收藏' : '收藏社团'">
            <el-icon :size="24" :color="isFavorite ? '#ef4444' : '#9ca3af'">
              <component :is="isFavorite ? 'StarFilled' : 'Star'" />
            </el-icon>
          </button>

          <div class="club-profile-image-wrapper">
            <img :src="club.logoUrl" :alt="club.clubName" class="club-profile-image" />
          </div>

          <div class="club-header-info">
            <span class="club-badge">学生社团</span>
            <h1 class="club-title">{{ club.clubName }}</h1>
            <div class="club-meta-grid">
              <div class="club-meta-item">
                <el-icon><User /></el-icon>
                <span>社长: <strong>{{ club.presidentName }}</strong></span>
              </div>
              <div class="club-meta-item">
                <el-icon><Clock /></el-icon>
                <span>创建时间: <strong>{{ formatDate(club.foundedDate) }}</strong></span>
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
      <div class="container club-content-layout">
        <!-- 左侧：活动和详情 -->
        <div class="club-main-column">
          <h2 class="section-title-left">社团活动</h2>

          <template v-if="club.activities && club.activities.length > 0">
            <div v-for="activity in club.activities" :key="activity.activityId" class="activity-card">
              <div class="activity-date-box">
                <span class="activity-month">{{ getMonth(activity.startTime) }}月</span>
                <span class="activity-day">{{ getDay(activity.startTime) }}</span>
              </div>
              <div class="activity-content">
                <div class="activity-tags">
                  <el-tag :type="getStatusType(getComputedStatus(activity))" size="small">
                    {{ getStatusText(getComputedStatus(activity)) }}
                  </el-tag>
                </div>
                <h3 class="activity-title">{{ activity.activityTitle }}</h3>
                <div class="activity-location">
                  <el-icon><Location /></el-icon>
                  {{ activity.location }}
                </div>
                <div class="activity-actions">
                  <el-button size="small" @click="showActivityDetail(activity)">查看详情</el-button>
                  <!-- 只有进行中或未来的活动可以报名 -->
                  <el-button 
                    v-if="getComputedStatus(activity) === '0' || getComputedStatus(activity) === '1'" 
                    type="primary" 
                    size="small" 
                    @click="signUpActivity(activity)"
                  >
                    立即报名
                  </el-button>
                </div>
              </div>
            </div>
          </template>

          <el-empty v-else description="暂无公开活动" />

        </div>

        <!-- 右侧：侧边栏 -->
        <aside class="club-sidebar">
          <!-- 招募卡片 -->
          <div class="recruit-card">
            <h3 class="recruit-title">加入我们!</h3>
            <p class="recruit-desc">成为 {{ club.clubName }} 的一员，开启你的精彩旅程。</p>
            <el-button type="primary" class="recruit-btn" @click="isModalOpen = true">
              申请加入
            </el-button>
          </div>

          <!-- 公告 -->
          <div class="sidebar-section">
            <h3 class="sidebar-title">社团公告</h3>
            <template v-if="club.notices && club.notices.length > 0">
              <div v-for="notice in club.notices" :key="notice.noticeId" class="notice-item">
                <div class="notice-date">{{ notice.publishTime }}</div>
                <div class="notice-link" @click="viewNotice(notice)">{{ notice.noticeTitle }}</div>
              </div>
            </template>
            <div v-else class="no-notices">暂无最新公告</div>
          </div>

          <!-- 联系方式 -->
          <div class="sidebar-section">
              <h3 class="sidebar-title">联系我们</h3>
              <div class="contact-info">
                  <div v-if="club.contactPhone" class="contact-item">
                      <el-icon><Phone /></el-icon> {{ club.contactPhone }}
                  </div>
                  <div v-if="club.contactEmail" class="contact-item">
                      <el-icon><Message /></el-icon> {{ club.contactEmail }}
                  </div>
              </div>
          </div>
        </aside>
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
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, OfficeBuilding, Clock, Calendar, Location, Star, StarFilled, Phone, Message } from '@element-plus/icons-vue'
import { getClub, joinClub } from '@/api/user/club'
import { listActivitiesByClub, registerActivity } from '@/api/user/activity'
import { listNoticesByClub } from '@/api/user/notice'

const route = useRoute()
const router = useRouter()
const club = ref(null)
const loading = ref(true)
const isFavorite = ref(false)
const isModalOpen = ref(false)
const submitLoading = ref(false)
const applyFormRef = ref(null)

const applicationForm = ref({
  clubId: undefined,
  name: '',
  studentId: '',
  reason: ''
})

const applyRules = {
    name: [{ required: true, message: '请输入姓名', trigger: 'blur'}],
    studentId: [{ required: true, message: '请输入学号', trigger: 'blur'}],
    reason: [{ required: true, message: '请输入申请理由', trigger: 'blur'}]
}

const loadClub = () => {
  const id = route.params.id
  if (!id) return
  
  loading.value = true
  getClub(id).then(async response => {
    const clubData = response.data
    
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
        console.error("Failed to load related data", e)
    }
    
    club.value = clubData
    // Check if favorite (mock)
    isFavorite.value = false 
    loading.value = false
  }).catch(() => {
    club.value = null
    loading.value = false
  })
}

onMounted(loadClub)
watch(() => route.params.id, loadClub)

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  ElMessage.success(isFavorite.value ? '已添加到收藏' : '已取消收藏')
}

const formatDate = (dateStr) => {
    if(!dateStr) return '';
    return dateStr.split(' ')[0]; // Returns YYYY-MM-DD
}

const getMonth = (date) => new Date(date).getMonth() + 1
const getDay = (date) => new Date(date).getDate()

const getComputedStatus = (activity) => {
    const now = new Date()
    // Parse times. Note: assuming DB stores as string 'YYYY-MM-DD HH:mm:ss' or ISO
    // If times are null, fallback to DB status or '0' (Upcoming)
    if (!activity.startTime) return activity.status || '0'
    
    const start = new Date(activity.startTime)
    // If no endTime, maybe assume 2 hours duration or just use start time
    const end = activity.endTime ? new Date(activity.endTime) : new Date(start.getTime() + 2 * 60 * 60 * 1000)
    
    if (now < start) return '0' // Upcoming
    if (now >= start && now <= end) return '1' // Ongoing
    return '2' // Ended
}

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

const signUpActivity = (activity) => {
  registerActivity(activity.activityId).then(response => {
    ElMessage.success(response.msg || '报名成功: ' + activity.activityTitle)
  }).catch(error => {
    // 错误已由request拦截器处理
  })
}

const viewNotice = (notice) => {
    ElMessageBox.alert(notice.noticeContent, notice.noticeTitle, {
        confirmButtonText: '关闭',
        dangerouslyUseHTMLString: false
    })
}

const handleApply = () => {
    if (!applyFormRef.value) return;
    
    applyFormRef.value.validate((valid) => {
        if (valid) {
            submitLoading.value = true
            const data = {
                clubId: club.value.clubId,
                ...applicationForm.value
            }
            joinClub(data).then(res => {
                ElMessage.success(res.msg || '申请已提交')
                isModalOpen.value = false
                applicationForm.value = { name: '', studentId: '', reason: '' }
                submitLoading.value = false
            }).catch(() => {
                submitLoading.value = false
            })
        }
    })
}
</script>

<style lang="scss" scoped>
.club-detail-page {
  background: #f9fafb;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
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
}

.club-profile-image-wrapper {
  flex-shrink: 0;
  width: 100%;
  max-width: 300px;
}

.club-profile-image {
  width: 100%;
  height: 200px;
  border-radius: 12px;
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

.club-content-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  padding-bottom: 4rem;

  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
}

.section-title-left {
  text-align: left;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #111827;
}

.activity-card {
  display: flex;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  flex-direction: column;

  @media (min-width: 640px) {
    flex-direction: row;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
}

.activity-date-box {
  background-color: #f9fafb;
  color: #374151;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  min-width: auto;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
  gap: 0.5rem;

  @media (min-width: 640px) {
    flex-direction: column;
    padding: 1rem;
    min-width: 100px;
    border-right: 1px solid #e5e7eb;
    border-bottom: none;
    gap: 0;
  }
}

.activity-day {
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1;
  color: #1f2937;
}

.activity-month {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
}

.activity-content {
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.activity-tags {
  margin-bottom: 0.5rem;
}

.activity-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.activity-location {
  font-size: 0.95rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.activity-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.75rem;
}

.sidebar-section {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.sidebar-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f3f4f6;
  color: #111827;
}

.notice-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f9fafb;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
}

.notice-date {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 0.2rem;
}

.notice-link {
  font-size: 0.95rem;
  color: #4b5563;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
      color: #3b82f6;
  }
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    color: #4b5563;
}

.no-notices {
  color: #9ca3af;
  font-style: italic;
  font-size: 0.9rem;
}

.recruit-card {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
  margin-bottom: 1.5rem;
}

.recruit-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.recruit-desc {
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.recruit-btn {
  width: 100%;
  background: white !important;
  color: #2563eb !important;
  font-weight: 700;
  border: none !important;

  &:hover {
    background: #f8fafc !important;
  }
}
</style>

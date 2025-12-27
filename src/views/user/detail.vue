<template>
  <div class="club-detail-page">
    <!-- 加载状态 -->
    <div v-if="!club" class="container loading">
      <el-skeleton :rows="10" animated />
    </div>

    <template v-else>
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
                <el-icon><OfficeBuilding /></el-icon>
                <span>创建时间: <strong>{{ club.foundedDate }}</strong></span>
              </div>
              <div class="club-meta-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ club.remark }}</span>
              </div>
              <div class="club-meta-item">
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
                  <el-tag :type="getStatusType(activity.status)" size="small">
                    {{ getStatusText(activity.status) }}
                  </el-tag>
                </div>
                <h3 class="activity-title">{{ activity.activityTitle }}</h3>
                <div class="activity-location">
                  <el-icon><Location /></el-icon>
                  {{ activity.location }}
                </div>
                <div class="activity-actions">
                  <el-button size="small" @click="showActivityDetail">查看详情</el-button>
                  <el-button v-if="activity.status !== '2'" type="primary" size="small" @click="signUpActivity">
                    立即报名
                  </el-button>
                </div>
              </div>
            </div>
          </template>

          <el-empty v-else description="暂无公开活动" />

          <!-- 加入要求 (Note: Simplified as mocked DB model didn't include explicit requirements array, assuming description covers it or removed for now if not in DB schema provided) -->
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
                <div class="notice-text">{{ notice.noticeContent }}</div>
              </div>
            </template>
            <div v-else class="no-notices">暂无最新公告</div>
          </div>

          <!-- 留言板 -->
          <div class="sidebar-section">
            <h3 class="sidebar-title">留言板</h3>
            <div class="members-only">仅限成员查看留言。</div>
          </div>
        </aside>
      </div>
    </template>

    <!-- 申请弹窗 -->
    <el-dialog v-model="isModalOpen" :title="`申请加入 ${club?.clubName || ''}`" width="600px">
      <el-form :model="applicationForm" label-position="top">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="姓名" required>
              <el-input v-model="applicationForm.name" placeholder="请输入您的姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学号" required>
              <el-input v-model="applicationForm.studentId" placeholder="例如: 20210001" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="专业/班级" required>
          <el-input v-model="applicationForm.major" placeholder="例如: 计算机科学与技术 2班" />
        </el-form-item>
        <el-form-item label="申请理由" required>
          <el-input
            v-model="applicationForm.reason"
            type="textarea"
            :rows="4"
            placeholder="你为什么想加入这个社团？（50字以上）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isModalOpen = false">取消</el-button>
        <el-button type="primary" @click="handleApply">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getClub } from '@/api/user/club'
import { listActivitiesByClub } from '@/api/user/activity'
import { listNoticesByClub } from '@/api/user/notice'

const route = useRoute()
const club = ref(null)
const isFavorite = ref(false)
const isModalOpen = ref(false)

const applicationForm = ref({
  name: '',
  studentId: '',
  major: '',
  reason: ''
})

const loadClub = () => {
  const id = route.params.id
  club.value = null // Reset first
  
  getClub(id).then(async response => {
    const clubData = response.data
    
    // Concurrently fetch related data
    const [activitiesRes, noticesRes] = await Promise.all([
        listActivitiesByClub(id),
        listNoticesByClub(id)
    ])

    clubData.activities = activitiesRes.data || []
    clubData.notices = noticesRes.data || []
    
    club.value = clubData
    isFavorite.value = false
  }).catch(() => {
    club.value = null
  })
}

onMounted(loadClub)
watch(() => route.params.id, loadClub)

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  ElMessage.success(isFavorite.value ? '已添加到收藏' : '已取消收藏')
}

const getMonth = (date) => new Date(date).getMonth() + 1
const getDay = (date) => new Date(date).getDate()

const getStatusType = (status) => {
  const types = { '0': 'info', '1': 'success', '2': 'warning', '3': 'danger' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { '0': '待开始', '1': '进行中', '2': '已结束', '3': '已取消' }
  return texts[status] || status
}

const showActivityDetail = () => {
  ElMessage.info('跳转至活动详情')
}

const signUpActivity = () => {
  ElMessage.success('报名成功！')
}

const handleApply = () => {
  ElMessage.success('申请已提交！社长稍后会进行审核。')
  isModalOpen.value = false
  applicationForm.value = { name: '', studentId: '', major: '', reason: '' }
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
  background: linear-gradient(to bottom, #f0f9ff 0%, #ffffff 100%);
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
  max-width: 350px;
}

.club-profile-image {
  width: 100%;
  height: auto;
  border-radius: 12px;
  border: 4px solid #ffffff;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  object-fit: cover;
  aspect-ratio: 4/3;
}

.club-header-info {
  flex: 1;
  width: 100%;
  padding-right: 3rem;
}

.club-badge {
  display: inline-block;
  background-color: rgba(59, 130, 246, 0.1);
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
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.club-meta-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #6b7280;

  .el-icon {
    color: #3b82f6;
  }
}

.club-description {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 8px;

  p {
    line-height: 1.8;
    color: #111827;
    font-size: 1.05rem;
    margin: 0;
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
  background-color: #eff6ff;
  color: #2563eb;
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
    min-width: 80px;
    border-right: 1px solid #e5e7eb;
    border-bottom: none;
    gap: 0;
  }
}

.activity-day {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.activity-month {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
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
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.activity-location {
  font-size: 0.875rem;
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

.requirements-section {
  margin-top: 3rem;
  padding: 2rem;
  background-color: #fff;
  border: 1px dashed #3b82f6;
  border-radius: 12px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background-color: #3b82f6;
  }
}

.req-header {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.req-intro {
  margin-bottom: 1rem;
  color: #4b5563;
}

.req-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.req-item {
  display: flex;
  margin-bottom: 0.75rem;
  align-items: flex-start;
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
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 0.5rem;
  color: #111827;
}

.notice-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f9fafb;

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
}

.notice-date {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.2rem;
}

.notice-text {
  font-size: 0.95rem;
  line-height: 1.5;
  color: #111827;
}

.no-notices,
.members-only {
  color: #6b7280;
  font-style: italic;
}

.recruit-card {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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
  color: #3b82f6 !important;
  font-weight: 700;
  border: none !important;

  &:hover {
    background: #f8fafc !important;
  }
}
</style>

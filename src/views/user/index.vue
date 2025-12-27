<template>
  <div class="user-home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <h1 class="hero-title">寻找你的校园社区</h1>
        <p class="hero-subtitle">
          发现、加入并领导符合你兴趣的学生组织。<br/>
          与同龄人联系并提升你的技能。
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="$router.push('/user/clubs')">
            探索社团
          </el-button>
          <el-button size="large" @click="$router.push('/user/club-apply')">
            创建新社团
          </el-button>
        </div>
      </div>
    </section>

    <!-- 公告通知 -->
    <section class="notice-section" v-if="notices.length > 0">
      <div class="container">
        <div class="notice-bar">
          <el-icon class="notice-icon"><Bell /></el-icon>
          <div class="notice-content">
            <span class="notice-tag">最新公告</span>
            <span class="notice-title">{{ notices[0].noticeTitle }}</span>
          </div>
          <el-button link type="primary" @click="viewNotice(notices[0])">查看详情</el-button>
        </div>
      </div>
    </section>

    <!-- 热门社团 -->
    <main id="clubs" class="section club-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">热门社团</h2>
          <el-button link @click="$router.push('/user/clubs')">查看全部 <el-icon><ArrowRight /></el-icon></el-button>
        </div>
        <div class="club-grid">
          <ClubCard v-for="club in clubs" :key="club.clubId" :club="club" />
        </div>
      </div>
    </main>

    <!-- 校园活动 -->
    <section class="section activity-section" v-if="activities.length > 0">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">精彩活动</h2>
          <el-button link @click="$router.push('/user/activities')">更多活动 <el-icon><ArrowRight /></el-icon></el-button>
        </div>
        <div class="activity-grid">
          <ActivityCard v-for="activity in activities" :key="activity.activityId" :activity="activity" />
        </div>
      </div>
    </section>

    <!-- AI Assistant -->
    <AIAssistant />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Bell, ArrowRight } from '@element-plus/icons-vue'
import { listClubs } from '@/api/user/club'
import { listActivities } from '@/api/user/activity'
import { listNotices } from '@/api/user/notice'
import { ElMessageBox } from 'element-plus'
import ClubCard from './components/ClubCard.vue'
import ActivityCard from './components/ActivityCard.vue'
import AIAssistant from './components/AIAssistant.vue'

const clubs = ref([])
const activities = ref([])
const notices = ref([])

onMounted(() => {
  getStats()
})

const getStats = () => {
  listClubs({ pageNum: 1, pageSize: 6 }).then(response => {
    clubs.value = response.data || response.rows?.slice(0, 6) || []
  })
  
  listActivities({ pageNum: 1, pageSize: 3, status: '1' }).then(response => {
    // try to get ongoing first, if empty get upcoming
    if (response.rows && response.rows.length > 0) {
        activities.value = response.rows.slice(0, 3)
    } else {
        listActivities({ pageNum: 1, pageSize: 3 }).then(res => {
            activities.value = res.rows?.slice(0, 3) || []
        })
    }
  })

  listNotices({ pageNum: 1, pageSize: 5 }).then(response => {
    notices.value = response.rows || []
  })
}

const viewNotice = (notice) => {
  ElMessageBox.alert(
    `<div style="white-space: pre-wrap;">${notice.noticeContent}</div>`,
    notice.noticeTitle,
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭'
    }
  )
}
</script>

<style lang="scss" scoped>
.user-home-page {
  min-height: 100vh;
  background: #f9fafb;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.hero-section {
  text-align: center;
  padding: 5rem 0;
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0) 100%);
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #111827;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto 2rem;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;

  .el-button {
    height: 48px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    padding: 0 32px;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

    &--primary {
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
      border: none;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(64, 158, 255, 0.4);
      }
      
      &:active {
        transform: scale(0.98);
      }
    }

    &:not(.el-button--primary) {
      border: 1px solid #e5e7eb;
      color: #4b5563;
      background: #ffffff;
      
      &:hover {
        border-color: var(--el-color-primary);
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
        transform: translateY(-2px);
      }
    }
  }
}

.notice-section {
  margin-top: -2rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 10;
}

.notice-bar {
  background: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;

  .notice-icon {
    color: #f59e0b;
    font-size: 1.25rem;
  }

  .notice-content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    overflow: hidden;

    .notice-tag {
      background: #fef3c7;
      color: #d97706;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      white-space: nowrap;
    }

    .notice-title {
      color: #374151;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.section {
  padding: 3rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.8rem;
  color: #111827;
  font-weight: 700;
  margin: 0;
}

.club-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}
</style>

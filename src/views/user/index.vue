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
          <el-button size="large" @click="$router.push('/register')">
            创建新社团
          </el-button>
        </div>
      </div>
    </section>

    <!-- 热门社团 -->
    <main id="clubs" class="club-section">
      <div class="container">
        <h2 class="section-title">热门社团</h2>
        <div class="club-grid">
          <ClubCard v-for="club in clubs" :key="club.clubId" :club="club" />
        </div>
        <div class="view-all">
          <el-button type="primary" plain @click="$router.push('/user/clubs')">
            查看全部社团
            <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </main>

    <!-- AI Assistant -->
    <AIAssistant />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listClubs } from '@/api/user/club'
import ClubCard from './components/ClubCard.vue'
import AIAssistant from './components/AIAssistant.vue'

const clubs = ref([])

onMounted(() => {
  getClubs()
})

const getClubs = () => {
  listClubs().then(response => {
    clubs.value = response.data.slice(0, 6)
  })
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

.club-section {
  padding: 4rem 0;
}

.section-title {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 3rem;
  color: #111827;
}

.club-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.view-all {
  text-align: center;
  margin-top: 3rem;

  .el-button {
    height: 42px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 15px;
    padding: 0 28px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(64, 158, 255, 0.15);
    }
  }
}
</style>

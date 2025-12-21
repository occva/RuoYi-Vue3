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
          <ClubCard v-for="club in clubs" :key="club.id" :club="club" />
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
import { ref } from 'vue'
import { MOCK_CLUBS } from './data/mockData'
import ClubCard from './components/ClubCard.vue'
import AIAssistant from './components/AIAssistant.vue'

const clubs = ref(MOCK_CLUBS.slice(0, 6))
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
}
</style>

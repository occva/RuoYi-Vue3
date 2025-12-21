<template>
  <div class="user-layout">
    <!-- 顶部导航 -->
    <header class="user-header">
      <div class="header-container">
        <router-link to="/user/home" class="logo">
          <el-icon :size="28"><Connection /></el-icon>
          <span>社团中心</span>
        </router-link>
        
        <nav class="nav-links">
          <router-link to="/user/home" class="nav-link">首页</router-link>
          <router-link to="/user/clubs" class="nav-link">全部社团</router-link>
          <a href="#" class="nav-link">校园活动</a>
          <a href="#" class="nav-link">关于我们</a>
        </nav>
        
        <div class="auth-buttons">
          <el-button @click="handleLogin">登录</el-button>
          <el-button type="primary" @click="$router.push('/register')">注册</el-button>
        </div>

        <!-- 移动端菜单按钮 -->
        <el-button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen" :icon="Menu" circle />
      </div>
    </header>

    <!-- 移动端导航 -->
    <transition name="slide-down">
      <div v-if="mobileMenuOpen" class="mobile-nav">
        <router-link to="/user/home" class="mobile-nav-link" @click="mobileMenuOpen = false">首页</router-link>
        <router-link to="/user/clubs" class="mobile-nav-link" @click="mobileMenuOpen = false">全部社团</router-link>
        <a href="#" class="mobile-nav-link">校园活动</a>
        <a href="#" class="mobile-nav-link">关于我们</a>
        <div class="mobile-auth">
          <el-button @click="() => { handleLogin(); mobileMenuOpen = false }">登录</el-button>
          <el-button type="primary" @click="$router.push('/register'); mobileMenuOpen = false">注册</el-button>
        </div>
      </div>
    </transition>

    <!-- 主内容区 -->
    <main class="user-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 页脚 -->
    <footer class="user-footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-brand">
            <el-icon :size="24"><Connection /></el-icon>
            <span>社团中心</span>
          </div>
          <p class="footer-desc">发现、加入并领导符合你兴趣的学生组织</p>
        </div>
        <div class="footer-links">
          <div class="footer-section">
            <h4>快速链接</h4>
            <router-link to="/user/home">首页</router-link>
            <router-link to="/user/clubs">社团列表</router-link>
          </div>
          <div class="footer-section">
            <h4>帮助与支持</h4>
            <a href="#">常见问题</a>
            <a href="#">联系我们</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 社团中心. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Menu } from '@element-plus/icons-vue'
import { getToken } from '@/utils/auth'

const router = useRouter()
const mobileMenuOpen = ref(false)

const handleLogin = () => {
  console.log('点击登录按钮')
  console.log('当前token:', getToken())

  // 如果已经有token，跳转到管理后台首页
  if (getToken()) {
    console.log('已登录状态，跳转到管理后台')
    router.push('/index')
    return
  }

  console.log('跳转到登录页面')
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.user-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
}

.user-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #3b82f6;
  text-decoration: none;
}

.nav-links {
  display: none;
  gap: 1.5rem;

  @media (min-width: 768px) {
    display: flex;
  }
}

.nav-link {
  color: #6b7280;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
  padding: 0.5rem 0;

  &:hover,
  &.router-link-active {
    color: #3b82f6;
  }
}

.auth-buttons {
  display: none;
  gap: 0.5rem;

  @media (min-width: 768px) {
    display: flex;
  }
}

.mobile-menu-btn {
  display: flex;

  @media (min-width: 768px) {
    display: none;
  }
}

.mobile-nav {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem;

  @media (min-width: 768px) {
    display: none;
  }
}

.mobile-nav-link {
  display: block;
  padding: 0.75rem 0;
  color: #374151;
  text-decoration: none;
  border-bottom: 1px solid #f3f4f6;

  &:hover {
    color: #3b82f6;
  }
}

.mobile-auth {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.user-main {
  flex: 1;
}

.user-footer {
  background: #1f2937;
  color: #9ca3af;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem 1.5rem;
}

.footer-content {
  margin-bottom: 2rem;

  .footer-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: white;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .footer-desc {
    color: #9ca3af;
    font-size: 0.9rem;
  }
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section {
  h4 {
    color: white;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  a {
    display: block;
    color: #9ca3af;
    text-decoration: none;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;

    &:hover {
      color: white;
    }
  }
}

.footer-bottom {
  border-top: 1px solid #374151;
  padding-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
}

// 动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

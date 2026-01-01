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
          <router-link to="/user/activities" class="nav-link">校园活动</router-link>
          <a href="#" class="nav-link">关于我们</a>
        </nav>
        
        <div class="right-section" v-if="!userStore.token">
          <div class="auth-buttons">
            <el-button @click="handleLogin" class="login-btn">登录</el-button>
            <el-button type="primary" @click="$router.push('/register')" class="register-btn">注册</el-button>
          </div>
        </div>

        <div class="right-section" v-else>
          <el-dropdown @command="handleCommand" class="avatar-container" trigger="hover" popper-class="user-dropdown-menu">
            <div class="avatar-wrapper">
              <img :src="userStore.avatar" class="user-avatar" />
              <el-icon class="el-icon--right"><caret-bottom /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <div class="dropdown-header">
                  <img :src="userStore.avatar" class="dropdown-avatar" />
                  <div class="header-info">
                    <span class="dropdown-nickname">{{ userStore.nickName }}</span>
                    <span class="dropdown-username" v-if="userStore.name">@{{ userStore.name }}</span>
                  </div>
                </div>
                
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  <span>设置中心</span>
                </el-dropdown-item>
                
                <el-divider />
                
                <el-dropdown-item command="logout" class="logout-item">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 移动端菜单按钮 -->
        <el-button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen" :icon="Menu" circle />
      </div>
    </header>

    <!-- 设置弹窗 -->
    <SettingsDialog v-model="settingsVisible" />

    <!-- 移动端导航 -->
    <transition name="slide-down">
      <div v-if="mobileMenuOpen" class="mobile-nav">
        <router-link to="/user/home" class="mobile-nav-link" @click="mobileMenuOpen = false">首页</router-link>
        <router-link to="/user/clubs" class="mobile-nav-link" @click="mobileMenuOpen = false">全部社团</router-link>
        <a href="#" class="mobile-nav-link">校园活动</a>
        <a href="#" class="mobile-nav-link">关于我们</a>
        <div class="mobile-auth" v-if="!userStore.token">
          <el-button @click="() => { handleLogin(); mobileMenuOpen = false }">登录</el-button>
          <el-button type="primary" @click="$router.push('/register'); mobileMenuOpen = false">注册</el-button>
        </div>
        <div class="mobile-user" v-else>
          <div class="mobile-user-info" @click="handleMobileSettings">
            <img :src="userStore.avatar" class="mobile-avatar" />
            <span>{{ userStore.nickName }}</span>
          </div>
          <el-button type="danger" plain class="mobile-logout" @click="logout">退出登录</el-button>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Menu, User, SwitchButton, CaretBottom, Setting } from '@element-plus/icons-vue'
import { getToken } from '@/utils/auth'
import useUserStore from '@/store/modules/user'
import { ElMessageBox } from 'element-plus'
import SettingsDialog from './components/SettingsDialog.vue'

const router = useRouter()
const userStore = useUserStore()
const mobileMenuOpen = ref(false)
const settingsVisible = ref(false)

onMounted(() => {
  if (userStore.token && !userStore.name) {
    userStore.getInfo().catch(() => {})
  }
})

const handleLogin = () => {
  router.push('/login')
}

function handleCommand(command) {
  switch (command) {
    case "logout":
      logout()
      break
    case "settings":
      settingsVisible.value = true
      break
    default:
      break
  }
}

function handleMobileSettings() {
  mobileMenuOpen.value = false
  settingsVisible.value = true
}

function logout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    showClose: false
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = '/user/home'
    })
  }).catch(() => { })
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

.right-section {
  display: none;
  
  @media (min-width: 768px) {
    display: flex;
    align-items: center;
  }
}

.auth-buttons {
  display: flex;
  gap: 0.75rem;

  .login-btn {
    border: none;
    height: 36px;
    padding: 0 16px;
    border-radius: 8px;
    font-weight: 600;
    color: #4b5563;
    transition: all 0.2s;
    
    &:hover {
      color: #3b82f6;
      background: #eff6ff;
    }
  }

  .register-btn {
    height: 36px;
    padding: 0 20px;
    border-radius: 8px; // Premium radius
    font-weight: 600;
    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 12px -1px rgba(59, 130, 246, 0.3);
    }
    
    &:active {
      transform: scale(0.98);
    }
  }
}

.avatar-container {
  cursor: pointer;
  
  .avatar-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem;
    border-radius: 9999px;
    transition: all 0.2s;

    &:hover {
      background: #f3f4f6;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .el-icon--right {
      font-size: 12px;
      color: #9ca3af;
    }
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

.mobile-user {
  margin-top: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .mobile-user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;

    .mobile-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    span {
      font-weight: 600;
      color: #374151;
    }
  }

  .mobile-logout {
    width: 100%;
  }
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

// 全局样式优化基础组件
:deep(.el-button) {
  border-radius: 8px;
}

.user-dropdown-menu {
  &.el-popper {
    border: none !important;
    border-radius: 16px !important;
    padding: 8px !important;
    box-shadow: 0 16px 48px 16px rgba(0, 0, 0, 0.1), 0 12px 32px 0 rgba(0, 0, 0, 0.12), 0 8px 16px -8px rgba(0, 0, 0, 0.16) !important;
  }

  .el-dropdown-menu {
    border: none !important;
    padding: 0 !important;
    min-width: 200px;
  }

  .dropdown-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid #f3f4f6;
    margin-bottom: 8px;

    .dropdown-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
    }

    .header-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow: hidden;

      .dropdown-nickname {
        font-weight: 700;
        font-size: 15px;
        color: #1f2937;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .dropdown-username {
        font-size: 12px;
        color: #6b7280;
      }
    }
  }

  .el-dropdown-menu__item {
    padding: 10px 16px !important;
    margin: 2px 4px !important;
    border-radius: 8px !important;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #4b5563;

    &:hover {
      background-color: #f3f4f6 !important;
      color: #3b82f6 !important;
    }

    &.logout-item {
      color: #ef4444;
      &:hover {
        background-color: #fef2f2 !important;
        color: #ef4444 !important;
      }
    }
  }

  .el-divider {
    margin: 4px 0 !important;
  }
}
</style>

<template>
  <div class="user-layout">
    <!-- 顶部导航 -->
    <header class="user-header" :class="{ 'is-open': mobileMenuOpen }">
      <div class="header-container">
        <router-link to="/user/home" class="logo">
          <span class="logo-icon">
            <el-icon :size="20"><Connection /></el-icon>
          </span>
          <span class="logo-text">社团中心</span>
          <span class="logo-badge">用户端</span>
        </router-link>
        
        <nav class="nav-links">
          <router-link to="/user/home" class="nav-link">首页</router-link>
          <router-link to="/user/clubs" class="nav-link">全部社团</router-link>
          <router-link to="/user/activities" class="nav-link">校园活动</router-link>
          <router-link to="/user/my-clubs" class="nav-link">我的社团</router-link>
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
        <router-link to="/user/activities" class="mobile-nav-link" @click="mobileMenuOpen = false">校园活动</router-link>
        <router-link to="/user/my-clubs" class="mobile-nav-link" @click="mobileMenuOpen = false">我的社团</router-link>
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
          <p class="footer-desc">发现、加入并领导符合你兴趣的社团组织</p>
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
          <p>&copy; 2024 社团中心 版权所有</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Menu, SwitchButton, CaretBottom, Setting } from '@element-plus/icons-vue'
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
  --header-border: rgba(255, 255, 255, 0.12);
  --header-surface: rgba(245, 250, 255, 0.44);
  --header-accent: #1d4ed8;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif;
  background: #f5f8ff;
}

.user-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--header-surface);
  backdrop-filter: blur(8px) saturate(114%);
  -webkit-backdrop-filter: blur(8px) saturate(114%);
  border-bottom: 1px solid var(--header-border);
  box-shadow: 0 8px 20px -24px rgba(24, 66, 148, 0.26);
  transition: box-shadow 0.25s ease;
}

.user-header.is-open {
  box-shadow: 0 10px 22px -22px rgba(17, 66, 176, 0.32);
}

.header-container {
  position: relative;
  z-index: 1;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0.82rem 1.5rem;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.9rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: fit-content;
  font-weight: 700;
  color: #123465;
  text-decoration: none;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 13px;
  position: relative;
  overflow: hidden;
  display: grid;
  place-items: center;
  color: #f8fbff;
  background: linear-gradient(152deg, #2459cf, #4a7ff2);
  border: 1px solid rgba(255, 255, 255, 0.56);
  box-shadow: 0 12px 24px -18px rgba(16, 56, 148, 0.92), inset 0 1px 0 rgba(255, 255, 255, 0.42);

  &::before {
    content: "";
    position: absolute;
    inset: -12px -10px 15px 8px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.58), rgba(255, 255, 255, 0));
    transform: rotate(-15deg);
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 4px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.32);
    pointer-events: none;
    mix-blend-mode: screen;
  }

  :deep(.el-icon) {
    transform: translateY(0.5px);
    pointer-events: none;
  }
}

.logo-text {
  font-size: 1.1rem;
  letter-spacing: 0.01em;
}

.logo-badge {
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  border: 1px solid rgba(76, 122, 230, 0.22);
  background: rgba(233, 242, 255, 0.9);
  color: #2850af;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.nav-links {
  display: none;

  @media (min-width: 768px) {
    display: inline-flex;
    justify-self: center;
    gap: 0.3rem;
    border-radius: 999px;
    padding: 0.3rem;
    background: rgba(255, 255, 255, 0.76);
    border: 1px solid rgba(153, 179, 235, 0.22);
    box-shadow: 0 14px 26px -22px rgba(34, 81, 187, 0.95);
  }
}

.nav-link {
  color: #576581;
  font-size: 0.92rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 0.52rem 0.92rem;
  border-radius: 999px;

  &:hover {
    color: #153b82;
    background: rgba(242, 247, 255, 0.96);
  }

  &.router-link-active {
    color: #111827;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 12px 20px -22px rgba(39, 88, 193, 0.45);
  }
}

.right-section {
  display: none;
  
  @media (min-width: 768px) {
    display: flex;
    align-items: center;
    justify-self: end;
  }
}

.auth-buttons {
  display: flex;
  gap: 0.6rem;
  border-radius: 999px;
  padding: 0.2rem;
  border: 1px solid rgba(156, 182, 235, 0.26);
  background: rgba(255, 255, 255, 0.65);
  box-shadow: 0 14px 26px -26px rgba(17, 63, 169, 0.9);

  .login-btn {
    border: 1px solid transparent;
    height: 34px;
    padding: 0 15px;
    border-radius: 999px;
    font-weight: 600;
    color: #2d4067;
    background: transparent;
    transition: all 0.2s ease;
    
    &:hover {
      color: #18439f;
      border-color: rgba(24, 67, 159, 0.2);
      background: rgba(237, 245, 255, 0.9);
    }
  }

  .register-btn {
    height: 34px;
    padding: 0 18px;
    border-radius: 999px;
    font-weight: 600;
    border: none;
    background: linear-gradient(135deg, #1d4ed8, #4674ed);
    box-shadow: 0 16px 26px -20px rgba(29, 78, 216, 0.95);
    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 14px 24px -16px rgba(25, 71, 177, 0.95);
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
    gap: 0.45rem;
    padding: 0.24rem 0.46rem 0.24rem 0.24rem;
    border-radius: 999px;
    border: 1px solid rgba(155, 182, 235, 0.28);
    background: rgba(255, 255, 255, 0.67);
    box-shadow: 0 16px 30px -25px rgba(25, 76, 191, 0.95);
    transition: all 0.2s;

    &:hover {
      transform: translateY(-1px);
      border-color: rgba(31, 80, 185, 0.35);
      background: rgba(248, 251, 255, 0.95);
    }

    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      object-fit: cover;
      border: 1px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 10px 20px -14px rgba(15, 47, 107, 0.95);
    }

    .el-icon--right {
      font-size: 12px;
      color: #7f90af;
    }
  }
}

.mobile-menu-btn {
  display: flex;
  border: 1px solid rgba(143, 171, 227, 0.36);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 16px 26px -20px rgba(30, 84, 194, 0.9);

  @media (min-width: 768px) {
    display: none;
  }
}

.mobile-nav {
  margin: 0 0.75rem;
  margin-bottom: 0.85rem;
  padding: 0.7rem;
  border-radius: 0 0 18px 18px;
  border: 1px solid rgba(146, 173, 227, 0.2);
  border-top: none;
  background: linear-gradient(175deg, rgba(255, 255, 255, 0.98), rgba(243, 248, 255, 0.92));
  box-shadow: 0 18px 30px -24px rgba(24, 70, 172, 0.85);

  @media (min-width: 768px) {
    display: none;
  }
}

.mobile-nav-link {
  display: block;
  padding: 0.78rem 0.8rem;
  color: #344563;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.2s ease;

  &:hover {
    color: #2150bc;
    background: rgba(232, 241, 255, 0.76);
  }

  &.router-link-active {
    color: #18419a;
    background: rgba(227, 238, 255, 0.9);
  }
}

.mobile-auth {
  margin-top: 0.7rem;
  display: flex;
  gap: 0.5rem;

  .el-button {
    flex: 1;
    border-radius: 10px;
    height: 36px;
    font-weight: 600;
  }
}

.mobile-user {
  margin-top: 0.8rem;
  padding: 0.8rem;
  border-top: 1px dashed rgba(129, 158, 217, 0.3);
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  border-radius: 12px;
  background: rgba(250, 252, 255, 0.8);

  .mobile-user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    border-radius: 10px;
    padding: 0.3rem 0.2rem;
    transition: background-color 0.2s ease;

    &:hover {
      background: rgba(228, 238, 255, 0.72);
    }

    .mobile-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 1px solid rgba(255, 255, 255, 0.9);
    }

    span {
      font-weight: 600;
      color: #293a5b;
    }
  }

  .mobile-logout {
    width: 100%;
    border-radius: 10px;
    font-weight: 600;
    height: 36px;
  }
}

@media (min-width: 768px) {
  .header-container {
    grid-template-columns: auto 1fr auto;
  }
}

@media (max-width: 576px) {
  .header-container {
    padding: 0.75rem 1rem;
  }

  .logo-badge {
    display: none;
  }

  .mobile-nav {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
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

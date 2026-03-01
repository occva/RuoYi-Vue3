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
                
                <!-- 管理端入口 -->
                <el-dropdown-item v-if="isManager" command="admin">
                  <el-icon><Monitor /></el-icon>
                  <span>管理端</span>
                </el-dropdown-item>
                
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
          <el-button v-if="isManager" type="primary" plain class="mobile-admin" @click="$router.push('/index')">管理端</el-button>
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
      <div class="footer-bg-decoration"></div>
      <div class="footer-container">
        <div class="footer-main">
          <!-- 品牌区域 -->
          <div class="footer-brand-section">
            <div class="footer-brand">
              <div class="footer-logo">
                <el-icon :size="22"><Connection /></el-icon>
              </div>
              <div class="brand-text">
                <span class="brand-name">社团中心</span>
                <span class="brand-tag">Campus Clubs</span>
              </div>
            </div>
            <p class="footer-desc">发现、加入并领导符合你兴趣的社团组织，让大学生活更精彩</p>
            <div class="social-links">
              <a href="#" class="social-link" aria-label="微信" title="微信">
                <svg viewBox="0 0 1024 1024" fill="currentColor"><path d="M664.250054 368.541681c10.015098 0 19.892049 0.732687 29.67281 1.795902-26.647917-122.810047-159.358451-214.077703-310.826188-214.077703-169.353083 0-308.085774 114.232694-308.085774 259.274068 0 83.708494 46.165436 152.460344 123.281791 205.78483l-30.80868 91.730191 107.688651-53.455469c38.558178 7.53665 69.459978 15.308661 107.924012 15.308661 9.66308 0 19.230993-0.470721 28.752858-1.225921-6.025227-20.36584-9.521864-41.723264-9.521864-63.862493C402.328693 476.632491 517.908058 368.541681 664.250054 368.541681zM498.62897 285.87389c23.200398 0 38.557154 15.120372 38.557154 38.061874 0 22.846334-15.356756 38.156018-38.557154 38.156018-23.107277 0-46.260603-15.309684-46.260603-38.156018C452.368366 300.994262 475.522716 285.87389 498.62897 285.87389zM283.016307 362.090758c-23.107277 0-46.402843-15.309684-46.402843-38.156018 0-22.941502 23.295566-38.061874 46.402843-38.061874 23.081695 0 38.46301 15.120372 38.46301 38.061874C321.479317 346.782098 306.098002 362.090758 283.016307 362.090758zM945.448458 606.151333c0-121.888048-123.258255-221.236753-261.683954-221.236753-146.57838 0-262.015505 99.348706-262.015505 221.236753 0 122.06508 115.437126 221.200938 262.015505 221.200938 30.66644 0 61.617359-7.609305 92.423993-15.262612l84.513836 45.786813-23.178909-76.17082C899.379213 735.776599 945.448458 674.90216 945.448458 606.151333zM598.803483 567.994292c-15.332197 0-30.807656-15.096836-30.807656-30.501688 0-15.190981 15.47546-30.477129 30.807656-30.477129 23.295566 0 38.558178 15.286148 38.558178 30.477129C637.361661 552.897456 622.099049 567.994292 598.803483 567.994292zM768.25071 567.994292c-15.213493 0-30.594809-15.096836-30.594809-30.501688 0-15.190981 15.381315-30.477129 30.594809-30.477129 23.107277 0 38.558178 15.286148 38.558178 30.477129C806.808888 552.897456 791.357987 567.994292 768.25071 567.994292z"/></svg>
              </a>
              <a href="#" class="social-link" aria-label="QQ" title="QQ">
                <svg viewBox="0 0 1024 1024" fill="currentColor"><path d="M824.8 613.2c-16-51.4-34.4-94.6-62.7-165.3C766.5 262.2 689.3 112 511.5 112 331.7 112 256.2 265.2 261 447.9c-28.4 70.8-46.7 113.7-62.7 165.3-34 109.5-23 154.8-14.6 155.8 18 2.2 70.1-82.4 70.1-82.4 0 49 25.2 112.9 79.8 159-26.4 8.1-85.7 29.9-71.6 53.8 11.4 19.3 196.2 12.3 249.5 6.3 53.3 6 238.1 13 249.5-6.3 14.1-23.8-45.3-45.7-71.6-53.8 54.6-46.2 79.8-110.1 79.8-159 0 0 52.1 84.6 70.1 82.4 8.5-1.1 19.5-46.4-14.5-155.8z"/></svg>
              </a>
              <a href="#" class="social-link" aria-label="邮箱" title="邮箱">
                <el-icon :size="18"><Message /></el-icon>
              </a>
            </div>
          </div>

          <!-- 快速链接 -->
          <div class="footer-section">
            <h4 class="section-title">探索</h4>
            <router-link to="/user/home" class="footer-link">
              <span>首页</span>
              <el-icon class="link-icon"><ArrowRight /></el-icon>
            </router-link>
            <router-link to="/user/clubs" class="footer-link">
              <span>全部社团</span>
              <el-icon class="link-icon"><ArrowRight /></el-icon>
            </router-link>
            <router-link to="/user/activities" class="footer-link">
              <span>校园活动</span>
              <el-icon class="link-icon"><ArrowRight /></el-icon>
            </router-link>
          </div>

          <!-- 我的社团 -->
          <div class="footer-section">
            <h4 class="section-title">我的</h4>
            <router-link to="/user/my-clubs" class="footer-link">
              <span>我的社团</span>
              <el-icon class="link-icon"><ArrowRight /></el-icon>
            </router-link>
            <a href="#" class="footer-link">
              <span>我的申请</span>
              <el-icon class="link-icon"><ArrowRight /></el-icon>
            </a>
            <a href="#" class="footer-link">
              <span>活动记录</span>
              <el-icon class="link-icon"><ArrowRight /></el-icon>
            </a>
          </div>

          <!-- 帮助支持 -->
          <div class="footer-section">
            <h4 class="section-title">帮助</h4>
            <a href="#" class="footer-link">
              <span>常见问题</span>
              <el-icon class="link-icon"><ArrowRight /></el-icon>
            </a>
            <a href="#" class="footer-link">
              <span>联系客服</span>
              <el-icon class="link-icon"><ArrowRight /></el-icon>
            </a>
            <a href="#" class="footer-link">
              <span>意见反馈</span>
              <el-icon class="link-icon"><ArrowRight /></el-icon>
            </a>
          </div>
        </div>

        <!-- 底部版权 -->
        <div class="footer-bottom">
          <div class="footer-bottom-content">
            <p class="copyright">
              <span class="copyright-symbol">©</span>
              <span>2026</span>
              <span class="brand-highlight">社团中心</span>
              <span class="divider">|</span>
              <span>让校园生活更精彩</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Menu, SwitchButton, CaretBottom, Setting, ArrowRight, Message, Monitor } from '@element-plus/icons-vue'
import useUserStore from '@/store/modules/user'
import { ElMessageBox } from 'element-plus'
import SettingsDialog from './components/SettingsDialog.vue'
import { isRelogin } from '@/utils/request'
import { removeToken } from '@/utils/auth'

const router = useRouter()
const userStore = useUserStore()
const mobileMenuOpen = ref(false)
const settingsVisible = ref(false)

const isManager = computed(() => {
  return userStore.roles.some(role => ['admin', 'club_admin', 'president', 'vice_president'].includes(role))
})

onMounted(async () => {
  if (userStore.token && !userStore.name) {
    isRelogin.show = true
    try {
      await userStore.getInfo()
    } catch (e) {
      userStore.token = ''
      userStore.id = ''
      userStore.name = ''
      userStore.nickName = ''
      userStore.avatar = ''
      userStore.roles = []
      userStore.permissions = []
      removeToken()
    } finally {
      isRelogin.show = false
    }
  }
})

const handleLogin = () => {
  router.push('/login')
}

function handleCommand(command) {
  switch (command) {
    case "admin":
      router.push('/index')
      break
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
  display: inline-flex;
  align-items: center;
  color: #576581;
  font-size: 0.92rem;
  line-height: 1;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 0.52rem 0.92rem;
  border-radius: 999px;

  &:hover {
    color: #153b82;
    background: rgba(242, 247, 255, 0.96);
  }

  &.router-link-active,
  &.router-link-exact-active {
    color: #111827;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 12px 20px -22px rgba(39, 88, 193, 0.45);
    transform: none;
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
  gap: 0.3rem;
  border-radius: 999px;
  padding: 0.3rem;
  border: 1px solid rgba(156, 182, 235, 0.26);
  background: rgba(255, 255, 255, 0.65);
  box-shadow: 0 14px 26px -26px rgba(17, 63, 169, 0.9);

  .login-btn {
    border: 1px solid transparent;
    height: 34px;
    padding: 0 15px;
    border-radius: 999px;
    font-weight: 600;
    color: #576581;
    background: transparent;
    transition: all 0.2s ease;
    
    &:hover {
      color: #153b82;
      background: rgba(242, 247, 255, 0.96);
    }
  }

  .register-btn {
    height: 34px;
    padding: 0 18px;
    border-radius: 999px !important;
    font-weight: 600;
    border: none !important;
    background: linear-gradient(135deg, #1d4ed8, #4674ed) !important;
    color: #fff !important;
    overflow: hidden;
    box-shadow: 0 16px 26px -20px rgba(29, 78, 216, 0.95);
    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);

    &:hover, &:focus {
      background: linear-gradient(135deg, #2563eb, #60a5fa) !important;
      color: #fff !important;
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

  &.router-link-active,
  &.router-link-exact-active {
    color: #18419a;
    background: rgba(227, 238, 255, 0.9);
    transform: none;
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
  position: relative;
  background:
    linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%),
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 40px,
      rgba(59, 130, 246, 0.015) 40px,
      rgba(59, 130, 246, 0.015) 80px
    );
  color: #94a3b8;
  margin-top: auto;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
  }

  .footer-bg-decoration {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 100% 60% at 15% 0%, rgba(59, 130, 246, 0.06), transparent 50%),
      radial-gradient(ellipse 80% 50% at 85% 0%, rgba(99, 102, 241, 0.05), transparent 50%),
      radial-gradient(circle at 50% 100%, rgba(59, 130, 246, 0.03) 0%, transparent 60%);
    pointer-events: none;
  }
}

.footer-container {
  position: relative;
  z-index: 1;
  max-width: 1240px;
  margin: 0 auto;
  padding: 4rem 1.5rem 2rem;
}

.footer-main {
  display: grid;
  grid-template-columns: 1.8fr repeat(3, 1fr);
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

// 品牌区域
.footer-brand-section {
  .footer-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .footer-logo {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    color: #f8fbff;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    box-shadow: 0 8px 20px -6px rgba(59, 130, 246, 0.5);
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .brand-name {
    font-size: 1.1rem;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: 0.02em;
  }

  .brand-tag {
    font-size: 0.7rem;
    font-weight: 600;
    color: #64748b;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .footer-desc {
    color: #64748b;
    font-size: 0.9rem;
    line-height: 1.65;
    max-width: 280px;
    margin-bottom: 1.5rem;
  }

  .social-links {
    display: flex;
    gap: 0.5rem;
  }

  .social-link {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    background: rgba(51, 65, 85, 0.5);
    border: 1px solid rgba(71, 85, 105, 0.5);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      color: #f1f5f9;
      background: rgba(59, 130, 246, 0.2);
      border-color: rgba(59, 130, 246, 0.4);
      transform: translateY(-2px);
    }

    svg {
      width: 18px;
      height: 18px;
    }
  }
}

// 链接区域
.footer-section {
  .section-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: #e2e8f0;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 1rem;
  }

  .footer-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #64748b;
    text-decoration: none;
    font-size: 0.9rem;
    padding: 0.4rem 0;
    transition: all 0.2s ease;

    span {
      flex: 1;
    }

    .link-icon {
      font-size: 14px;
      opacity: 0;
      transform: translateX(-4px);
      transition: all 0.25s ease;
    }

    &:hover {
      color: #f1f5f9;
      padding-left: 4px;

      .link-icon {
        opacity: 1;
        transform: translateX(0);
        color: #3b82f6;
      }
    }
  }
}

// 底部版权区
.footer-bottom {
  position: relative;
  padding-top: 2rem;
  border-top: 1px solid rgba(51, 65, 85, 0.6);

  &::before {
    content: "";
    position: absolute;
    top: -1px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #3b82f6, transparent);
  }

  .footer-bottom-content {
    display: flex;
    justify-content: center;
    padding: 0 1rem;
  }

  .copyright {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    color: #64748b;

    .copyright-symbol {
      font-size: 1rem;
    }

    .brand-highlight {
      color: #94a3b8;
      font-weight: 600;
    }

    .divider {
      color: #475569;
      margin: 0 0.25rem;
    }
  }
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

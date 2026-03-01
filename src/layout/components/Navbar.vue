<template>
  <div class="navbar" :class="'nav' + settingsStore.navType">
    <hamburger id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <breadcrumb v-if="settingsStore.navType == 1" id="breadcrumb-container" class="breadcrumb-container" />
    
    <header-search v-if="settingsStore.navType == 1 && appStore.device !== 'mobile'" is-input />

    <top-nav v-if="settingsStore.navType == 2" id="topmenu-container" class="topmenu-container" />
    <template v-if="settingsStore.navType == 3">
      <logo v-if="appStore.device !== 'mobile' && settingsStore.sidebarLogo" :collapse="false"></logo>
      <top-bar id="topbar-container" class="topbar-container" />
    </template>

    <div class="right-menu">
      <template v-if="appStore.device !== 'mobile'">
        <header-search v-if="settingsStore.navType != 1" id="header-search" class="right-menu-item" />

  
  
        <el-tooltip content="主题模式" effect="dark" placement="bottom">
          <div class="right-menu-item hover-effect theme-switch-wrapper" @click="toggleTheme">
            <svg-icon v-if="settingsStore.isDark" icon-class="sunny" />
            <svg-icon v-if="!settingsStore.isDark" icon-class="moon" />
          </div>
        </el-tooltip>

        </template>

      <template v-if="userStore.token">
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
              
              <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
              </el-dropdown-item>
              <el-dropdown-item command="setLayout" v-if="settingsStore.showSettings">
                <el-icon><Setting /></el-icon>
                <span>布局设置</span>
              </el-dropdown-item>
              
              <el-divider />
              
              <el-dropdown-item command="logout" class="logout-item">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
      <template v-else>
        <div class="auth-buttons">
          <el-button type="primary" link @click="$router.push('/login')">登录</el-button>
          <el-button type="primary" link @click="$router.push('/register')">注册</el-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'
import { User, Setting, SwitchButton, CaretBottom } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import TopBar from './TopBar'
import Logo from './Sidebar/Logo'
import Hamburger from '@/components/Hamburger'
import HeaderSearch from '@/components/HeaderSearch'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'

const appStore = useAppStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const router = useRouter()

function toggleSideBar() {
  appStore.toggleSideBar()
}

function handleCommand(command) {
  switch (command) {
    case "profile":
      router.push('/user-profile/profile')
      break
    case "setLayout":
      setLayout()
      break
    case "logout":
      logout()
      break
    default:
      break
  }
}

function logout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    showClose: false
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = '/index'
    })
  }).catch(() => { })
}

const emits = defineEmits(['setLayout'])
function setLayout() {
  emits('setLayout')
}

function toggleTheme() {
  settingsStore.toggleTheme()
}
</script>

<style lang='scss' scoped>
.navbar.nav3 {
  .hamburger-container {
    display: none !important;
  }
}

.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: var(--navbar-bg);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  // padding: 0 8px;
  box-sizing: border-box;

  .hamburger-container {
    height: 100%;
    padding: 0 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    transition: all 0.3s;

    &:hover {
      background: var(--el-fill-color-light);
    }
  }

  .breadcrumb-container {
    flex-shrink: 0;
    margin-left: 4px;
  }

  :deep(.header-search.is-input) {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
    z-index: 10;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .topbar-container {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    overflow: hidden;
    margin-left: 12px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    margin-left: auto;
    height: 100%;
    display: flex;
    align-items: center;
    padding-right: 16px;
    gap: 4px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 10px;
      height: 34px;
      font-size: 18px;
      color: var(--el-text-color-regular);
      border-radius: 8px;
      transition: all 0.2s ease;

      &.hover-effect {
        cursor: pointer;

        &:hover {
          background: var(--el-fill-color-light);
          color: var(--el-color-primary);
        }
      }

      &.theme-switch-wrapper {
        svg {
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          
          &:hover {
            transform: scale(1.15) rotate(15deg);
          }
        }
      }
    }

    .avatar-wrapper {
      margin-left: 8px;
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      cursor: pointer;
      padding: 0.24rem 0.46rem 0.24rem 0.24rem;
      border-radius: 999px;
      border: 1px solid rgba(155, 182, 235, 0.28);
      background: rgba(255, 255, 255, 0.67);
      box-shadow: 0 16px 30px -25px rgba(25, 76, 191, 0.95);
      transition: all 0.2s;

      // Dark mode override
      html.dark & {
        background: var(--el-bg-color-overlay);
        border-color: var(--el-border-color);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      &:hover {
        transform: translateY(-1px);
        border-color: rgba(31, 80, 185, 0.35);
        background: rgba(248, 251, 255, 0.95);

        html.dark & {
          background: var(--el-fill-color);
          border-color: var(--el-color-primary-light-5);
        }
      }

      .user-avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        object-fit: cover;
        border: 1px solid rgba(255, 255, 255, 0.9);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 10px 20px -14px rgba(15, 47, 107, 0.95);

        &:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      }

      .el-icon--right {
        margin-left: 2px;
        font-size: 12px;
        color: #7f90af;
        transition: transform 0.3s ease;
      }

      &:hover .el-icon--right {
        transform: rotate(180deg);
        color: var(--el-text-color-primary);
      }
    }

    .avatar-container {
      margin-right: 0px;
      padding-right: 0px;
      outline: none;

      &:focus, &:focus-visible {
        outline: none !important;
        border: none !important;
      }
    }

    .auth-buttons {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 8px;

      .el-button {
        font-size: 14px;
        font-weight: 500;
        height: 32px;
        padding: 0 12px;
        border-radius: 6px;

        &:hover {
          background-color: var(--el-fill-color-light);
        }
      }
    }
  }
}
</style>

<style lang="scss">
.user-dropdown-menu {
  &.el-popper {
    border: none !important;
    border-radius: 16px !important;
    padding: 8px !important;
    background: var(--el-bg-color-overlay) !important;
    box-shadow: 0 16px 48px 16px rgba(0, 0, 0, 0.1), 0 12px 32px 0 rgba(0, 0, 0, 0.12), 0 8px 16px -8px rgba(0, 0, 0, 0.16) !important;
  }

  .el-dropdown-menu {
    padding: 0 !important;
    min-width: 220px;
    background: transparent !important;
    border: none !important;
  }

  /* Header Section */
  .dropdown-header {
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: 19px;
    align-items: center;
    padding: 20px 20px 16px;
    background: transparent;
    border-bottom: 1px solid var(--el-border-color);
    margin-bottom: 8px;

    .dropdown-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 2px solid var(--el-bg-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transition: transform 0.3s ease;
      margin: 0 !important;
      object-fit: cover;
    }

    &:hover .dropdown-avatar {
      transform: scale(1.05);
    }

    .header-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      min-width: 0;
      gap: 4px;
      padding: 0 !important;
      margin: 0 !important;
      
      .dropdown-nickname {
        font-size: 15px;
        font-weight: 700;
        color: var(--el-text-color-primary);
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .dropdown-username {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        background: var(--el-fill-color-light);
        padding: 2px 8px;
        border-radius: 4px;
        width: fit-content;
        line-height: 1;
        margin-left: -7px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }
    }
  }

  /* Menu Items */
  .el-dropdown-menu__item {
    margin: 2px 4px !important;
    padding: 0 8px !important;
    height: 40px !important;
    line-height: 40px !important;
    border-radius: 8px;
    font-weight: 500;
    color: var(--el-text-color-regular);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;

    .el-icon {
      margin-right: 12px;
      font-size: 16px;
      color: var(--el-text-color-secondary);
      transition: color 0.2s;
    }

    /* Hover Effects */
    &:hover, &:focus {
      background-color: var(--el-color-primary-light-9) !important;
      color: var(--el-color-primary) !important;
      transform: translateY(0);
      box-shadow: none;

      .el-icon {
        color: var(--el-color-primary);
      }
    }
  }

  /* Divider */
  .el-divider--horizontal {
    margin: 6px 0 !important;
    width: 100% !important;
    border-top: 1px solid var(--el-border-color) !important;
    opacity: 1;
  }

  /* Logout Special Style */
  .el-dropdown-menu__item.logout-item {
    margin-top: 8px;
    
    &:hover {
      background-color: var(--el-color-danger-light-9) !important;
      color: var(--el-color-danger) !important;
      
      .el-icon {
        color: var(--el-color-danger);
      }
    }
  }

  /* Arrow (popper) adjustments */
  .el-popper__arrow {
    display: none; /* Hide arrow for cleaner floating look */
  }
}
</style>

<template>
  <div class="sidebar-logo-container" :class="{ 'collapse': collapse }">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <div class="logo-icon-wrapper">
          <el-icon class="sidebar-logo"><Connection /></el-icon>
        </div>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <div class="logo-icon-wrapper">
          <el-icon class="sidebar-logo"><Connection /></el-icon>
        </div>
        <h1 class="sidebar-title">{{ title }}</h1>
      </router-link>
    </transition>
  </div>
</template>

<script setup>
import { Connection } from '@element-plus/icons-vue'
import useSettingsStore from '@/store/modules/settings'
import variables from '@/assets/styles/variables.module.scss'

defineProps({
  collapse: {
    type: Boolean,
    required: true
  }
})

const title = import.meta.env.VITE_APP_TITLE
const settingsStore = useSettingsStore()
const sideTheme = computed(() => settingsStore.sideTheme)

// 获取Logo背景色
const getLogoBackground = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-bg)'
  }
  if (settingsStore.navType == 3) {
    return variables.menuLightBg
  }
  if (sideTheme.value === 'theme-modern') {
    return variables.menuModernBg
  }
  return sideTheme.value === 'theme-dark' ? variables.menuBg : variables.menuLightBg
})

// 获取Logo文字颜色
const getLogoTextColor = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-text)'
  }
  if (settingsStore.navType == 3) {
    return variables.menuLightText
  }
  if (sideTheme.value === 'theme-modern') {
    return variables.menuModernText
  }
  return sideTheme.value === 'theme-dark' ? '#fff' : variables.menuLightText
})
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  height: 50px;
  margin-top: 10px;
  line-height: 50px;
  background: v-bind(getLogoBackground);
  text-align: center;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;

    & .logo-icon-wrapper {
      width: 28px;
      height: 28px;
      border-radius: 9px;
      position: relative;
      overflow: hidden;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
      color: #f8fbff;
      background: linear-gradient(152deg, #2459cf, #4a7ff2);
      border: 1px solid rgba(255, 255, 255, 0.56);
      box-shadow: 0 10px 20px -15px rgba(16, 56, 148, 0.92), inset 0 1px 0 rgba(255, 255, 255, 0.42);
      margin-right: 10px;

      &::before {
        content: "";
        position: absolute;
        inset: -10px -8px 12px 6px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.58), rgba(255, 255, 255, 0));
        transform: rotate(-15deg);
        pointer-events: none;
      }

      &::after {
        content: "";
        position: absolute;
        inset: 3px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.32);
        pointer-events: none;
        mix-blend-mode: screen;
      }

      & .sidebar-logo {
        font-size: 15px;
        margin: 0 !important;
        transform: translateY(0.5px);
        pointer-events: none;
        color: inherit;
      }
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: v-bind(getLogoTextColor);
      font-weight: 700;
      line-height: 50px;
      font-size: 15px;
      font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif;
      vertical-align: middle;
      letter-spacing: 0.02em;
    }
  }

  &.collapse {
    .logo-icon-wrapper {
      margin-right: 0px !important;
    }
  }
}
</style>

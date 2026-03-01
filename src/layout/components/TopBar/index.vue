<template>
  <el-menu 
    :key="menuKey"
    class="topbar-menu" 
    :ellipsis="false" 
    :default-active="activeMenu" 
    :active-text-color="theme" 
    mode="horizontal"
    :menu-trigger="appStore.device === 'mobile' ? 'click' : 'hover'"
    unique-opened
    @select="handleSelect"
  >
    <sidebar-item :key="route.path + index" v-for="(route, index) in topMenus" :item="route" :base-path="route.path" />

    <el-sub-menu index="more" class="el-sub-menu__hide-arrow" v-if="moreRoutes.length > 0">
      <template #title>
        <el-icon><Menu /></el-icon>
        <span>更多菜单</span>
      </template>
      <sidebar-item :key="route.path + index" v-for="(route, index) in moreRoutes" :item="route" :base-path="route.path" />
    </el-sub-menu>
  </el-menu>
</template>

<script setup>
import SidebarItem from '../Sidebar/SidebarItem'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()

const sidebarRouters = computed(() => permissionStore.sidebarRouters)
const theme = computed(() => settingsStore.theme)
const device = computed(() => appStore.device)
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})

const visibleNumber = ref(5)
const topMenus = computed(() => {
  return permissionStore.sidebarRouters.filter((f) => !f.hidden).slice(0, visibleNumber.value)
})
const moreRoutes = computed(() => {
  return permissionStore.sidebarRouters.filter((f) => !f.hidden).slice(visibleNumber.value, sidebarRouters.value.length - visibleNumber.value)
})
const menuKey = ref(0)
const handleSelect = () => {
  if (appStore.device === 'mobile') {
    menuKey.value++
  }
}

watch(() => route.path, () => {
  if (appStore.device === 'mobile') {
    menuKey.value++
  }
})

function setVisibleNumber() {
  const width = document.body.getBoundingClientRect().width / 3
  visibleNumber.value = parseInt(width / 85)
}

onMounted(() => {
  window.addEventListener('resize', setVisibleNumber)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', setVisibleNumber)
})

onMounted(() => {
  setVisibleNumber()
})
</script>

<style lang="scss">
/* 顶级导航栏基础美化 */
.topbar-menu.el-menu--horizontal {
  border-bottom: none !important;
  height: 50px !important;
  background: transparent;
  display: flex !important;
  align-items: center !important;

  .el-menu-item, .el-sub-menu__title {
    height: 36px !important;
    line-height: 36px !important;
    padding: 0 16px !important;
    margin: 0 4px !important;
    border-radius: 10px !important;
    border-bottom: none !important;
    color: var(--el-text-color-primary) !important;
    transition: all 0.3s ease !important;
    font-weight: 500 !important;

    &:hover {
      background: var(--el-fill-color-light) !important;
      color: var(--el-color-primary) !important;
    }

    &.is-active {
      background: var(--el-color-primary-light-9) !important;
      color: var(--el-color-primary) !important;
      font-weight: 500 !important;
    }

    .svg-icon {
      font-size: 16px !important;
      margin-right: 8px !important;
      vertical-align: middle !important;
    }
  }
}

/* 核心修复：彻底消除双层重影 */
.el-popper.is-light.el-menu--horizontal,
.el-menu--horizontal.el-menu--popup-container {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin: 0 !important;

  /* 移除 popper 自带的三角小箭头 */
  .el-popper__arrow {
    display: none !important;
  }

  .el-menu--popup {
    min-width: 140px !important;
    padding: 8px !important;
    border-radius: 16px !important;
    border: 1px solid var(--el-border-color-lighter) !important;
    background: var(--el-bg-color-overlay) !important;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1) !important;
    margin: 0 !important; // 强制清除所有方向的 margin，防止重叠重影
    overflow: visible !important;
    
    /* 解决嵌套侧边呼出时的位移，使用 translate 代替 margin 避免触发重影 */
    &.el-menu--popup-right-start, &.el-menu--popup-right-end {
      transform: translateX(5px) translateY(-5px) !important;
    }
  }

  /* 下拉项美化 - 与 el-dropdown-menu__item 保持一致 */
  .el-menu-item, .el-sub-menu__title, .nest-menu {
    padding: 0 8px !important;
    margin: 2px 4px !important;
    border-radius: 8px !important;
    font-weight: 500 !important;
    color: var(--el-text-color-regular) !important;
    transition: all 0.2s ease !important;
    display: flex !important;
    align-items: center !important;
    height: 40px !important;
    line-height: 40px !important;
    background: transparent !important;
    border-bottom: 1px solid var(--el-border-color-extra-light) !important;
    position: relative;

    &:last-child {
      border-bottom: none !important;
    }

    /* 移除子菜单标题的额外右边距（因为箭头已隐藏） */
    &.el-sub-menu__title {
      padding-right: 8px !important; 
    }

    .svg-icon, .el-icon {
      margin-right: 12px !important;
      font-size: 16px !important;
      color: var(--el-text-color-secondary) !important;
      transition: color 0.2s !important;
    }

    .menu-title {
      font-size: 14px !important;
      font-weight: 500 !important;
      user-select: none;
    }

    /* Hover 效果同步 */
    &:hover {
      background-color: var(--el-color-primary-light-9) !important;
      color: var(--el-color-primary) !important;
      
      .svg-icon, .el-icon {
        color: var(--el-color-primary) !important;
      }
    }

    /* 激活态同步 */
    &.is-active {
      background-color: var(--el-color-primary-light-9) !important;
      color: var(--el-color-primary) !important;
      font-weight: 500 !important;

      .svg-icon, .el-icon {
        color: var(--el-color-primary) !important;
      }
    }
  }

  /* 嵌套项清除边距 */
  .nest-menu {
    .el-menu-item {
      margin: 0 !important;
      width: 100% !important;
      padding: 0 8px !important;
      height: 40px !important;
      line-height: 40px !important;
      border-bottom: none !important; // 嵌套内部不需要分割线
    }
  }

  /* 移除下划线 */
  .el-menu-item.is-active, .el-sub-menu.is-active > .el-sub-menu__title {
    border-bottom: none !important;
  }

  /* 修正下拉嵌套面板的背景 */
  .el-sub-menu {
    .el-menu {
      background: transparent !important;
      border: none !important;
      padding: 0 !important;
      box-shadow: none !important;
      margin: 0 !important;
    }
  }

  /* 彻底移除展开箭头 (PC和移动端) */
  .el-sub-menu__icon-arrow {
    display: none !important;
  }
}

/* 兼容移动端的弹出层定位优化 */
@media (max-width: 768px) {
  .el-menu--horizontal.el-menu--popup-container {
    .el-menu--popup {
      min-width: 160px !important;
    }
  }
}
</style>






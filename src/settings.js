export default {
  /**
   * 网页标题
   */
  title: import.meta.env.VITE_APP_TITLE,

  /**
   * 侧边栏主题 当前启用：浅色主题theme-light、现代主题theme-modern
   * 停用的深色主题theme-dark保留为注释，便于后续恢复
   */
  // sideTheme: 'theme-dark',
  sideTheme: 'theme-light',

  /**
   * 是否系统布局配置
   */
  showSettings: true,

  /**
   * 是否显示顶部导航
   */
  topNav: false,

  /**
   * 菜单导航模式 1、纯左侧 2、纯顶部
   */
  navType: 1,

  /**
   * 是否显示 tagsView
   */
  tagsView: true,

  /**
   * 显示页签图标
   */
  tagsIcon: false,

  /**
   * 是否固定头部
   */
  fixedHeader: true,

  /**
   * 是否显示logo
   */
  sidebarLogo: true,

  /**
   * 是否显示动态标题
   */
  dynamicTitle: false,

}

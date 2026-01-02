import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isHttp, isPathMatch } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register', '/user', '/user/*']

const isWhiteList = (path) => {
  return whiteList.some(pattern => isPathMatch(pattern, path))
}

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title)
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else if (isWhiteList(to.path)) {
      next()
    } else {
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true
        // 判断当前用户是否已拉取完user_info信息
        try {
          await useUserStore().getInfo()
          isRelogin.show = false
        } catch (err) {
          useUserStore().logOut().then(() => {
            ElMessage.error(err)
            next({ path: '/' })
          })
          NProgress.done()
          return
        }
      }

      // 检查是否具备后台管理权限
      const roles = useUserStore().roles
      const hasAdminAccess = roles.some(role =>
        ['admin', 'club_admin', 'president', 'vice_president'].includes(role)
      )

      // 根路径智能重定向
      if (to.path === '/') {
        if (hasAdminAccess) {
          next({ path: '/index' })  // 管理员跳转到管理端首页
        } else {
          next({ path: '/user/home' })  // 普通用户跳转到用户端首页
        }
        NProgress.done()
        return
      }

      // 排除不需要检查管理权限的路径（用户路径 /user/**、提示页）
      const isUserPath = to.path.startsWith('/user') ||
        to.path === '/403_redirect' ||
        to.path === '/login' ||
        to.path === '/register'

      // 如果没有管理权限，且尝试访问的是真正的管理功能模块（由动态路由生成的路径）
      if (!hasAdminAccess && !isUserPath) {
        next({ path: '/user/home' })  // 重定向到用户首页
        NProgress.done()
        return
      }

      // 如果已经加载了 roles 且没有动态添加过路由（若依逻辑：通过 permissions 判断是否有路由）
      if (usePermissionStore().routes.length === 0) {
        const accessRoutes = await usePermissionStore().generateRoutes()
        // 根据roles权限生成可访问的路由表
        accessRoutes.forEach(route => {
          if (!isHttp(route.path)) {
            router.addRoute(route)
          }
        })
        next({ ...to, replace: true })
      } else {
        next()
      }
    }
  } else {
    // 没有token
    if (isWhiteList(to.path)) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

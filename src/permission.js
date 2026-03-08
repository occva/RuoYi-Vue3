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

const whiteList = ['/', '/login', '/register', '/user', '/user/**']

const isWhiteList = (path) => {
  return whiteList.some(pattern => isPathMatch(pattern, path))
}

router.beforeEach(async (to, from) => {
  NProgress.start()

  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title)

    if (to.path === '/login') {
      NProgress.done()
      return { path: '/' }
    }

    if (isWhiteList(to.path)) {
      return true
    }

    if (useUserStore().roles.length === 0) {
      isRelogin.show = true
      try {
        await useUserStore().getInfo()
        isRelogin.show = false
      } catch (err) {
        await useUserStore().logOut()
        ElMessage.error(err)
        NProgress.done()
        return { path: '/' }
      }
    }

    const roles = useUserStore().roles
    const hasAdminAccess = roles.some(role =>
      ['admin', 'club_admin', 'president', 'vice_president'].includes(role)
    )

    if (to.path === '/') {
      NProgress.done()
      return { path: '/user/home' }
    }

    const isUserPath = to.path.startsWith('/user') ||
      to.path === '/403_redirect' ||
      to.path === '/login' ||
      to.path === '/register'

    if (!hasAdminAccess && !isUserPath) {
      NProgress.done()
      return { path: '/user/home' }
    }

    if (usePermissionStore().routes.length === 0) {
      const accessRoutes = await usePermissionStore().generateRoutes()
      accessRoutes.forEach(route => {
        if (!isHttp(route.path)) {
          router.addRoute(route)
        }
      })
      return { ...to, replace: true }
    }

    return true
  }

  if (isWhiteList(to.path)) {
    return true
  }

  NProgress.done()
  return `/login?redirect=${to.fullPath}`
})

router.afterEach(() => {
  NProgress.done()
})

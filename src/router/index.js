import { createWebHistory, createRouter } from 'vue-router'

/* Layout */
import Layout from '@admin/layout'

// 用户端布局
const UserLayout = () => import('@/views/user/layout.vue')

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会在侧边栏出现
 * alwaysShow: true                 // 当设置 true 的时候会一直显示根菜单
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1}'               // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏
  }
 */

// 公共路由
export const constantRoutes = [
    // ========== 用户端路由 ==========
    {
        path: '/user',
        component: UserLayout,
        redirect: '/user/home',
        hidden: true,
        children: [
            {
                path: 'home',
                name: 'UserHome',
                component: () => import('@/views/user/index.vue'),
                meta: { title: '用户首页' }
            },
            {
                path: 'clubs',
                name: 'UserClubList',
                component: () => import('@/views/user/clubs.vue'),
                meta: { title: '社团列表' }
            },
            {
                path: 'club/:id',
                name: 'UserClubDetail',
                component: () => import('@/views/user/detail.vue'),
                meta: { title: '社团详情' }
            },
            {
                path: 'club-apply',
                name: 'UserClubApply',
                component: () => import('@/views/user/club-apply.vue'),
                meta: { title: '创建社团' }
            },
            {
                path: 'my-clubs',
                name: 'UserMyClubs',
                component: () => import('@/views/user/my-clubs.vue'),
                meta: { title: '我的社团' }
            },
            {
                path: 'activities',
                name: 'UserActivities',
                component: () => import('@/views/user/activities.vue'),
                meta: { title: '校园活动' }
            },
            {
                path: 'activity/:id',
                name: 'UserActivityDetail',
                component: () => import('@/views/user/activity-detail.vue'),
                meta: { title: '活动详情' }
            }
        ]
    },
    // ========== 管理端路由 ==========
    {
        path: '/redirect',
        component: Layout,
        hidden: true,
        children: [
            {
                path: '/redirect/:path(.*)',
                component: () => import('@admin/views/redirect/index.vue')
            }
        ]
    },
    {
        path: '/login',
        component: () => import('@admin/views/login'),
        hidden: true
    },
    {
        path: '/register',
        component: () => import('@admin/views/register'),
        hidden: true
    },
    {
        path: '/:pathMatch(.*)*',
        component: () => import('@admin/views/error/404'),
        hidden: true
    },
    {
        path: '/403_redirect',
        component: () => import('@admin/views/error/403_redirect'),
        hidden: true
    },
    {
        path: '/401',
        component: () => import('@admin/views/error/401'),
        hidden: true
    }
]

// 动态路由，基于用户权限动态去加载
export const dynamicRoutes = [
    // 管理端首页（需要管理员权限）
    {
        path: '',
        component: Layout,
        redirect: '/index',
        roles: ['admin', 'club_admin', 'president', 'vice_president'],
        children: [
            {
                path: '/index',
                component: () => import('@admin/views/index'),
                name: 'Index',
                meta: { title: '首页', icon: 'dashboard', affix: true }
            }
        ]
    },
    // 管理端个人中心（需要登录）
    {
        path: '/user-profile',
        component: Layout,
        hidden: true,
        redirect: 'noredirect',
        roles: ['admin', 'club_admin', 'president', 'vice_president'],
        children: [
            {
                path: 'profile',
                component: () => import('@admin/views/system/user/profile/index'),
                name: 'Profile',
                meta: { title: '个人中心', icon: 'user' }
            }
        ]
    },
    {
        path: '/club-operation',
        component: Layout,
        hidden: false,
        name: 'ClubOperation',
        meta: { title: '社团运营', icon: 'peoples' },
        permissions: ['system:club:list'],
        children: [
            {
                path: 'category',
                component: () => import('@/views/club/category/index'),
                name: 'ClubCategory',
                meta: { title: '社团分类', icon: 'category' },
                permissions: ['system:category:list']
            },
            {
                path: 'list',
                component: () => import('@/views/club/list/index'),
                name: 'ClubList',
                meta: { title: '社团列表', icon: 'list' },
                permissions: ['system:club:list']
            },
            {
                path: 'achievement',
                component: () => import('@/views/club/achievement/index'),
                name: 'ClubAchievement',
                meta: { title: '荣誉管理', icon: 'star' },
                permissions: ['system:achievement:list']
            },
            {
                path: 'application',
                component: () => import('@/views/club/application/index'),
                name: 'ClubApplication',
                meta: { title: '入社申请', icon: 'edit' },
                permissions: ['club:application:list']
            },
            {
                path: 'application-stat',
                component: () => import('@/views/club/application/stat'),
                name: 'ApplicationStat',
                meta: { title: '申请统计', icon: 'chart' },
                permissions: ['club:application:list']
            },
            {
                path: 'member',
                component: () => import('@/views/club/member/index'),
                name: 'ClubMember',
                meta: { title: '成员管理', icon: 'peoples' },
                permissions: ['club:member:list']
            }
        ]
    },
    {
        path: '/club-promotion',
        component: Layout,
        name: 'ClubPromotion',
        meta: { title: '社团宣传', icon: 'message' },
        permissions: ['system:notice:list'],
        children: [
            {
                path: 'notice',
                component: () => import('@/views/club/notice/index'),
                name: 'ClubNotice',
                meta: { title: '公告管理', icon: 'message' },
                permissions: ['system:notice:list']
            },
            {
                path: 'activity',
                component: () => import('@/views/club/activity/index'),
                name: 'ClubActivity',
                meta: { title: '活动管理', icon: 'date' },
                permissions: ['system:activity:list']
            },
            {
                path: 'registration',
                component: () => import('@/views/club/registration/index'),
                name: 'ClubRegistration',
                meta: { title: '报名管理', icon: 'checkbox' },
                permissions: ['club:registration:list']
            }
        ]
    },
    {
        path: '/statistics',
        component: Layout,
        name: 'Statistics',
        meta: { title: '数据统计', icon: 'chart' },
        permissions: ['system:club:list'],
        children: [
            {
                path: 'club-stat',
                component: () => import('@/views/statistics/club-stat/index.vue'),
                name: 'ClubStat',
                meta: { title: '社团统计', icon: 'peoples' },
                permissions: ['system:club:list']
            },
            {
                path: 'member-stat',
                component: () => import('@/views/statistics/member-stat/index.vue'),
                name: 'MemberStat',
                meta: { title: '成员统计', icon: 'user' },
                permissions: ['system:statistics:member']
            },
            {
                path: 'activity-stat',
                component: () => import('@/views/statistics/activity-stat/index.vue'),
                name: 'ActivityStat',
                meta: { title: '活动统计', icon: 'date' },
                permissions: ['system:activity:list']
            }
        ]
    },
    {
        path: '/system/user-auth',
        component: Layout,
        hidden: true,
        permissions: ['system:user:edit'],
        children: [
            {
                path: 'role/:userId(\\d+)',
                component: () => import('@admin/views/system/user/authRole'),
                name: 'AuthRole',
                meta: { title: '分配角色', activeMenu: '/system/user' }
            }
        ]
    },
    {
        path: '/system/role-auth',
        component: Layout,
        hidden: true,
        permissions: ['system:role:edit'],
        children: [
            {
                path: 'user/:roleId(\\d+)',
                component: () => import('@admin/views/system/role/authUser'),
                name: 'AuthUser',
                meta: { title: '分配用户', activeMenu: '/system/role' }
            }
        ]
    },
    {
        path: '/system/dict-data',
        component: Layout,
        hidden: true,
        permissions: ['system:dict:list'],
        children: [
            {
                path: 'index/:dictId(\\d+)',
                component: () => import('@admin/views/system/dict/data'),
                name: 'Data',
                meta: { title: '字典数据', activeMenu: '/system/dict' }
            }
        ]
    },
    {
        path: '/monitor/job-log',
        component: Layout,
        hidden: true,
        permissions: ['monitor:job:list'],
        children: [
            {
                path: 'index/:jobId(\\d+)',
                component: () => import('@admin/views/monitor/job/log'),
                name: 'JobLog',
                meta: { title: '调度日志', activeMenu: '/monitor/job' }
            }
        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes: constantRoutes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        }
        return { top: 0 }
    },
})

export default router

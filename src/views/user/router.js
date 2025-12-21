// 用户端路由配置
// 这些路由需要添加到主路由文件中

const UserLayout = () => import('@/views/user/layout.vue')

export default [
    {
        path: '/user',
        component: UserLayout,
        redirect: '/user/home',
        meta: { title: '用户端' },
        children: [
            {
                path: 'home',
                name: 'UserHome',
                component: () => import('@/views/user/index.vue'),
                meta: { title: '首页' }
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
            }
        ]
    }
]

const Routers = [{
    name: 'index',
    path: '/',
    component: () => import('@/views/index.vue'),
}, {
    name: 'projects',
    path: '/projects',
    meta: {
        title: '项目列表'
    },
    component: () => import('@/views/project/projects.vue')
}, {
    name: 'project',
    path: '/project/:projectId',
    redirect: '/project/kanban',
    meta: {
        title: '项目'
    },
    props: true,
    component: () => import('@/views/project/project.vue'),
    children: [{
        path: 'epics',
        name: 'epics',
        component: () => import('@/views/project/epics.vue')
    }, {
        path: 'kanban',
        name: 'kanban',
        component: () => import('@/views/project/kanban_board.vue')
    }, {
        path: 'members',
        name: 'members',
        component: () => import('@/views/project/members.vue')
    }, {
        path: 'stats',
        name: 'stats',
        props: true,
        component: () => import('@/views/project/stats.vue')
    }, {
        path: 'settings',
        name: 'settings',
        props: true,
        component: () => import('@/views/project/settings.vue')
    }]
}, {
    name: 'users',
    path: '/users',
    meta: {
        title: '用户管理'
    },
    component: () => import('@/views/user/users.vue'),
}, {
    name: 'tasks',
    path: '/tasks',
    meta: {
        title: '任务列表'
    },
    component: () => import('@/views/tasks.vue'),
}, {
    name: 'userTasks',
    path: '/user_tasks',
    props: route => ({userId: route.query.userId}),
    meta: {
        title: '我的任务清单'
    },
    component: () => import('@/views/user/user_tasks.vue'),
}, {
    name: 'sys_settings',
    path: '/sys_settings',
    props: true,
    component: () => import('@/views/settings.vue')
}];

export default Routers;

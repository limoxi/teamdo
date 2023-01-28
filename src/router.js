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
        path: 'tags',
        name: 'tags',
        component: () => import('@/views/project/tags.vue')
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
}];

export default Routers;

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
  redirect: '/project/:projectId/kanban',
  meta: {
    title: '项目'
  },
  props: true,
  component: () => import('@/views/project/project.vue'),
  children: [{
    path: 'kanban',
    name: 'kanban',
    props: true,
    component: () => import('@/views/project/kanban_board.vue')
  }, {
    path: 'members',
    name: 'members',
    props: true,
    component: () => import('@/views/project/members.vue')
  }, {
    path: 'settings',
    name: 'settings',
    props: true,
    component: () => import('@/views/project/settings.vue')
  }]
}];

export default Routers;

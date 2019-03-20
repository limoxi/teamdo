
import IndexPage from './views/index';
import ProjectsPage from './views/project/projects';
import ProjectPage from './views/project/project';
import SprintPage from './views/project/sprint_board';
import KanbanPage from './views/project/kanban_board';
import MembersPage from './views/project/members';
import TasksPage from './views/project/tasks';

const Routers = [{
    path: '/',
    name: 'index',
    component: IndexPage,
}, {
    path: '/projects',
    name: 'projects',
    meta: {
        title: '项目列表'
    },
    component: ProjectsPage
}, {
    path: '/project/:projectId',
    redirect: '/project/:projectId/kanban',
    name: 'project',
    meta: {
        title: '项目'
    },
    props: true,
    component: ProjectPage,
    children: [{
        path: 'kanban',
        name: 'kanban',
        props: true,
        component: KanbanPage
    }, {
        path: 'sprint',
        name: 'sprint',
        component: SprintPage
    }, {
        path: 'tasks',
        name: 'tasks',
        component: TasksPage
    }, {
        path: 'members',
        name: 'members',
        component: MembersPage
    }]
}];

export default Routers;
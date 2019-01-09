
import IndexPage from './views/index'
import ProjectsPage from './views/project/projects';
import ProjectPage from './views/project/project';
import SprintPage from './views/project/sprint_board';

const Routers = [{
    path: '/',
    name: 'index',
    meta: {
        title: '项目列表'
    },
    component: ProjectsPage,
}, {
    path: '/projects',
    name: 'projects',
    meta: {
        title: '项目列表'
    },
    component: ProjectsPage
}, {
    path: '/project/:id',
    name: 'project',
    meta: {
        title: '项目'
    },
    component: ProjectPage,
    children: [{
        path: 'sprint',
        name: 'sprint',
        component: SprintPage
    }]
}];

export default Routers;

import IndexPage from './views/index';
import LoginPage from './views/login';
import registerPage from './views/register';
import ProjectsPage from './views/project/projects';
import ProjectPage from './views/project/project';
import SprintPage from './views/project/sprint_board';
import login from "@src/views/login";

const Routers = [{
    path: '/',
    name: 'index',
    meta: {
        title: '项目列表'
    },
    component: ProjectsPage,
}, {
    path: '/login',
    name: 'login',
    meta: {
        title: '登陆'
    },
    component: LoginPage
}, {
    path: '/register',
    name: 'register',
    meta: {
        title: '注册'
    },
    component: registerPage
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
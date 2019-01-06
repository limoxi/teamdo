
import IndexPage from './views/index.vue'
import ProjectsPage from './views/project/projects.vue';

const Routers = [{
    'path': '/',
    meta: {
        title: '项目列表'
    },
    'component': ProjectsPage,
    'children': [{
        path: 'project',
        children: [{
            path: 'projects',
            meta: {
                title: '项目列表'
            },
            component: ProjectsPage
        }]
    }]
}];

export default Routers;
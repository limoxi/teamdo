import {reactive, ref} from 'vue'
import {defineStore} from 'pinia'
import ProjectService from "@/service/project_service"
import {provide} from "vue";
import TagService from "@/service/tag_service";

class Project{
  constructor(projectData=undefined) {
    this.id = projectData?.id ?? 0
    this.name = projectData?.name ?? ''
    this.prefix = projectData?.prefix ?? 'XXX'
    this.users = projectData?.users ?? []
    this.tags = projectData?.tags ?? []
    this.bots = projectData?.bots ?? []
  }

  reloadTags(){
    if (this.id <= 0) return
    return TagService.getTagsForProject(this.id).then(data => {
      this.tags = data
    })
  }

  reloadUsers(){
    if (this.id <= 0) return
    return ProjectService.getProjectMembers(this.id).then(data => {
      this.users = data
    })
  }

  addUser(userId) {
    return ProjectService.addMember(this.id, userId).then(() => {
      this.reloadUsers();
    })
  }

  removeUser(userId) {
    return ProjectService.deleteMember(this.id, userId).then(() => {
      this.reloadUsers()
    })
  }
}

const useProjectStore = defineStore('project',() => {
  const project = ref(new Project())
  function reload(pid) {
    return ProjectService.getProject(pid).then(data => {
      project.value = new Project(data)
    })
  }

  return {project, reload}
})

export default useProjectStore

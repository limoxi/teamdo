import {ref} from 'vue'
import {defineStore} from 'pinia'
import ProjectService from "@/service/project_service"
import TagService from "@/service/tag_service"
import {Message} from "view-ui-plus"
import LaneService from "@/service/lane_service"

class Project{
  constructor(projectData=undefined) {
    this.id = projectData?.id ?? 0
    this.name = projectData?.name ?? ''
    this.prefix = projectData?.prefix ?? 'XXX'
    this.users = projectData?.users ?? []
    this.tags = projectData?.tags ?? []
    this.bots = projectData?.bots ?? []
    this.lanes = projectData?.lanes ?? []
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

  addLane(name, afterLaneId) {
    return LaneService.addLane(this.id, name, afterLaneId).then((newLane) => {
      const afterIndex = this.lanes.findIndex(lane => lane.id===afterLaneId)
      if (afterIndex < 0) {
        this.lanes.push(newLane)
      } else {
        this.lanes.splice(afterIndex+1, 0, newLane)
      }
    }).catch(err => {
      Message.error(err.errMsg);
    })
  }

  updateLane(data){
    return LaneService.updateLane(this.id, data).then((updatedLane) => {
      const elIndex = this.lanes.findIndex(lane => lane.id===updatedLane.id)
      if (elIndex >= 0) {
        this.lanes[elIndex] = updatedLane
      }
    }).catch(err => {
      Message.error(err.errMsg);
    });
  }

  deleteLane(laneId) {
    return LaneService.deleteLane(this.id, laneId).then(() => {
      const elIndex = this.lanes.findIndex(lane => lane.id===laneId)
      if (elIndex >= 0) {
        this.lanes.splice(elIndex, 1)
      }
    }).catch(err => {
      Message.error(err.errMsg);
    });
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

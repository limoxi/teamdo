import {commandsCtx, themeManagerCtx} from '@milkdown/core'
import {createDropdownItem, slash, slashPlugin} from '@milkdown/plugin-slash'

export const defaultActions = (ctx) => {
  return [
    {
      id: 'taskList',
      dom: createDropdownItem(ctx.get(themeManagerCtx), '注意事项', 'taskList'),
      command: () => ctx.get(commandsCtx).call('TurnIntoTaskList'),
      keyword: ['task list', 'task'],
      typeName: 'task_list_item'
    }
  ]
}

export default slash.configure(slashPlugin, {
  config: (ctx) => ({content, isTopLevel, parentNode}) => {
    if (!isTopLevel) return null

    if (content === '/') {
      return {
        actions: defaultActions(ctx)
      }
    }

    return null
  }
})

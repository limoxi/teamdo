import {VueRenderer} from '@tiptap/vue-3'
import ListView from './list_view.vue'
import tippy from 'tippy.js'

export default {
    items: ({query}) => {
        return [{
            title: 'Heading 1',
            icon: 'ri-h-1',
            command: ({editor, range}) => {
                editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode('heading', {level: 1})
                .run()
            }
        }, {
            title: 'Heading 2',
            icon: 'ri-h-2',
            command: ({editor, range}) => {
                editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode('heading', {level: 2})
                .run()
            }
        }, {
            title: 'Heading 3',
            icon: 'ri-h-3',
            command: ({editor, range}) => {
                editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode('heading', {level: 3})
                .run()
            }
        }, {
            title: 'Bullet List',
            icon: 'ri-list-unordered',
            command: ({editor, range}) => {
                editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleBulletList()
                .run()
            }
        }, {
            title: 'Numbered List',
            icon: 'ri-list-ordered',
            command: ({editor, range}) => {
                editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleOrderedList()
                .run()
            }
        }, {
            title: 'Task List',
            icon: 'ri-list-check-3',
            command: ({editor, range}) => {
                editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleTaskList()
                .run()
            }
        }, {
            title: 'Blockquote',
            icon: 'ri-double-quotes-r',
            command: ({editor, range}) => {
                editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleBlockquote()
                .run()
            }
        }, {
            title: 'Code Block',
            icon: 'ri-code-s-slash-line',
            command: ({editor, range}) => {
                editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleCodeBlock()
                .run()
            }
        }].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10)
    },
    render: () => {
        let component
        let popup
        return {
            onStart: props => {
                component = new VueRenderer(ListView, {
                    props,
                    editor: props.editor
                })
                if (!props.clientRect) {
                    return
                }
                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start'
                })
            },

            onUpdate(props) {
                component.updateProps(props)

                if (!props.clientRect) {
                    return
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect
                })
            },

            onKeyDown(props) {
                if (props.event.key === 'Escape') {
                    popup[0].hide()

                    return true
                }

                console.log(component.ref)

                return component.ref?.onKeyDown(props)
            },

            onExit() {
                popup[0].destroy()
                component.destroy()
            }
        }
    }
}
import {Extension} from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'

export default Extension.create({
    name: 'SlashPlugin',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                command: ({editor, range, props}) => {
                    props.command({editor, range, props})
                }
            }
        }
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion
            })
        ]
    }
})
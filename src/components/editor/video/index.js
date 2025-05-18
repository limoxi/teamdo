import {mergeAttributes, Node, nodeInputRule} from '@tiptap/core'

/**
 * Matches an video to a ![video](src "title") on input.
 */
const inputRegex = /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/
/**
 * This extension allows you to insert videos.
 */
const Video = Node.create({
    name: 'video',
    addOptions() {
        return {
            inline: false,
            allowBase64: false,
            HTMLAttributes: {}
        }
    },
    inline() {
        return this.options.inline
    },
    group() {
        return this.options.inline ? 'inline' : 'block'
    },
    draggable: true,
    addAttributes() {
        return {
            src: {
                default: null
            },
            controls: {
                default: true
            },
            alt: {
                default: null
            },
            title: {
                default: null
            }
        }
    },
    parseHTML() {
        return [
            {
                tag: this.options.allowBase64
                    ? 'video[src]'
                    : 'video[src]:not([src^="data:"])'
            }
        ]
    },
    renderHTML({HTMLAttributes}) {
        return ['video', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
    },
    addCommands() {
        return {
            setVideo: options => ({commands}) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: options
                })
            }
        }
    },
    addInputRules() {
        return [
            nodeInputRule({
                find: inputRegex,
                type: this.type,
                getAttributes: match => {
                    const [, , alt, src, title] = match
                    return {src, alt, title}
                }
            })
        ]
    }
})

export {Video, Video as default, inputRegex}

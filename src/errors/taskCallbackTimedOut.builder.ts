import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'taskCallbackTimedOut',
    name: 'Task Callback Timed Out',
    fields: {
        timeoutMs: {
            type: 'number',
            isRequired: true,
        },
        callback: {
            type: 'text',
            isRequired: false,
        },
        name: {
            type: 'text',
            isRequired: false,
        },
    },
})

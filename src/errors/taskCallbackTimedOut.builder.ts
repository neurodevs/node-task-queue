import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'taskCallbackTimedOut',
    name: 'Task Callback Timed Out',
    fields: {
        timeoutMs: {
            type: 'number',
            isRequired: true,
        },
        task: {
            type: 'text',
            isRequired: true,
        },
    },
})

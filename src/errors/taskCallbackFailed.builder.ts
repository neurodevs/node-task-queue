import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'taskCallbackFailed',
    name: 'Task Callback Failed',
    fields: {
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

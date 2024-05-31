import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'taskCallbackFailed',
    name: 'Task Callback Failed',
    fields: {
        task: {
            type: 'text',
            isRequired: false,
        },
    },
})

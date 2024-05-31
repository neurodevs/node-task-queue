import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const taskCallbackTimedOutSchema: SpruceErrors.NodeTaskQueue.TaskCallbackTimedOutSchema  = {
	id: 'taskCallbackTimedOut',
	namespace: 'NodeTaskQueue',
	name: 'Task Callback Timed Out',
	    fields: {
	            /** . */
	            'timeoutMs': {
	                type: 'number',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'task': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(taskCallbackTimedOutSchema)

export default taskCallbackTimedOutSchema

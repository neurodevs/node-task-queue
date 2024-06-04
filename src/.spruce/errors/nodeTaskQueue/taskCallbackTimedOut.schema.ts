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
	            'callback': {
	                type: 'text',
	                options: undefined
	            },
	            /** . */
	            'name': {
	                type: 'text',
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(taskCallbackTimedOutSchema)

export default taskCallbackTimedOutSchema

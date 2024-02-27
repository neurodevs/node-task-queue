import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const taskCallbackFailedSchema: SpruceErrors.NodeTaskQueue.TaskCallbackFailedSchema  = {
	id: 'taskCallbackFailed',
	namespace: 'NodeTaskQueue',
	name: 'Task Callback Failed',
	    fields: {
	    }
}

SchemaRegistry.getInstance().trackSchema(taskCallbackFailedSchema)

export default taskCallbackFailedSchema

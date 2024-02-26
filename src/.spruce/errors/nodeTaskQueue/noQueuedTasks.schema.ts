import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const noQueuedTasksSchema: SpruceErrors.NodeTaskQueue.NoQueuedTasksSchema  = {
	id: 'noQueuedTasks',
	namespace: 'NodeTaskQueue',
	name: 'No Queued Tasks',
	    fields: {
	    }
}

SchemaRegistry.getInstance().trackSchema(noQueuedTasksSchema)

export default noQueuedTasksSchema

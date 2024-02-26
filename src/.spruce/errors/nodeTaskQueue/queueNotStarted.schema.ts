import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const queueNotStartedSchema: SpruceErrors.NodeTaskQueue.QueueNotStartedSchema  = {
	id: 'queueNotStarted',
	namespace: 'NodeTaskQueue',
	name: 'Queue Not Started',
	    fields: {
	    }
}

SchemaRegistry.getInstance().trackSchema(queueNotStartedSchema)

export default queueNotStartedSchema

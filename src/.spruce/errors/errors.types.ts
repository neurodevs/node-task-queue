import { default as SchemaEntity } from '@sprucelabs/schema'
import * as SpruceSchema from '@sprucelabs/schema'







export declare namespace SpruceErrors.NodeTaskQueue {

	
	export interface TaskCallbackFailed {
		
	}

	export interface TaskCallbackFailedSchema extends SpruceSchema.Schema {
		id: 'taskCallbackFailed',
		namespace: 'NodeTaskQueue',
		name: 'Task Callback Failed',
		    fields: {
		    }
	}

	export type TaskCallbackFailedEntity = SchemaEntity<SpruceErrors.NodeTaskQueue.TaskCallbackFailedSchema>

}


export declare namespace SpruceErrors.NodeTaskQueue {

	
	export interface QueueNotStarted {
		
	}

	export interface QueueNotStartedSchema extends SpruceSchema.Schema {
		id: 'queueNotStarted',
		namespace: 'NodeTaskQueue',
		name: 'Queue Not Started',
		    fields: {
		    }
	}

	export type QueueNotStartedEntity = SchemaEntity<SpruceErrors.NodeTaskQueue.QueueNotStartedSchema>

}


export declare namespace SpruceErrors.NodeTaskQueue {

	
	export interface NoQueuedTasks {
		
	}

	export interface NoQueuedTasksSchema extends SpruceSchema.Schema {
		id: 'noQueuedTasks',
		namespace: 'NodeTaskQueue',
		name: 'No Queued Tasks',
		    fields: {
		    }
	}

	export type NoQueuedTasksEntity = SchemaEntity<SpruceErrors.NodeTaskQueue.NoQueuedTasksSchema>

}





import { default as SchemaEntity } from '@sprucelabs/schema'
import * as SpruceSchema from '@sprucelabs/schema'








export declare namespace SpruceErrors.NodeTaskQueue {

	
	export interface TaskCallbackTimedOut {
		
			
			'timeoutMs': number
			
			'callback'?: string| undefined | null
			
			'name'?: string| undefined | null
	}

	export interface TaskCallbackTimedOutSchema extends SpruceSchema.Schema {
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

	export type TaskCallbackTimedOutEntity = SchemaEntity<SpruceErrors.NodeTaskQueue.TaskCallbackTimedOutSchema>

}


export declare namespace SpruceErrors.NodeTaskQueue {

	
	export interface TaskCallbackFailed {
		
			
			'callback'?: string| undefined | null
			
			'name'?: string| undefined | null
	}

	export interface TaskCallbackFailedSchema extends SpruceSchema.Schema {
		id: 'taskCallbackFailed',
		namespace: 'NodeTaskQueue',
		name: 'Task Callback Failed',
		    fields: {
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





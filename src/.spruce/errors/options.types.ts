import { SpruceErrors } from "#spruce/errors/errors.types"
import { ErrorOptions as ISpruceErrorOptions} from "@sprucelabs/error"

export interface TaskCallbackFailedErrorOptions extends SpruceErrors.NodeTaskQueue.TaskCallbackFailed, ISpruceErrorOptions {
	code: 'TASK_CALLBACK_FAILED'
}
export interface QueueNotStartedErrorOptions extends SpruceErrors.NodeTaskQueue.QueueNotStarted, ISpruceErrorOptions {
	code: 'QUEUE_NOT_STARTED'
}
export interface NoQueuedTasksErrorOptions extends SpruceErrors.NodeTaskQueue.NoQueuedTasks, ISpruceErrorOptions {
	code: 'NO_QUEUED_TASKS'
}

type ErrorOptions =  | TaskCallbackFailedErrorOptions  | QueueNotStartedErrorOptions  | NoQueuedTasksErrorOptions 

export default ErrorOptions

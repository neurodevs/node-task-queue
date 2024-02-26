import { SpruceErrors } from "#spruce/errors/errors.types"
import { ErrorOptions as ISpruceErrorOptions} from "@sprucelabs/error"

export interface QueueNotStartedErrorOptions extends SpruceErrors.NodeTaskQueue.QueueNotStarted, ISpruceErrorOptions {
	code: 'QUEUE_NOT_STARTED'
}
export interface NoQueuedTasksErrorOptions extends SpruceErrors.NodeTaskQueue.NoQueuedTasks, ISpruceErrorOptions {
	code: 'NO_QUEUED_TASKS'
}

type ErrorOptions =  | QueueNotStartedErrorOptions  | NoQueuedTasksErrorOptions 

export default ErrorOptions

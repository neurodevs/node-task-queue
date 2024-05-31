import BaseSpruceError from '@sprucelabs/error'
import ErrorOptions from '#spruce/errors/options.types'

export default class SpruceError extends BaseSpruceError<ErrorOptions> {
    /** an easy to understand version of the errors */
    public friendlyMessage(): string {
        const { options } = this
        let message
        switch (options?.code) {
            case 'NO_QUEUED_TASKS':
                message = 'Cannot start task queue if no tasks are queued!'
                break

            case 'QUEUE_NOT_STARTED':
                message = 'Cannot stop task queue if it has not been started!'
                break

            case 'TASK_CALLBACK_FAILED':
                message = `Task callback failed! ${options?.task ? `Failing callback:\n\n${options?.task}\n\n` : null}Original error:\n\n${options?.originalError?.message}`
                break

            case 'TASK_CALLBACK_TIMED_OUT':
                message = `Task callback timed out after ${options?.timeoutMs} milliseconds! Failing callback:\n\n${options?.task}`
                break

            default:
                message = super.friendlyMessage()
        }

        const fullMessage = options.friendlyMessage
            ? options.friendlyMessage
            : message

        return fullMessage
    }
}

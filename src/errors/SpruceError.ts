import BaseSpruceError from '@sprucelabs/error'
import ErrorOptions from '#spruce/errors/options.types'

export default class SpruceError extends BaseSpruceError<ErrorOptions> {
    /** an easy to understand version of the errors */
    public friendlyMessage(): string {
        const { options } = this
        const { timeoutMs, name, callback, originalError } = options as any

        const formattedCallback = callback
            ? this.formatCallback(callback)
            : null

        const formattedName = name ? this.formatName(name) : null

        const formattedError = originalError?.message
            ? this.formatError(originalError.message)
            : null

        let message

        switch (options?.code) {
            case 'NO_QUEUED_TASKS':
                message = 'Cannot start task queue if no tasks are queued!'
                break

            case 'QUEUE_NOT_STARTED':
                message = 'Cannot stop task queue if it has not been started!'
                break

            case 'TASK_CALLBACK_FAILED':
                message = `Task callback failed! ${formattedName} ${formattedCallback} ${formattedError}`
                break

            case 'TASK_CALLBACK_TIMED_OUT':
                message = `Task callback timed out after ${timeoutMs} milliseconds! ${formattedName} ${formattedCallback}`
                break

            default:
                message = super.friendlyMessage()
        }

        const fullMessage = options.friendlyMessage
            ? options.friendlyMessage
            : message

        return fullMessage
    }

    private formatCallback(callback: string) {
        return `\n\nFailing callback:\n\n${callback}\n\n`
    }

    private formatName(name: string) {
        return `Task Name: ${name}`
    }

    private formatError(err: string) {
        return `\n\nOriginal error:\n\n${err}\n\n`
    }
}

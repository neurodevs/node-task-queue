import {
    RevolvingQueue,
    RevolvingTask,
    RevolvingQueueOptions,
} from '../../impl/RevolvingTaskQueue'

export default class FakeRevolvingQueue implements RevolvingQueue {
    public callsToPushTask: RevolvingTask[] = []
    public callsToConstructor: (RevolvingQueueOptions | undefined)[] = []

    public constructor(options?: RevolvingQueueOptions) {
        this.callsToConstructor.push(options)
    }

    public pushTask(task: RevolvingTask) {
        this.callsToPushTask.push(task)
    }
}

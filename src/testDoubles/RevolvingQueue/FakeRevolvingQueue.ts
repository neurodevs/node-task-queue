import {
    RevolvingQueue,
    RevolvingQueueOptions,
} from '../../impl/RevolvingTaskQueue'
import { Task } from '../../types'

export default class FakeRevolvingQueue implements RevolvingQueue {
    public callsToPushTask: Task[] = []
    public callsToConstructor: (RevolvingQueueOptions | undefined)[] = []

    public constructor(options?: RevolvingQueueOptions) {
        this.callsToConstructor.push(options)
    }

    public pushTask(task: Task) {
        this.callsToPushTask.push(task)
    }
}

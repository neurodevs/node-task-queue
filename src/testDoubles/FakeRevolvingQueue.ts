import {
    RevolvingQueue,
    RevolvingQueueOptions,
    RevolvingTask,
} from '../types/nodeTaskQueue.types'

export default class FakeRevolvingQueue implements RevolvingQueue {
    public pushTaskCalls: RevolvingTask[] = []
    public constructorOptions?: RevolvingQueueOptions

    public constructor(options?: RevolvingQueueOptions) {
        this.constructorOptions = options
    }

    public pushTask(task: RevolvingTask) {
        this.pushTaskCalls.push(task)
    }
}

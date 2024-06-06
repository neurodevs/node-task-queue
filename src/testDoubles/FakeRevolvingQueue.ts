import { RevolvingQueue, RevolvingTask } from '../types/nodeTaskQueue.types'

export default class FakeRevolvingQueue implements RevolvingQueue {
    public pushTaskCalls: RevolvingTask[] = []

    public pushTask(task: RevolvingTask) {
        this.pushTaskCalls.push(task)
    }
}

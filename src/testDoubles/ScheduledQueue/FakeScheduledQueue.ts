import { ScheduledQueue } from '../../impl/ScheduledTaskQueue.js'
import { Task } from '../../types.js'

export default class FakeScheduledQueue implements ScheduledQueue {
    public pushTaskCalls: Task[]
    public numStartCalls: number
    public numStopCalls: number

    public constructor() {
        this.pushTaskCalls = []
        this.numStartCalls = 0
        this.numStopCalls = 0
    }

    public pushTask(task: Task) {
        this.pushTaskCalls.push(task)
    }

    public async start() {
        this.numStartCalls++
    }

    public async stop() {
        this.numStopCalls++
    }

    public resetMock() {
        this.pushTaskCalls = []
        this.numStartCalls = 0
        this.numStopCalls = 0
    }
}

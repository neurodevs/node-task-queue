export interface Task {
    name: string
    callback: TaskCallback
}

export type TaskCallback = () => Promise<void> | void

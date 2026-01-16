
interface Task {
    id: string,
    taskText: string,
    completed: boolean,
}

interface TaskToUpdate {
    text: string,
    complete: boolean,
}

export type { Task, TaskToUpdate };
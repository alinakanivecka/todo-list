import { TaskPriority } from '../types/task-priority.type';

export interface Task {
  clientId: string;
  apiId: number | null;
  title: string;
  completed: boolean;
  priority: TaskPriority;
}

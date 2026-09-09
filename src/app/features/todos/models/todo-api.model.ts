import { TaskPriority } from '../types/task-priority.enum';

export interface Todo {
  id: number;
  createdAt: string;
  todo: string;
  completed: boolean;
  priority: TaskPriority;
}

export interface TodoRequest {
  createdAt: string;
  todo: string;
  completed: boolean;
  priority: TaskPriority;
}

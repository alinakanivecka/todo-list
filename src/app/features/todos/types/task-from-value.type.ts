import { TodoRequest } from '../models/todo-api.model';

export type CreateTaskFormValue = Pick<TodoRequest, 'todo' | 'priority'>;

import { Component, computed, input } from '@angular/core';
import { Todo } from '../../models/todo-api.model';
import { TaskPriority } from '../../types/task-priority.type';

@Component({
  selector: 'app-task-item',
  imports: [],
  templateUrl: './task-item.html',
  styleUrl: './task-item.scss',
})
export class TaskItem {
  readonly task = input.required<Todo>();
  protected readonly taskPriority = TaskPriority;

  protected readonly priorityMetadata = computed<{ text: string; className: string }>(() => {
    const priority = this.task().priority;

    switch (priority) {
      case TaskPriority.Low: {
        return {
          text: 'Low',
          className: 'task-item__priority--low',
        };
      }
      case TaskPriority.Medium: {
        return {
          text: 'Medium',
          className: 'task-item__priority--medium',
        };
      }
      case TaskPriority.High: {
        return {
          text: 'High',
          className: 'task-item__priority--high',
        };
      }

      default: {
        return {
          text: '',
          className: '',
        };
      }
    }
  });
}

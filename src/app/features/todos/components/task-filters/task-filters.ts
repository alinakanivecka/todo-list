import { Component, output, signal } from '@angular/core';
import { TaskFilter } from '../../types/task-filter.type';
import { TodoFilters } from '../../models/todo-filters.model';

@Component({
  selector: 'app-task-filters',
  imports: [],
  templateUrl: './task-filters.html',
  styleUrl: './task-filters.scss',
})
export class TaskFilters {
  protected readonly selectedFilters = signal<TaskFilter>('All');
  protected readonly taskFilters: TaskFilter[] = ['All', 'Active', 'Completed'];
  protected readonly filterUpdated = output<TodoFilters>();

  protected selectFilter(filter: TaskFilter) {
    this.selectedFilters.set(filter);
    this.filterUpdated.emit({
      completed: filter !== 'All' ? filter === 'Completed' : undefined,
    });
  }
}

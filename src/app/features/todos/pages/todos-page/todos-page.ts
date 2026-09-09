import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TodosApiService } from '../../../../core/api/todos-api.service';
import type { Todo } from '../../models/todo-api.model';
import { catchError, EMPTY, finalize, Observable, of, tap } from 'rxjs';
import { TaskForm } from '../../components/task-form/task-form';
import { HttpErrorResponse } from '@angular/common/http';
import { Select } from '../../components/select/select';
import { SelectOption } from '../../models/select-option.model';
import { TodoSort } from '../../models/todo-sort.model';
import { TaskFilters } from '../../components/task-filters/task-filters';
import { TodoFilters } from '../../models/todo-filters.model';
import { FormsModule } from '@angular/forms';
import { TaskItem } from '../../components/task-item/task-item';

@Component({
  selector: 'app-todos-page',
  imports: [TaskForm, Select, TaskFilters, FormsModule, TaskItem],
  templateUrl: './todos-page.html',
  styleUrl: './todos-page.scss',
})
export class TodosPage {
  private readonly todosApi = inject(TodosApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly taskPriorityOptions: SelectOption<TodoSort>[] = [
    { value: { field: 'priority', order: 'asc' }, text: 'low-to-high' },
    { value: { field: 'priority', order: 'desc' }, text: 'high-to-low' },
  ];

  protected readonly tasks = signal<Todo[]>([]);
  protected readonly selectedFilter = signal<TodoFilters>({});
  protected readonly selectedSorting = signal<TodoSort>(this.taskPriorityOptions[0].value);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.loadTasks(this.selectedFilter(), this.selectedSorting()).subscribe();
    });
  }

  protected retryLoadTasks(): void {
    if (this.isLoading()) return;

    this.loadTasks(this.selectedFilter(), this.selectedSorting()).subscribe();
  }

  protected refreshTaskList() {
    this.loadTasks(this.selectedFilter(), this.selectedSorting()).subscribe();
  }

  private loadTasks(filters: TodoFilters, sort: TodoSort): Observable<Todo[]> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    return this.todosApi.getTodos(filters, sort).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return of([]);
        }

        this.errorMessage.set('Couldn’t load your tasks. Please try again.');

        return EMPTY;
      }),
      tap((todos: Todo[]) => this.tasks.set(todos)),
      finalize(() => {
        this.isLoading.set(false);
      }),
    );
  }
}

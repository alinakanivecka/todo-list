import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { TodosApiService } from '../../../../core/api/todos-api.service';
import type { Todo, TodoRequest } from '../../models/todo-api.model';
import { catchError, finalize, Observable, of, switchMap, tap } from 'rxjs';
import { TaskForm } from '../../components/task-form/task-form';
import { TaskList } from '../../components/task-list/task-list';
import { CreateTaskFormValue } from '../../types/task-from-value.type';
import { HttpErrorResponse } from '@angular/common/http';
import { Select } from '../../components/select/select';
import { SelectOption } from '../../models/select-option.model';
import { TodoSort } from '../../models/todo-sort.model';
import { TaskFilters } from '../../components/task-filters/task-filters';
import { TodoFilters } from '../../models/todo-filters.model';
import { FormsModule } from '@angular/forms';

type StatisticsState = 'loading' | 'placeholder' | 'value';

@Component({
  selector: 'app-todos-page',
  imports: [TaskForm, TaskList, Select, TaskFilters, FormsModule],
  templateUrl: './todos-page.html',
  styleUrl: './todos-page.scss',
})
export class TodosPage {
  private readonly todosApi = inject(TodosApiService);

  protected readonly taskPriorityOptions: SelectOption<TodoSort>[] = [
    { value: { field: 'priority', order: 'asc' }, text: 'low-to-high' },
    { value: { field: 'priority', order: 'desc' }, text: 'high-to-low' },
  ];
  protected readonly tasks = signal<Todo[]>([]);
  private readonly taskForm = viewChild(TaskForm);
  protected readonly selectedFilter = signal<TodoFilters>({});
  protected readonly selectedSorting = signal<TodoSort>(this.taskPriorityOptions[0].value);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isCreating = signal(false);
  protected readonly createErrorMessage = signal<string | null>(null);

  protected readonly statisticsState = computed<StatisticsState>(() => {
    if (this.isLoading() && this.tasks().length === 0) {
      return 'loading';
    }

    if (this.errorMessage() || this.tasks().length === 0) {
      return 'placeholder';
    }

    return 'value';
  });

  protected readonly totalTasks = computed(() => this.tasks().length);
  protected readonly activeTasks = computed(
    () => this.tasks().filter((task) => !task.completed).length,
  );
  protected readonly completedTasks = computed(
    () => this.tasks().filter((task) => task.completed).length,
  );

  protected createTask(data: CreateTaskFormValue): void {
    const todoRequest: TodoRequest = {
      createdAt: new Date().toISOString(),
      todo: data.todo,
      priority: data.priority,
      completed: false,
    };

    if (this.isCreating()) {
      return;
    }

    this.isCreating.set(true);
    this.createErrorMessage.set(null);

    this.todosApi
      .addTodo(todoRequest)
      .pipe(
        finalize(() => this.isCreating.set(false)),
        switchMap(() => {
          this.taskForm()?.resetForm();
          return this.loadTasks(this.selectedFilter(), this.selectedSorting());
        }),
      )
      .subscribe({
        error: () => {
          this.createErrorMessage.set('Couldn’t create the task.');
        },
      });
  }

  protected loadTasks(filters: TodoFilters, sort: TodoSort): Observable<Todo[]> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    return this.todosApi.getTodos(filters, sort).pipe(
      finalize(() => this.isLoading.set(false)),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return of([]);
        }

        this.errorMessage.set('Couldn’t load your tasks');

        throw error;
      }),
      tap((todos: Todo[]) => this.tasks.set(todos)),
    );
  }

  constructor() {
    effect(() => {
      this.loadTasks(this.selectedFilter(), this.selectedSorting()).subscribe();
    });
  }
}

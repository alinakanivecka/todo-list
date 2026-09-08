import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { TodosApiService } from '../../../../core/api/todos-api.service';
import type { Todo, TodoRequest } from '../../models/todo-api.model';
import { finalize } from 'rxjs';
import { TaskForm } from '../../components/task-form/task-form';
import { TaskList } from '../../components/task-list/task-list';
import { CreateTaskFormValue } from '../../types/task-from-value.type';

type StatisticsState = 'loading' | 'placeholder' | 'value';

@Component({
  selector: 'app-todos-page',
  imports: [TaskForm, TaskList],
  templateUrl: './todos-page.html',
  styleUrl: './todos-page.scss',
})
export class TodosPage implements OnInit {
  private readonly todosApi = inject(TodosApiService);

  protected readonly tasks = signal<Todo[]>([]);
  private readonly taskForm = viewChild(TaskForm);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isCreating = signal(false);
  protected readonly createErrorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadTasks();
  }

  protected readonly statisticsState = computed<StatisticsState>(() => {
    if (this.isLoading()) {
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
      .pipe(finalize(() => this.isCreating.set(false)))
      .subscribe({
        next: (createdTodo) => {
          this.tasks.update((tasks) => [createdTodo, ...tasks]);
          this.taskForm()?.resetForm();
        },
        error: () => {
          this.createErrorMessage.set('Couldn’t create the task.');
        },
      });
  }

  protected loadTasks(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.todosApi
      .getTodos()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (todos) => {
          this.tasks.set(todos);
        },
        error: () => {
          this.errorMessage.set('Couldn’t load your tasks');
        },
      });
  }
}

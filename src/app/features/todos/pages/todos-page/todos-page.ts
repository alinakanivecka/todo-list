import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TodosApiService } from '../../../../core/api/todos-api.service';
import type { Task } from '../../models/task.model';
import type { Todo } from '../../models/todo-api.model';
import { finalize } from 'rxjs';
import { TaskForm } from '../../components/task-form/task-form';
import { TaskList } from '../../components/task-list/task-list';

type StatisticsState = 'loading' | 'placeholder' | 'value';

@Component({
  selector: 'app-todos-page',
  imports: [TaskForm, TaskList],
  templateUrl: './todos-page.html',
  styleUrl: './todos-page.scss',
})
export class TodosPage implements OnInit {
  private readonly todosApi = inject(TodosApiService);

  protected readonly tasks = signal<Task[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

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

  protected loadTasks(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.todosApi
      .getTodos()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          const tasks = response.todos.map((todo) => this.mapTodoToTask(todo));
          this.tasks.set(tasks);
        },
        error: () => {
          this.errorMessage.set('Couldn’t load your tasks');
        },
      });
  }

  private mapTodoToTask(todo: Todo): Task {
    return {
      clientId: `api-${todo.id}`,
      apiId: todo.id,
      title: todo.todo,
      completed: todo.completed,
      priority: 'medium',
    };
  }
}

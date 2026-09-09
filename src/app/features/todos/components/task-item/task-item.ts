import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { Todo, TodoRequest } from '../../models/todo-api.model';
import { TaskPriority } from '../../types/task-priority.type';
import { Select } from '../select/select';
import { SelectOption } from '../../models/select-option.model';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { TodosApiService } from '../../../../core/api/todos-api.service';
import { DeleteTaskDialog } from '../delete-task-dialog/delete-task-dialog';

@Component({
  selector: 'app-task-item',
  imports: [Select, ReactiveFormsModule, DeleteTaskDialog],
  templateUrl: './task-item.html',
  styleUrl: './task-item.scss',
})
export class TaskItem {
  private readonly todosApi = inject(TodosApiService);
  protected readonly taskPriority = TaskPriority;

  readonly task = input.required<Todo>();
  readonly itemUpdated = output<void>();
  readonly itemDeleted = output<void>();

  protected readonly completed = signal(false);
  protected readonly isEditingMode = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isDeleting = signal(false);
  protected readonly deleteErrorMessage = signal<string | null>(null);
  protected readonly errorMessageCompleted = signal<string | null>(null);
  protected readonly isDeleteDialogOpen = signal(false);

  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected readonly taskPriorityOptions: SelectOption<TaskPriority>[] = [
    { value: TaskPriority.Low, text: 'Low' },
    { value: TaskPriority.Medium, text: 'Medium' },
    { value: TaskPriority.High, text: 'High' },
  ];

  constructor() {
    effect(() =>
      this.editForm.setValue({ todo: this.task().todo, priority: this.task().priority }),
    );

    effect(() => {
      this.completed.set(this.task().completed);
    });
  }

  protected readonly editForm = this.formBuilder.group({
    todo: this.formBuilder.control('', {
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    priority: this.formBuilder.control<TaskPriority>(TaskPriority.Medium),
  });

  protected openDeleteDialog(): void {
    if (this.isLoading() || this.isDeleting()) return;

    this.deleteErrorMessage.set(null);
    this.isDeleteDialogOpen.set(true);
  }

  protected closeDeleteDialog(): void {
    if (this.isDeleting()) return;

    this.isDeleteDialogOpen.set(false);
  }

  protected removeTodo() {
    this.isDeleting.set(true);
    this.deleteErrorMessage.set(null);

    this.todosApi
      .removeTodo(this.task().id)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => {
          this.isDeleteDialogOpen.set(false);
          this.itemDeleted.emit();
        },
        error: () => {
          this.deleteErrorMessage.set('Couldn`t delete the task. Please try again.');
        },
      });
  }

  protected updateCompleted(checkbox: HTMLInputElement) {
    if (this.isLoading()) {
      checkbox.checked = this.completed();
      return;
    }

    const todoRequest: TodoRequest = {
      createdAt: this.task().createdAt,
      todo: this.task().todo,
      priority: this.task().priority,
      completed: checkbox.checked,
    };

    const previousCompleted = this.completed();

    this.completed.set(checkbox.checked);
    this.isLoading.set(true);
    this.errorMessageCompleted.set(null);

    this.todosApi
      .updateTodo(this.task().id, todoRequest)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.itemUpdated.emit();
        },
        error: () => {
          this.completed.set(previousCompleted);
          checkbox.checked = previousCompleted;
          this.errorMessageCompleted.set('Couldn’t update task status. Please try again.');
        },
      });
  }

  protected updateTodo(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const formValue = this.editForm.getRawValue();

    const todoRequest: TodoRequest = {
      createdAt: this.task().createdAt,
      todo: formValue.todo,
      priority: formValue.priority,
      completed: this.completed(),
    };

    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.todosApi
      .updateTodo(this.task().id, todoRequest)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.isEditingMode.set(false);
          this.itemUpdated.emit();
        },
        error: () => {
          this.errorMessage.set('Couldn’t edit the task.');
        },
      });
  }

  protected onCancel(): void {
    this.isEditingMode.set(false);
    this.editForm.reset({
      todo: this.task().todo,
      priority: this.task().priority,
    });
  }

  protected startEditing(): void {
    if (this.isLoading()) return;

    this.errorMessage.set(null);
    this.errorMessageCompleted.set(null);
    this.isEditingMode.set(true);
  }

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

  get todoErrorMessage(): string | null {
    const todo = this.editForm.controls.todo;

    if (!todo.touched) {
      return null;
    }

    if (todo.hasError('required')) {
      return 'Task title is required.';
    }

    if (todo.hasError('pattern')) {
      return 'Enter a valid task title.';
    }

    return null;
  }
}

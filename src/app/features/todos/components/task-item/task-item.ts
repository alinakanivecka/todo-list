import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Todo, TodoRequest } from '../../models/todo-api.model';
import { TaskPriority } from '../../types/task-priority.enum';
import { Select } from '../select/select';
import { SelectOption } from '../../models/select-option.model';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { TodosApiService } from '../../../../core/api/todos-api.service';
import { DeleteTaskDialog, DeleteTaskDialogData } from '../delete-task-dialog/delete-task-dialog';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-task-item',
  imports: [Select, ReactiveFormsModule, MatDialogModule],
  templateUrl: './task-item.html',
  styleUrl: './task-item.scss',
})
export class TaskItem {
  private readonly todosApi = inject(TodosApiService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly taskPriority = TaskPriority;

  readonly task = input.required<Todo>();
  readonly itemUpdated = output<void>();
  readonly itemDeleted = output<void>();

  protected readonly completed = signal(false);
  protected readonly isEditingMode = signal(false);
  protected readonly isUpdating = signal(false);
  protected readonly updateErrorMessage = signal<string | null>(null);
  protected readonly checkboxUpdateErrorMessage = signal<string | null>(null);

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

  protected updateCompleted(checkbox: HTMLInputElement) {
    if (this.isUpdating()) {
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
    this.isUpdating.set(true);
    this.checkboxUpdateErrorMessage.set(null);

    this.todosApi
      .updateTodo(this.task().id, todoRequest)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isUpdating.set(false)),
      )
      .subscribe({
        next: () => {
          this.itemUpdated.emit();
        },
        error: () => {
          this.completed.set(previousCompleted);
          checkbox.checked = previousCompleted;
          this.checkboxUpdateErrorMessage.set('Couldn’t update task status. Please try again.');
        },
      });
  }

  protected startEditing(): void {
    if (this.isUpdating()) return;

    this.updateErrorMessage.set(null);
    this.checkboxUpdateErrorMessage.set(null);
    this.isEditingMode.set(true);
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

    if (this.isUpdating()) {
      return;
    }

    this.isUpdating.set(true);
    this.updateErrorMessage.set(null);

    this.todosApi
      .updateTodo(this.task().id, todoRequest)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isUpdating.set(false)),
      )
      .subscribe({
        next: () => {
          this.isEditingMode.set(false);
          this.itemUpdated.emit();
        },
        error: () => {
          this.updateErrorMessage.set('Couldn’t edit the task.');
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

  protected openDeleteDialog(): void {
    if (this.isUpdating()) return;

    const task = this.task();
    const dialogRef = this.dialog.open<DeleteTaskDialog, DeleteTaskDialogData, boolean>(
      DeleteTaskDialog,
      {
        width: '440px',
        maxWidth: 'calc(100vw - 32px)',
        panelClass: 'delete-task-dialog-panel',
        data: { taskId: task.id, taskTitle: task.todo },
        autoFocus: '.delete-dialog__button--cancel',
        restoreFocus: true,
        ariaLabelledBy: 'delete-task-title',
        ariaDescribedBy: 'delete-task-description',
      },
    );

    dialogRef.afterClosed().subscribe((deleted) => {
      if (deleted) this.itemDeleted.emit();
    });
  }

  protected formatCreatedAt(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Date unavailable';
    }

    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
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

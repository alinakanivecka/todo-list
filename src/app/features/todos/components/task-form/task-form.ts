import { Component, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskPriority } from '../../types/task-priority.type';
import { CreateTaskFormValue } from '../../types/task-from-value.type';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
})
export class TaskForm {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  readonly taskCreated = output<CreateTaskFormValue>();
  readonly isCreating = input(false);
  readonly createErrorMessage = input<string | null>(null);
  protected readonly taskPriority = TaskPriority;

  protected readonly todoForm = this.formBuilder.group({
    todo: this.formBuilder.control('', {
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    priority: this.formBuilder.control<TaskPriority>(TaskPriority.Medium),
  });

  protected submitForm(): void {
    if (this.todoForm.invalid) {
      this.todoForm.markAllAsTouched();
      return;
    }

    const formValue = this.todoForm.getRawValue();

    this.taskCreated.emit({
      todo: formValue.todo.trim(),
      priority: formValue.priority,
    });
  }

  public resetForm(): void {
    this.todoForm.reset({
      todo: '',
      priority: TaskPriority.Medium,
    });
  }

  get todoErrorMessage(): string | null {
    const todo = this.todoForm.controls.todo;

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

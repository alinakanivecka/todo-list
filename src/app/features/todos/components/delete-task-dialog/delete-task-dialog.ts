import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { TodosApiService } from '../../../../core/api/todos-api.service';

export interface DeleteTaskDialogData {
  taskId: number;
  taskTitle: string;
}

@Component({
  selector: 'app-delete-task-dialog',
  imports: [MatDialogModule],
  templateUrl: './delete-task-dialog.html',
  styleUrl: './delete-task-dialog.scss',
})
export class DeleteTaskDialog {
  protected readonly data = inject<DeleteTaskDialogData>(MAT_DIALOG_DATA);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  private readonly dialogRef = inject(MatDialogRef<DeleteTaskDialog, boolean>);
  private readonly todosApi = inject(TodosApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected cancel(): void {
    if (!this.isLoading()) this.dialogRef.close(false);
  }

  protected confirm(): void {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.dialogRef.disableClose = true;

    this.todosApi
      .removeTodo(this.data.taskId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isLoading.set(false);
          this.dialogRef.disableClose = false;
        }),
      )
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: () => this.errorMessage.set('Couldn’t delete the task. Please try again.'),
      });
  }
}

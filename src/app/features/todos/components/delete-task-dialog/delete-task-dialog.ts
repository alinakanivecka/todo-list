import { afterNextRender, Component, ElementRef, input, output, viewChild } from '@angular/core';

@Component({
  selector: 'app-delete-task-dialog',
  templateUrl: './delete-task-dialog.html',
  styleUrl: './delete-task-dialog.scss',
})
export class DeleteTaskDialog {
  readonly taskTitle = input('');
  readonly isLoading = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  protected cancel(event?: Event): void {
    event?.preventDefault();
    if (!this.isLoading()) {
      this.cancelled.emit();
    }
  }

  protected confirm(): void {
    if (!this.isLoading()) {
      this.confirmed.emit();
    }
  }
}

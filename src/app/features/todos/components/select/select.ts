import { Component, forwardRef, input, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SelectOption } from '../../models/select-option.model';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-select',
  imports: [MatFormFieldModule, MatSelectModule],
  templateUrl: './select.html',
  styleUrl: './select.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Select),
      multi: true,
    },
  ],
})
export class Select<TOptionValue> implements ControlValueAccessor {
  readonly options = input.required<SelectOption<TOptionValue>[]>();
  readonly placeholder = input.required<string>();
  readonly ariaLabel = input<string>('');

  protected readonly value = signal<TOptionValue | null>(null);
  protected readonly disabled = signal(false);

  private onChange: (value: TOptionValue | null) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: TOptionValue | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: TOptionValue | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected selectValue(value: TOptionValue | null): void {
    this.value.set(value);
    this.onChange(value);
  }
}

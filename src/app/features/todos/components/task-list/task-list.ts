import { Component, input } from '@angular/core';
import { TaskItem } from "../task-item/task-item";
import { Todo } from '../../models/todo-api.model';

@Component({
  selector: 'app-task-list',
  imports: [TaskItem],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskList {
  readonly tasks = input<Todo[]>([])
}

import { Component } from '@angular/core';
import { TodosPage } from './features/todos/pages/todos-page/todos-page';

@Component({
  selector: 'app-root',
  imports: [TodosPage],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { Todo, TodoRequest } from '../../features/todos/models/todo-api.model';
import { environment } from '../../../environments/environment';
import { TodoFilters } from '../../features/todos/models/todo-filters.model';
import { TodoSort } from '../../features/todos/models/todo-sort.model';
@Injectable({
  providedIn: 'root',
})
export class TodosApiService {
  private readonly http = inject(HttpClient);

  getTodos(filter: TodoFilters, sort: TodoSort): Observable<Todo[]> {
    let params = new HttpParams()
      .set('sortBy', sort.field)
      .set('order', sort.order);

    if (filter.completed !== undefined) {
      params = params.set('completed', filter.completed);
    }

    return this.http.get<Todo[]>(`${environment.apiUrl}/todos`, { params });
  }

  addTodo(todoRequest: TodoRequest): Observable<Todo> {
    return this.http.post<Todo>(`${environment.apiUrl}/todos`, todoRequest);
  }
}

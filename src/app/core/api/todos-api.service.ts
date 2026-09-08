import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { Todo, TodoRequest } from '../../features/todos/models/todo-api.model';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class TodosApiService {
  private readonly http = inject(HttpClient);

  getTodos(): Observable<Todo[]> {
    const params = new HttpParams().set('limit', 10).set('sortBy', 'createdAt');
    return this.http.get<Todo[]>(`${environment.apiUrl}/todos`, { params });
  }

  addTodo(todoRequest: TodoRequest): Observable<Todo> {
    return this.http.post<Todo>(`${environment.apiUrl}/todos`, todoRequest);
  }
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TodosResponse } from '../../features/todos/models/todo-api.model';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class TodosApiService {
  private readonly http = inject(HttpClient);

  getTodos(): Observable<TodosResponse> {
    const params = new HttpParams().set('limit', 10);
    return this.http.get<TodosResponse>(`${environment.apiUrl}/todos`, { params });
  }
}

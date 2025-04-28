import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AIService {
  private apiUrl = `${environment.apiUrl}/ai/generate`;

  constructor(private http: HttpClient) {}

  generateList(prompt: string): Observable<string[]> {
    return this.http.post<{items: string[]}>(
      this.apiUrl,
      { prompt },
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        withCredentials: true  // Изменили на true
      }
    ).pipe(
      timeout(20000),
      map(response => response?.items || []),
      catchError(error => {
        console.error('Full error:', error);
        if (error.status === 0) {
          throw new Error('Проверьте: 1) Запущен ли сервер 2) CORS настройки');
        }
        throw new Error(error.error?.error || 'Ошибка сервера');
      })
    );
  }
}
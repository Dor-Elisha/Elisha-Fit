import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LogService {
  private apiUrl = 'http://localhost:8080/api/v1/logs';

  constructor(private http: HttpClient) {}

  addLog(log: any): Observable<any> {
    return this.http.post(this.apiUrl, log);
  }

  getLogs(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getLogsForRange(start: string, end: string): Observable<any> {
    return this.http.get(this.apiUrl + '/range', { params: { start, end } });
  }
} 
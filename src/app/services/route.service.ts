import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/';

  constructor(private http: HttpClient) {}

  register =(email: string, password: string) => {
    return this.http.post(`${this.baseUrl}auth/register`, { email, password });
  }

  login =(email: string, password: string) => {
    return this.http.post(`${this.baseUrl}auth/login`, { email, password });
  }

  updateUserName(userId, newName) {
    return this.http.put(`${this.baseUrl}users/${userId}/name`, { name: newName });
  }

  saveProgram(program) {
    return this.http.post(`${this.baseUrl}/programs`, program);
  }

  getPrograms() {
    return this.http.get(`${this.baseUrl}/programs`);
  }

  editProgram(programId, program){
    return this.http.put(`${this.baseUrl}/programs/${programId}`, program);
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  private userInfoSubject = new BehaviorSubject<any>(null);
  userInfo$ = this.userInfoSubject.asObservable();

  savedPrograms: any = [];
  createWorkoutPopupShow = false;

  // Production environment detection
  isProduction = environment.production;

  constructor() {}

  saveProgram (program: any) {
    this.savedPrograms.push(program);
    this.createWorkoutPopupShow = false;
  }

  loadUserInfo(routeService: any): Promise<any> {
    return new Promise((resolve, reject) => {
      routeService.getInitialUserData().subscribe({
        next: (data: any) => {
          this.userInfoSubject.next(data);
          resolve(data);
        },
        error: (err: any) => {
          reject(err);
        }
      });
    });
  }

  setUserInfo(user: any) {
    this.userInfoSubject.next(user);
  }
}

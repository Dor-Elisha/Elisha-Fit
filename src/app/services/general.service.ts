import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  public progrem: any[] = [];

  constructor() {}

  addExerciseToProgram(item: any): void {
    this.progrem.push(item);
  }
}

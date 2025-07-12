import { Injectable } from '@angular/core';

export interface SavedProgram {
  name: string;
  exercises: any[];
}

@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  public savedPrograms: SavedProgram[] = [];

  constructor() {}

  saveProgram(program: SavedProgram): void {
    this.savedPrograms.push(program);
  }
}

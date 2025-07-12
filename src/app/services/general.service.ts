import { Injectable } from '@angular/core';

export interface SavedProgram {
  name: string;
  exercises: any[];
}

@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  savedPrograms: any = [];
  createProgramPopupShow = false;

  constructor() {}

  saveProgram (program: SavedProgram) {
    this.savedPrograms.push(program);
    this.createProgramPopupShow = false;
  }
}

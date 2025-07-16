import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  savedPrograms: any = [];
  createProgramPopupShow = false;

  constructor() {}

  saveProgram (program: any) {
    this.savedPrograms.push(program);
    this.createProgramPopupShow = false;
  }
}

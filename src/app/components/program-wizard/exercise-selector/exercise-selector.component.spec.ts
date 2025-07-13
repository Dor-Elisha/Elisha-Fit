import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ExerciseSelectorComponent } from './exercise-selector.component';
import { ExerciseService } from '../../../services/exercise.service';

describe('ExerciseSelectorComponent', () => {
  let component: ExerciseSelectorComponent;
  let fixture: ComponentFixture<ExerciseSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExerciseSelectorComponent ],
      imports: [ ReactiveFormsModule, FormsModule, HttpClientTestingModule ],
      providers: [ ExerciseService ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExerciseSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

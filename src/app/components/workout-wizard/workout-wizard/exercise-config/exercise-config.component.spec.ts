import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { ExerciseConfigComponent } from './exercise-config.component';

describe('ExerciseConfigComponent', () => {
  let component: ExerciseConfigComponent;
  let fixture: ComponentFixture<ExerciseConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExerciseConfigComponent ],
      imports: [ ReactiveFormsModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExerciseConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

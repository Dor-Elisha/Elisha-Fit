import { Component } from '@angular/core';

interface Exercise {
  name: string;
  muscle_group: string;
  reps: string;
  times: number;
  rest_between: string;
}

@Component({
  selector: 'app-select-program',
  templateUrl: './select-program.component.html',
  styleUrls: ['./select-program.component.scss']
})
export class SelectProgramComponent {
  showMuscles = false;
  selectedMuscle?: string;

  muscleGroups = [
    'Chest',
    'Shoulders',
    'Triceps',
    'Back',
    'Biceps',
    'Quads',
    'Hamstrings',
    'Calves',
    'Abs',
    'Glutes',
    'Cardio'
  ];

  exercises: Exercise[] = [
    { "name": "Barbell Bench Press",                 "muscle_group": "Chest",        "reps": "5-8",   "times": 4, "rest_between": "120s" },
    { "name": "Incline Dumbbell Press",              "muscle_group": "Chest",        "reps": "8-10",  "times": 3, "rest_between": "90s"  },
    { "name": "Seated Dumbbell Shoulder Press",      "muscle_group": "Shoulders",    "reps": "8-10",  "times": 3, "rest_between": "90s"  },
    { "name": "Cable Triceps Push-down",             "muscle_group": "Triceps",      "reps": "10-12", "times": 3, "rest_between": "60s"  },
    { "name": "Deadlift",                            "muscle_group": "Back",         "reps": "5-6",   "times": 4, "rest_between": "180s" },
    { "name": "Bent-Over Barbell Row",               "muscle_group": "Back",         "reps": "6-8",   "times": 4, "rest_between": "120s" },
    { "name": "Wide- Grip Lat Pulldown",             "muscle_group": "Back",         "reps": "8-10",  "times": 3, "rest_between": "90s"  },
    { "name": "Alternating Dumbbell Curl",           "muscle_group": "Biceps",       "reps": "10-12", "times": 3, "rest_between": "60s"  },
    { "name": "Back Squat",                          "muscle_group": "Quads",        "reps": "5-8",   "times": 4, "rest_between": "180s" },
    { "name": "Romanian Deadlift",                   "muscle_group": "Hamstrings",   "reps": "8-10",  "times": 3, "rest_between": "120s" },
    { "name": "Leg Press",                           "muscle_group": "Quads",        "reps": "10-12", "times": 3, "rest_between": "120s" },
    { "name": "Standing Calf Raise",                 "muscle_group": "Calves",       "reps": "12-15", "times": 4, "rest_between": "60s"  },
    { "name": "Incline Barbell Bench Press",         "muscle_group": "Chest",        "reps": "6-8",   "times": 4, "rest_between": "120s" },
    { "name": "Dumbbell Shoulder Press",             "muscle_group": "Shoulders",    "reps": "8-10",  "times": 3, "rest_between": "90s"  },
    { "name": "Weighted Dip",                        "muscle_group": "Chest",        "reps": "8-12",  "times": 3, "rest_between": "90s"  },
    { "name": "Skullcrusher",                        "muscle_group": "Triceps",      "reps": "10-12", "times": 3, "rest_between": "60s"  },
    { "name": "Pendlay Row",                         "muscle_group": "Back",         "reps": "6-8",   "times": 4, "rest_between": "120s" },
    { "name": "Seated Cable Row",                    "muscle_group": "Back",         "reps": "8-10",  "times": 3, "rest_between": "90s"  },
    { "name": "Face Pull",                           "muscle_group": "Rear Delts",   "reps": "12-15", "times": 3, "rest_between": "60s"  },
    { "name": "Hammer Curl",                         "muscle_group": "Biceps",       "reps": "10-12", "times": 3, "rest_between": "60s"  },
    { "name": "Flat Bench Press",                    "muscle_group": "Chest",        "reps": "8-12",  "times": 4, "rest_between": "90s"  },
    { "name": "Cable Cross-over",                    "muscle_group": "Chest",        "reps": "12-15", "times": 7, "rest_between": "45s"  },
    { "name": "Barbell Curl",                        "muscle_group": "Biceps",       "reps": "10-12", "times": 3, "rest_between": "60s"  },
    { "name": "Preacher Curl",                       "muscle_group": "Biceps",       "reps": "12-15", "times": 7, "rest_between": "45s"  },
    { "name": "Close-Grip Bench Press",              "muscle_group": "Triceps",      "reps": "8-12",  "times": 4, "rest_between": "90s"  },
    { "name": "Overhead Rope Extension",             "muscle_group": "Triceps",      "reps": "10-12", "times": 3, "rest_between": "60s"  },
    { "name": "Rope Push-down",                      "muscle_group": "Triceps",      "reps": "12-15", "times": 7, "rest_between": "45s"  },
    { "name": "Cable Lateral Raise",                 "muscle_group": "Side Delts",   "reps": "12-15", "times": 7, "rest_between": "45s"  },
    { "name": "Incline Smith-Machine Bench Press",   "muscle_group": "Chest",        "reps": "8-12",  "times": 4, "rest_between": "90s"  },
    { "name": "Hammer-Strength Chest Press",         "muscle_group": "Chest",        "reps": "10-12", "times": 3, "rest_between": "90s"  },
    { "name": "Pec Deck Fly",                        "muscle_group": "Chest",        "reps": "12-15", "times": 7, "rest_between": "45s"  },
    { "name": "EZ-Bar Curl",                         "muscle_group": "Biceps",       "reps": "10-12", "times": 3, "rest_between": "60s"  },
    { "name": "Incline Dumbbell Curl",               "muscle_group": "Biceps",       "reps": "10-12", "times": 3, "rest_between": "60s"  },
    { "name": "Rope Overhead Extension",             "muscle_group": "Triceps",      "reps": "12-15", "times": 7, "rest_between": "45s"  },
    { "name": "Seated Calf Raise",                   "muscle_group": "Calves",       "reps": "12-15", "times": 4, "rest_between": "60s"  },
    { "name": "Hanging Leg Raise",                   "muscle_group": "Abs",          "reps": "15-20", "times": 4, "rest_between": "45s"  },
    { "name": "Cable Crunch",                        "muscle_group": "Abs",          "reps": "12-15", "times": 7, "rest_between": "30s"  },
    { "name": "Hip Thrust",                          "muscle_group": "Glutes",       "reps": "8-12",  "times": 4, "rest_between": "120s" },
    { "name": "Walking Lunge",                       "muscle_group": "Quads",        "reps": "12-15", "times": 3, "rest_between": "90s"  },
    { "name": "Lying Leg Curl",                      "muscle_group": "Hamstrings",   "reps": "10-12", "times": 3, "rest_between": "90s"  },
    { "name": "Donkey Calf Raise",                   "muscle_group": "Calves",       "reps": "12-15", "times": 7, "rest_between": "45s"  },
    { "name": "Straight-Arm Pulldown",               "muscle_group": "Back",         "reps": "12-15", "times": 7, "rest_between": "45s"  },
    { "name": "Leg Extension",                       "muscle_group": "Quads",        "reps": "12-15", "times": 7, "rest_between": "45s"  },
    { "name": "Hammer-Strength Row",                 "muscle_group": "Back",         "reps": "10-12", "times": 4, "rest_between": "120s" },
    { "name": "Smith-Machine Incline Press",         "muscle_group": "Chest",        "reps": "10-12", "times": 4, "rest_between": "90s"  },
    { "name": "Cable Fly",                           "muscle_group": "Chest",        "reps": "12-15", "times": 7, "rest_between": "45s"  },
    { "name": "Weighted Pull-up",                    "muscle_group": "Back",         "reps": "6-8",   "times": 4, "rest_between": "120s" },
    { "name": "Single-Arm Dumbbell Row",             "muscle_group": "Back",         "reps": "8-10",  "times": 3, "rest_between": "90s"  },
    { "name": "Cable Woodchop",                      "muscle_group": "Abs",          "reps": "12-15", "times": 3, "rest_between": "45s"  },
    { "name": "Plank",                               "muscle_group": "Abs",          "reps": "60-90s","times": 3, "rest_between": "60s"  },
    { "name": "Standing Overhead Press",             "muscle_group": "Shoulders",    "reps": "6-8",   "times": 4, "rest_between": "120s" },
    { "name": "Front Squat",                         "muscle_group": "Quads",        "reps": "10-12", "times": 4, "rest_between": "120s" },
    { "name": "Reverse Pec-Deck Fly",                "muscle_group": "Rear Delts",   "reps": "12-15", "times": 3, "rest_between": "60s"  },
    { "name": "Barbell Shrug",                       "muscle_group": "Traps",        "reps": "10-12", "times": 4, "rest_between": "90s"  },
    { "name": "Seated Leg Curl",                     "muscle_group": "Hamstrings",   "reps": "10-12", "times": 3, "rest_between": "90s"  },
    { "name": "Lying Leg Curl (FST-7)",              "muscle_group": "Hamstrings",   "reps": "12-15", "times": 7, "rest_between": "45s"  }
  ];

  get filteredExercises(): Exercise[] {
    if (!this.selectedMuscle) {
      return [];
    }
    return this.exercises.filter(e => e.muscle_group === this.selectedMuscle);
  }
}

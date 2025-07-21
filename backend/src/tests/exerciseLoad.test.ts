import mongoose from 'mongoose';
const fs = require('fs');
const path = require('path');
import { Exercise } from '../models/Exercise';
import { ExerciseService } from '../services/exerciseService';
import { app } from './testApp';

jest.setTimeout(30000);

describe('Exercise DB Population', () => {
  let exercisesJsonCount = 0;

  beforeAll(async () => {
    const testDbUri = process.env['MONGODB_URI_TEST'] || 'mongodb://localhost:27017/elisha-fit-test';
    await mongoose.connect(testDbUri);
    // Read exercises.json and count exercises
    const exercisesPath = path.resolve(__dirname, '../../../src/assets/data/exercises.json');
    const fileContent = fs.readFileSync(exercisesPath, 'utf8');
    const data = JSON.parse(fileContent);
    exercisesJsonCount = data.exercises.length;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Exercise.deleteMany({});
  });

  it('should load all exercises from JSON into the database', async () => {
    await ExerciseService.loadExercisesFromFile();
    const dbCount = await Exercise.countDocuments();
    expect(dbCount).toBe(exercisesJsonCount);
  });
}); 
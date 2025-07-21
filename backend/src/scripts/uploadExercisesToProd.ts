import mongoose from 'mongoose';
const fs = require('fs');
const path = require('path');
import { Exercise } from '../models/Exercise';
import { config } from '../config/config';

const logFile = path.resolve(__dirname, '../../../exercise-upload-prod.log');
function log(message: string) {
  const timestamp = new Date().toISOString();
  const fullMsg = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, fullMsg);
  console.log(fullMsg.trim());
}

async function uploadExercises() {
  try {
    const mongoUri = process.env.MONGODB_URI || config.mongoUri;
    log(`Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    log('Connected to MongoDB');

    // Read exercises.json
    const exercisesPath = path.resolve(__dirname, '../../../src/assets/data/exercises.json');
    log(`Reading exercises from: ${exercisesPath}`);
    const fileContent = fs.readFileSync(exercisesPath, 'utf8');
    const data = JSON.parse(fileContent);
    log(`Found ${data.exercises.length} exercises in JSON`);

    // Clear and insert
    log('Clearing existing exercises...');
    await Exercise.deleteMany({});
    log('Existing exercises cleared.');
    log('Inserting new exercises...');
    await Exercise.insertMany(data.exercises.map((exercise: any, index: number) => ({
      id: `exercise_${index + 1}`,
      name: exercise.name,
      category: exercise.category,
      muscle: exercise.primaryMuscles[0] || 'general',
      equipment: exercise.equipment || 'body only',
      instructions: exercise.instructions,
      images: exercise.images
    })));
    log(`Inserted ${data.exercises.length} exercises into the database.`);
    log('✅ Upload complete!');
    await mongoose.disconnect();
    log('Disconnected from MongoDB');
  } catch (err: any) {
    log('❌ Error: ' + err.stack || err.message || err);
    process.exit(1);
  }
}

uploadExercises(); 
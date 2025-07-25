"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const fs = require('fs');
const path = require('path');
const Exercise_1 = require("../models/Exercise");
const config_1 = require("../config/config");
const logFile = path.resolve(__dirname, '../../../exercise-upload-prod.log');
function log(message) {
    const timestamp = new Date().toISOString();
    const fullMsg = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(logFile, fullMsg);
    console.log(fullMsg.trim());
}
async function uploadExercises() {
    try {
        log('--- SCRIPT START ---');
        log(`process.cwd(): ${process.cwd()}`);
        log(`__dirname: ${__dirname}`);
        log(`process.env.MONGODB_URI: ${process.env.MONGODB_URI}`);
        log(`config.mongoUri: ${config_1.config.mongoUri}`);
        const mongoUri = process.env.MONGODB_URI || config_1.config.mongoUri;
        log(`Connecting to MongoDB: ${mongoUri}`);
        await mongoose_1.default.connect(mongoUri);
        log('Connected to MongoDB');
        const exercisesPath = path.resolve(__dirname, '../../../src/assets/data/exercises.json');
        log(`Resolved exercisesPath: ${exercisesPath}`);
        log(`Checking if exercises.json exists...`);
        if (!fs.existsSync(exercisesPath)) {
            log('❌ exercises.json file does NOT exist at resolved path!');
            throw new Error('exercises.json file not found at: ' + exercisesPath);
        }
        log('exercises.json file exists. Reading file...');
        const fileContent = fs.readFileSync(exercisesPath, 'utf8');
        log('File read successfully. Parsing JSON...');
        const data = JSON.parse(fileContent);
        log(`Found ${data.exercises.length} exercises in JSON`);
        log('Clearing existing exercises...');
        await Exercise_1.Exercise.deleteMany({});
        log('Existing exercises cleared.');
        log('Inserting new exercises...');
        await Exercise_1.Exercise.insertMany(data.exercises.map((exercise, index) => ({
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
        await mongoose_1.default.disconnect();
        log('Disconnected from MongoDB');
        log('--- SCRIPT END ---');
    }
    catch (err) {
        log('❌ Error (message): ' + (err.message || err));
        log('❌ Error (stack): ' + (err.stack || 'no stack'));
        process.exit(1);
    }
}
uploadExercises();
//# sourceMappingURL=uploadExercisesToProd.js.map
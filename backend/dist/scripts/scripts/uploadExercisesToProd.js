"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var fs_1 = require("fs");
var path_1 = require("path");
var Exercise_1 = require("../models/Exercise");
var config_1 = require("../config/config");
var logFile = path_1.default.resolve(__dirname, '../../../exercise-upload-prod.log');
function log(message) {
    var timestamp = new Date().toISOString();
    var fullMsg = "[".concat(timestamp, "] ").concat(message, "\n");
    fs_1.default.appendFileSync(logFile, fullMsg);
    console.log(fullMsg.trim());
}
function uploadExercises() {
    return __awaiter(this, void 0, void 0, function () {
        var mongoUri, exercisesPath, fileContent, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    mongoUri = process.env.MONGODB_URI || config_1.config.mongoUri;
                    log("Connecting to MongoDB: ".concat(mongoUri));
                    return [4 /*yield*/, mongoose_1.default.connect(mongoUri)];
                case 1:
                    _a.sent();
                    log('Connected to MongoDB');
                    exercisesPath = path_1.default.resolve(__dirname, '../../../src/assets/data/exercises.json');
                    log("Reading exercises from: ".concat(exercisesPath));
                    fileContent = fs_1.default.readFileSync(exercisesPath, 'utf8');
                    data = JSON.parse(fileContent);
                    log("Found ".concat(data.exercises.length, " exercises in JSON"));
                    // Clear and insert
                    log('Clearing existing exercises...');
                    return [4 /*yield*/, Exercise_1.Exercise.deleteMany({})];
                case 2:
                    _a.sent();
                    log('Existing exercises cleared.');
                    log('Inserting new exercises...');
                    return [4 /*yield*/, Exercise_1.Exercise.insertMany(data.exercises.map(function (exercise, index) { return ({
                            id: "exercise_".concat(index + 1),
                            name: exercise.name,
                            category: exercise.category,
                            muscle: exercise.primaryMuscles[0] || 'general',
                            equipment: exercise.equipment || 'body only',
                            instructions: exercise.instructions,
                            images: exercise.images
                        }); }))];
                case 3:
                    _a.sent();
                    log("Inserted ".concat(data.exercises.length, " exercises into the database."));
                    log('✅ Upload complete!');
                    return [4 /*yield*/, mongoose_1.default.disconnect()];
                case 4:
                    _a.sent();
                    log('Disconnected from MongoDB');
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _a.sent();
                    log('❌ Error: ' + err_1.stack || err_1.message || err_1);
                    process.exit(1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
uploadExercises();

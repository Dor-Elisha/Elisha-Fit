# Elisha-Fit Application Design Document

## Overview

Elisha-Fit is a comprehensive fitness application built with Angular (frontend) and Node.js/Express (backend), designed to help users manage workout programs, track exercises, and monitor their fitness progress.

## Data Models

### User Model
```typescript
interface User {
  _id: string;
  email: string;
  name: string;
  password: string; // Hashed
  createdAt: Date;
  updatedAt: Date;
  logs: Log[];
  // Embedded logs for performance
}
```

### Program Model
```typescript
interface Program {
  _id: string;
  name: string;
  description?: string;
  targetMuscleGroups: string[];
  tags: string[];
  exercises: ProgramExercise[];
  userId: string; // Reference to User
  createdAt: Date;
  updatedAt: Date;
}

interface ProgramExercise {
  exerciseId: string; // Reference to Exercise
  name: string;
  sets: number;
  reps: number;
  rest: number; // seconds
  weight?: number;
  notes?: string;
  order: number;
}
```

### Exercise Model
```typescript
interface Exercise {
  _id: string;
  name: string;
  description?: string;
  category: string;
  muscleGroups: string[];
  equipment?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string[];
  images: string[]; // URLs to exercise images
  videos?: string[]; // URLs to exercise videos
  tips?: string[];
  variations?: string[]; // Related exercise IDs
  createdAt: Date;
  updatedAt: Date;
}
```

### Log Model
```typescript
interface Log {
  _id: string;
  date: Date;
  programName: string;
  programId: string; // Reference to Program
  completedAll: boolean;
  summary: string;
  exercises: LogExercise[];
  notes?: string;
  duration?: number; // minutes
  calories?: number;
  userId: string; // Reference to User
  createdAt: Date;
  updatedAt: Date;
}

interface LogExercise {
  exerciseId: string;
  name: string;
  sets: LogSet[];
  notes?: string;
}

interface LogSet {
  setNumber: number;
  reps: number;
  weight?: number;
  completed: boolean;
  restTime?: number; // seconds
}
```

### Scheduled Workout Model
```typescript
interface ScheduledWorkout {
  _id: string;
  date: Date;
  programId: string; // Reference to Program
  userId: string; // Reference to User
  status: 'scheduled' | 'completed' | 'skipped';
  notes?: string;
  reminderTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Data Relationships

### One-to-Many Relationships
- **User → Programs**: One user can have multiple programs
- **User → Logs**: One user can have multiple workout logs
- **User → Scheduled Workouts**: One user can have multiple scheduled workouts
- **Program → Program Exercises**: One program contains multiple exercises

### Many-to-One Relationships
- **Program → User**: Many programs belong to one user
- **Log → User**: Many logs belong to one user
- **Log → Program**: Many logs can reference one program
- **Scheduled Workout → User**: Many scheduled workouts belong to one user
- **Scheduled Workout → Program**: Many scheduled workouts can reference one program

### Reference Data
- **Exercise**: Static reference data loaded from `exercises.json`
- **Program Exercise → Exercise**: References exercise data for details

## Data Flow Patterns

### Initial Data Loading
```typescript
// Single API call returns all user data
GET /api/v1/user/initial-data
Response: {
  user: User,
  programs: Program[],
  scheduledWorkouts: ScheduledWorkout[]
}
```

### Exercise Data Loading
```typescript
// Loaded separately when needed (program wizard)
GET /api/exercises
Response: Exercise[]
```

### CRUD Operations
```typescript
// Create Program
POST /api/programs
Body: Program (without _id)
Response: Program (with _id)

// Update Program
PUT /api/programs/:id
Body: Partial<Program>
Response: Updated Program

// Delete Program
DELETE /api/programs/:id
Response: { success: boolean }

// Duplicate Program
POST /api/programs/duplicate/:id
Body: { customName?: string }
Response: New Program
```

## Data Validation Rules

### Program Validation
- **name**: Required, 3-100 characters
- **description**: Optional, max 500 characters
- **targetMuscleGroups**: Required, non-empty array
- **exercises**: Required, non-empty array
- **exercises[].sets**: Required, 1-50
- **exercises[].reps**: Required, 1-1000
- **exercises[].rest**: Required, 0-600 seconds

### User Validation
- **email**: Required, valid email format, unique
- **name**: Required, 2-50 characters
- **password**: Required, min 8 characters, hashed

### Log Validation
- **date**: Required, valid date
- **programName**: Required, non-empty string
- **completedAll**: Required, boolean
- **summary**: Required, non-empty string

## Data Transformation

### Frontend Adapter Pattern
```typescript
// Converts backend data to frontend format
interface AdapterService {
  toLegacyProgram(program: Program): LegacyProgram;
  toLegacyProgramArray(programs: Program[]): LegacyProgram[];
  getProgramId(program: Program | LegacyProgram): string;
}
```

### Legacy Program Format
```typescript
// Frontend-compatible program format
interface LegacyProgram {
  id: string; // Maps to _id
  name: string;
  description?: string;
  targetMuscleGroups: string[];
  exercises: LegacyExercise[];
  estimatedDuration?: number;
  difficulty?: string;
}

interface LegacyExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  rest: number;
  weight?: number;
  notes?: string;
  images?: string[];
  setsCompleted?: boolean[]; // For workout tracking
}
```

## Data Storage Strategy

### Backend Storage
- **MongoDB**: Primary database for user data
- **JSON Files**: Static exercise data (`exercises.json`)
- **File System**: Exercise images and videos

### Frontend Storage
- **Memory**: Active user data in BehaviorSubject
- **Local Storage**: User preferences and cached data
- **Session Storage**: Temporary session data

### Caching Strategy
- **Exercise Data**: Cached in frontend after first load
- **User Data**: Cached in BehaviorSubject, updated on changes
- **Images**: Browser-cached exercise images

## Data Security

### Sensitive Data
- **Passwords**: Hashed using bcrypt
- **JWT Tokens**: Stored in memory, not localStorage
- **User Data**: Protected by authentication middleware

### Data Access Control
- **User Isolation**: Users can only access their own data
- **Program Ownership**: Programs belong to creating user
- **Log Privacy**: Logs are user-specific

## Performance Considerations

### Data Loading
- **Single API Call**: Reduces network overhead
- **Lazy Loading**: Exercise data loaded on demand
- **Pagination**: Large datasets paginated (future)

### Data Updates
- **Optimistic Updates**: UI updates immediately, syncs with backend
- **Batch Operations**: Multiple updates batched where possible
- **Delta Updates**: Only changed data sent to backend

### Memory Management
- **Subscription Cleanup**: Proper RxJS subscription management
- **Garbage Collection**: Large objects cleaned up after use
- **Image Optimization**: Compressed images for faster loading

## Architecture

### Frontend Architecture (Angular)

#### Component Structure
```
src/app/components/
├── app/                    # Main app component
├── breadcrumb/            # Navigation breadcrumbs
├── calendar/              # Workout calendar view
├── confirm-dialog/        # Reusable confirmation dialogs
├── duplicate-program-dialog/ # Program duplication dialog
├── header/               # Application header
├── home/                 # Dashboard/home page
├── loading/              # Loading indicators
├── log/                  # Workout logs
├── login/                # Authentication
├── profile/              # User profile management
├── program-detail/       # Individual program view
├── program-list/         # Program listing
├── program-wizard/       # Program creation/editing
├── programs/             # Main programs page
├── select-program/       # Program selection
├── sidebar/              # Navigation sidebar
├── start-workout/        # Workout execution
└── timer/                # Rest timer component
```

#### Service Layer
```
src/app/services/
├── adapter.service.ts     # Data transformation utilities
├── auth.service.ts        # Authentication management
├── exercise.service.ts    # Exercise data operations
├── general.service.ts     # Global state management
├── loading.service.ts     # Loading state management
├── program.service.ts     # Program CRUD operations
├── route.service.ts       # API routing
├── user-stats.service.ts  # User statistics
└── [other services]       # Additional business logic
```

### Backend Architecture (Node.js/Express)

#### Structure
```
backend/src/
├── app.ts                # Express application setup
├── server.ts             # Server entry point
├── config/               # Configuration files
│   ├── config.ts         # Environment configuration
│   └── database.ts       # Database connection
├── controllers/          # Request handlers
│   └── authController.ts # Authentication logic
├── middleware/           # Express middleware
│   ├── auth.ts           # Authentication middleware
│   ├── errorHandler.ts   # Error handling
│   └── logger.ts         # Logging middleware
├── models/               # Database models
│   ├── Exercise.ts       # Exercise schema
│   ├── index.ts          # Model exports
│   ├── Program.ts        # Program schema
│   ├── ScheduledWorkout.ts # Scheduled workout schema
│   └── User.ts           # User schema
├── routes/               # API routes
│   ├── auth.ts           # Authentication routes
│   ├── exercises.ts      # Exercise routes
│   ├── logs.ts           # Log routes (removed)
│   ├── programs.ts       # Program routes
│   ├── scheduled-workouts.ts # Scheduled workout routes (removed)
│   └── user.ts           # User data routes
├── services/             # Business logic
│   └── exerciseService.ts # Exercise operations
├── tests/                # Test files
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
│   └── jwt.ts            # JWT token utilities
```

## Data Flow

### Single API Call Pattern

The application implements a performance-optimized data loading pattern:

1. **Initial Load**: Single API call to `/api/v1/user/initial-data` returns all user-specific data
2. **Data Structure**: 
   ```typescript
   {
     user: {
       _id: string,
       email: string,
       name: string,
       logs: Log[],
       // ... other user fields
     },
     programs: Program[],
     scheduledWorkouts: ScheduledWorkout[],
     // ... other user data
   }
   ```
3. **Frontend Storage**: Data stored in `GeneralService.userInfo$` as a `BehaviorSubject`
4. **Component Usage**: All components subscribe to `userInfo$` for reactive updates

### State Management

#### Global State (GeneralService)
```typescript
export class GeneralService {
  private userInfoSubject = new BehaviorSubject<any>(null);
  userInfo$ = this.userInfoSubject.asObservable();
  
  loadUserInfo(routeService: any): Promise<any> {
    // Loads all user data in single API call
  }
}
```

#### Local State Updates
After successful CRUD operations, components update the global state:

```typescript
// Create/Update
const userInfo = this.gs.userInfo$ && (this.gs as any).userInfoSubject?.value;
if (userInfo && Array.isArray(userInfo.programs)) {
  userInfo.programs = [newProgram, ...userInfo.programs];
  (this.gs as any).userInfoSubject.next({ ...userInfo });
}

// Delete
userInfo.programs = userInfo.programs.filter((p: any) => p._id !== programId);
(this.gs as any).userInfoSubject.next({ ...userInfo });
```

## Key Design Patterns

### 1. Reactive Programming
- **RxJS Observables**: All data flows use reactive patterns
- **BehaviorSubject**: Global state management with initial value
- **takeUntil**: Proper subscription cleanup in components

### 2. Component Communication
- **Service-based**: Components communicate via services
- **Event-driven**: User actions trigger state updates
- **Reactive**: UI updates automatically via subscriptions

### 3. Error Handling
- **Global Error Handler**: Centralized error management
- **Toast Notifications**: User-friendly error messages
- **Graceful Degradation**: Fallback behaviors for failed operations

### 4. Loading States
- **Skeleton Loading**: Placeholder content during data fetch
- **Overlay Loading**: Full-screen loading for major operations
- **Button States**: Disabled states during operations

## UI/UX Design

### Design System
- **Bootstrap Framework**: Global styling and components
- **Custom CSS Variables**: Consistent theming
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA labels and keyboard navigation

### Component Patterns
- **Dialog Overlays**: z-index: 9999 for proper layering
- **Card-based Layout**: Consistent program/workout cards
- **Form Validation**: Real-time validation with error messages
- **Progressive Disclosure**: Multi-step wizards for complex operations

## Security

### Authentication
- **JWT Tokens**: Stateless authentication
- **HTTP Interceptors**: Automatic token inclusion
- **Route Guards**: Protected routes
- **Token Refresh**: Automatic token renewal

### Data Validation
- **Backend Validation**: Express middleware validation
- **Frontend Validation**: Angular reactive forms
- **Type Safety**: TypeScript interfaces and types

## Performance Optimizations

### Frontend
- **Single API Call**: Reduced network requests
- **Reactive Updates**: No unnecessary re-renders
- **Lazy Loading**: Route-based code splitting
- **Memory Management**: Proper subscription cleanup

### Backend
- **Database Indexing**: Optimized queries
- **Caching**: Exercise data caching
- **Error Handling**: Graceful failure recovery
- **Logging**: Comprehensive request/response logging

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Component and service testing
- **Integration Tests**: Component interaction testing
- **E2E Tests**: User workflow testing

### Backend Testing
- **Unit Tests**: Service and utility testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: Model and query testing

## Deployment

### Environment Configuration
- **Development**: Local development setup
- **Production**: Optimized build configuration
- **Environment Variables**: Secure configuration management

### Build Process
- **Angular CLI**: Standardized build process
- **TypeScript Compilation**: Type safety enforcement
- **Asset Optimization**: Image and CSS optimization

## Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration
- **Offline Support**: Service worker implementation
- **Advanced Analytics**: Detailed progress tracking
- **Social Features**: User sharing and community

### Technical Improvements
- **State Management**: NgRx implementation
- **Microservices**: Backend service decomposition
- **Caching Strategy**: Redis implementation
- **Monitoring**: Application performance monitoring

## Conclusion

The Elisha-Fit application follows modern web development best practices with a focus on performance, maintainability, and user experience. The single API call pattern, reactive programming approach, and comprehensive error handling create a robust foundation for future enhancements. 
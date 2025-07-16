# Elisha-Fit Backend

## Project Structure

```
backend/
  src/
    config/      # Configuration and environment management
    controllers/ # Route handler logic (business logic for each endpoint)
    middleware/  # Express middleware (auth, validation, error handling, etc.)
    models/      # Mongoose models and schemas
    routes/      # Express route definitions
    services/    # Service layer for business logic and data access
    utils/       # Utility/helper functions
    types/       # TypeScript type definitions and interfaces
```

- All business logic should be separated into controllers and services.
- Models define the MongoDB schema and validation.
- Middleware is used for authentication, validation, error handling, etc.
- Routes define the API endpoints and connect them to controllers.
- Config centralizes environment and app configuration.
- Utils and types provide reusable helpers and type safety.

This structure ensures maintainability, scalability, and clear separation of concerns for the backend codebase.

## TypeScript Build Process

- **Build:**
  - `npm run build` — Compiles TypeScript from `src/` to `dist/`.
  - `npm run build:watch` — Watches for changes and rebuilds automatically.
  - `npm run clean` — Removes the `dist/` directory before building.
- **Development:**
  - `npm run dev` — Runs the server with hot reload using `nodemon` and `ts-node`.
- **Production:**
  - `npm start` — Runs the compiled JavaScript from `dist/`.

All TypeScript configuration is managed in `tsconfig.json`. Ensure you run `npm run build` before deploying or running in production. 
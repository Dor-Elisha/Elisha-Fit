import mongoose from 'mongoose';

// Use the same mongoose instance that's connected in the main server
// This ensures all models use the same database connection
export default mongoose; 
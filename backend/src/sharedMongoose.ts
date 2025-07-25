import mongoose from 'mongoose';

// In production, we need to ensure all models use the same mongoose connection
// that's established in the main server.js file
// This is a workaround to ensure the backend models use the connected mongoose instance
if (process.env.NODE_ENV === 'production') {
  // In production, the mongoose connection is established in server.js
  // We need to make sure our models use that connection
  // The models will be loaded after the connection is established
}

export default mongoose; 
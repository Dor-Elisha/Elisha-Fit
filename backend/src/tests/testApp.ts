import App from '../app';

// Create a test app instance without starting the server
const testApp = new App();

// Export the Express app for testing
export const app = testApp.app; 
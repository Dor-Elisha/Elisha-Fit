import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test utilities
declare global {
  var testUtils: {
    createTestUser: (userData?: any) => Promise<any>;
    generateAuthToken: (userId: string) => string;
  };
}

global.testUtils = {
  // Dummy helpers for now (real ones can be added in DB tests)
  createTestUser: async () => ({}),
  generateAuthToken: () => ''
}; 
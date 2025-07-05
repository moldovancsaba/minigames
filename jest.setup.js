// Import Jest DOM matchers
import '@testing-library/jest-dom';

// Mock window.confirm
window.confirm = jest.fn(() => true);

// Mock fetch
global.fetch = jest.fn();

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

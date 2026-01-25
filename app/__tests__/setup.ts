import { expect, afterEach, vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

// Mock window.matchMedia for dark mode tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock FileReader for image preview tests
class MockFileReader {
  result: string | ArrayBuffer | null = null;
  error: Error | null = null;
  onload: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onprogress: ((event: any) => void) | null = null;

  readAsDataURL(file: Blob): void {
    // Simulate reading file as data URL (synchronously for tests)
    this.result = 'data:image/jpeg;base64,mockimagedata';
    if (this.onload) {
      // Use queueMicrotask to ensure state updates are processed
      queueMicrotask(() => {
        if (this.onload) {
          this.onload({ target: { result: this.result } } as any);
        }
      });
    }
  }

  readAsArrayBuffer(file: Blob): void {
    this.result = new ArrayBuffer(0);
    if (this.onload) {
      queueMicrotask(() => {
        if (this.onload) {
          this.onload({ target: { result: this.result } } as any);
        }
      });
    }
  }

  readAsText(file: Blob): void {
    this.result = 'mock file content';
    if (this.onload) {
      queueMicrotask(() => {
        if (this.onload) {
          this.onload({ target: { result: this.result } } as any);
        }
      });
    }
  }

  abort(): void {
    this.result = null;
  }
}

vi.stubGlobal('FileReader', MockFileReader as any);

// Mock File.prototype.arrayBuffer() for server-side image tests
if (typeof File !== 'undefined' && !File.prototype.arrayBuffer) {
  File.prototype.arrayBuffer = async function () {
    return new ArrayBuffer(0);
  };
}

// Suppress console errors in tests (optional - remove if you want to see all errors)
const originalError = console.error;
beforeEach(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterEach(() => {
  console.error = originalError;
});

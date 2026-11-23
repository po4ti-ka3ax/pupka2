import '@testing-library/jest-dom/vitest';   // toBeInTheDocument, toBeDisabled ...
import { cleanup } from '@testing-library/react';
import { server } from './server.js';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();   // сбросить подмены, сделанные внутри теста
  cleanup();
  vi.restoreAllMocks();     // снять vi.spyOn(fetch), чтобы вызовы не копились между тестами
  localStorage.clear();     // токен из одного теста не должен попасть в другой
});
afterAll(() => server.close());

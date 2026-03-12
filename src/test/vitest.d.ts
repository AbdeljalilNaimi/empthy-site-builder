/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

declare namespace Vi {
  interface JestAssertion<T = any> extends jest.Matchers<void, T> {}
}

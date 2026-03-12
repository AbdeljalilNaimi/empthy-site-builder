import { vi } from 'vitest';

// Mock Firebase Auth user
export const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
};

// Mock Firebase Auth module
export const mockAuth = {
  currentUser: null as typeof mockUser | null,
  onAuthStateChanged: vi.fn((callback) => {
    callback(mockAuth.currentUser);
    return vi.fn(); // unsubscribe function
  }),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  signInWithPopup: vi.fn(),
};

// Mock Firestore
export const mockFirestore = {
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
};

// Reset all mocks
export const resetMocks = () => {
  mockAuth.currentUser = null;
  vi.clearAllMocks();
};

// Set up authenticated user
export const setAuthenticatedUser = (user = mockUser) => {
  mockAuth.currentUser = user;
};

// Firebase mock module
vi.mock('@/lib/firebase', () => ({
  auth: mockAuth,
  db: {},
  googleProvider: {},
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (auth: any, callback: any) => mockAuth.onAuthStateChanged(callback),
  signInWithEmailAndPassword: mockAuth.signInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockAuth.createUserWithEmailAndPassword,
  signOut: mockAuth.signOut,
  signInWithPopup: mockAuth.signInWithPopup,
  updateProfile: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: mockFirestore.doc,
  getDoc: mockFirestore.getDoc,
  setDoc: mockFirestore.setDoc,
  updateDoc: mockFirestore.updateDoc,
  collection: mockFirestore.collection,
  query: mockFirestore.query,
  where: mockFirestore.where,
  getDocs: mockFirestore.getDocs,
  serverTimestamp: mockFirestore.serverTimestamp,
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

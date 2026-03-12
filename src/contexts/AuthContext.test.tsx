// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { mockAuth, mockFirestore, resetMocks, mockUser } from '@/test/mocks/firebase';

// Test component to access auth context
const TestComponent = () => {
  const { user, isAuthenticated, isLoading, hasRole, profile, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'ready'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'yes' : 'no'}</div>
      <div data-testid="user-email">{user?.email || 'none'}</div>
      <div data-testid="has-admin-role">{hasRole('admin') ? 'yes' : 'no'}</div>
      <div data-testid="has-patient-role">{hasRole('patient') ? 'yes' : 'no'}</div>
      <button onClick={() => login('test@example.com', 'password123')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

const renderWithAuth = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('Initial State', () => {
    it('starts in loading state', () => {
      mockAuth.onAuthStateChanged = vi.fn(() => vi.fn());
      
      renderWithAuth();
      
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    });

    it('shows not authenticated when no user', async () => {
      mockAuth.currentUser = null;
      mockAuth.onAuthStateChanged = vi.fn((callback) => {
        callback(null);
        return vi.fn();
      });

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('no');
      });
    });
  });

  describe('Authentication', () => {
    it('shows authenticated when user exists', async () => {
      mockAuth.currentUser = mockUser;
      mockAuth.onAuthStateChanged = vi.fn((callback) => {
        callback(mockUser);
        return vi.fn();
      });
      
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          id: mockUser.uid,
          email: mockUser.email,
          full_name: 'Test User',
          avatar_url: null,
        }),
      });
      
      mockFirestore.getDocs.mockResolvedValue({
        docs: [],
      });

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('yes');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      });
    });

    it('calls Firebase signIn on login', async () => {
      const user = userEvent.setup();
      
      mockAuth.signInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      });

      mockAuth.onAuthStateChanged = vi.fn((callback) => {
        callback(null);
        return vi.fn();
      });

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      await user.click(screen.getByText('Login'));

      expect(mockAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });

    it('calls Firebase signOut on logout', async () => {
      const user = userEvent.setup();
      
      mockAuth.currentUser = mockUser;
      mockAuth.signOut.mockResolvedValue(undefined);
      mockAuth.onAuthStateChanged = vi.fn((callback) => {
        callback(mockUser);
        return vi.fn();
      });

      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ id: mockUser.uid, email: mockUser.email }),
      });
      mockFirestore.getDocs.mockResolvedValue({ docs: [] });

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('yes');
      });

      await user.click(screen.getByText('Logout'));

      expect(mockAuth.signOut).toHaveBeenCalled();
    });
  });

  describe('Role Checking', () => {
    it('returns true for matching role', async () => {
      mockAuth.currentUser = mockUser;
      mockAuth.onAuthStateChanged = vi.fn((callback) => {
        callback(mockUser);
        return vi.fn();
      });

      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          id: mockUser.uid,
          email: mockUser.email,
          full_name: 'Test User',
        }),
      });

      mockFirestore.getDocs.mockResolvedValue({
        docs: [{ data: () => ({ role: 'admin' }) }],
      });

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByTestId('has-admin-role')).toHaveTextContent('yes');
      });
    });

    it('returns false for non-matching role', async () => {
      mockAuth.currentUser = mockUser;
      mockAuth.onAuthStateChanged = vi.fn((callback) => {
        callback(mockUser);
        return vi.fn();
      });

      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          id: mockUser.uid,
          email: mockUser.email,
        }),
      });

      mockFirestore.getDocs.mockResolvedValue({
        docs: [{ data: () => ({ role: 'patient' }) }],
      });

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByTestId('has-admin-role')).toHaveTextContent('no');
        expect(screen.getByTestId('has-patient-role')).toHaveTextContent('yes');
      });
    });
  });
});

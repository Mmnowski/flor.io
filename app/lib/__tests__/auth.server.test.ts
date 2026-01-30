import { getUserByEmail, getUserById, loginUser, registerUser } from '~/lib';
import { supabaseServer } from '~/lib/infrastructure/supabase.server';

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('~/lib/infrastructure/supabase.server', () => ({
  supabaseServer: {
    auth: {
      admin: {
        createUser: vi.fn(),
        getUserById: vi.fn(),
        listUsers: vi.fn(),
      },
      signInWithPassword: vi.fn(),
    },
  },
}));

describe('auth.server.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user with valid credentials', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      vi.mocked(supabaseServer.auth.admin.createUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any);

      const result = await registerUser('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(supabaseServer.auth.admin.createUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        email_confirm: true,
      });
    });

    it('should throw error on registration failure', async () => {
      vi.mocked(supabaseServer.auth.admin.createUser).mockResolvedValue({
        data: { user: null },
        error: { message: 'User already exists' },
      } as any);

      await expect(registerUser('existing@example.com', 'password')).rejects.toThrow(
        'Failed to register: User already exists'
      );
    });

    it('should auto-confirm email for MVP', async () => {
      vi.mocked(supabaseServer.auth.admin.createUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      } as any);

      await registerUser('test@example.com', 'password');

      const callArgs = (supabaseServer.auth.admin.createUser as any).mock.calls[0][0];
      expect(callArgs.email_confirm).toBe(true);
    });
  });

  describe('loginUser', () => {
    it('should login user with valid credentials', async () => {
      const mockSession = { access_token: 'token-123', user: { id: 'user-123' } };
      vi.mocked(supabaseServer.auth.signInWithPassword).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      const result = await loginUser('test@example.com', 'password123');

      expect(result).toEqual(mockSession);
      expect(supabaseServer.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should throw error on login failure', async () => {
      vi.mocked(supabaseServer.auth.signInWithPassword).mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid credentials' },
      } as any);

      await expect(loginUser('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Failed to login: Invalid credentials'
      );
    });

    it('should return session object on successful login', async () => {
      const mockSession = {
        access_token: 'token-123',
        refresh_token: 'refresh-123',
        user: { id: 'user-123', email: 'test@example.com' },
      };
      vi.mocked(supabaseServer.auth.signInWithPassword).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      const result = await loginUser('test@example.com', 'password');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
    });
  });

  describe('getUserById', () => {
    it('should retrieve user by ID', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      vi.mocked(supabaseServer.auth.admin.getUserById).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any);

      const result = await getUserById('user-123');

      expect(result).toEqual(mockUser);
      expect(supabaseServer.auth.admin.getUserById).toHaveBeenCalledWith('user-123');
    });

    it('should throw error if user not found', async () => {
      vi.mocked(supabaseServer.auth.admin.getUserById).mockResolvedValue({
        data: { user: null },
        error: { message: 'User not found' },
      } as any);

      await expect(getUserById('nonexistent-user')).rejects.toThrow(
        'Failed to get user: User not found'
      );
    });

    it('should handle database errors', async () => {
      vi.mocked(supabaseServer.auth.admin.getUserById).mockResolvedValue({
        data: { user: null },
        error: { message: 'Database connection failed' },
      } as any);

      await expect(getUserById('user-123')).rejects.toThrow(
        'Failed to get user: Database connection failed'
      );
    });
  });

  describe('getUserByEmail', () => {
    it('should retrieve user by email', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      vi.mocked(supabaseServer.auth.admin.listUsers).mockResolvedValue({
        data: { users: [mockUser] },
        error: null,
      } as any);

      const result = await getUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
    });

    it('should return undefined if user with email not found', async () => {
      vi.mocked(supabaseServer.auth.admin.listUsers).mockResolvedValue({
        data: { users: [{ id: 'user-123', email: 'other@example.com' }] },
        error: null,
      } as any);

      const result = await getUserByEmail('nonexistent@example.com');

      expect(result).toBeUndefined();
    });

    it('should filter from multiple users', async () => {
      const mockUsers = [
        { id: 'user-1', email: 'user1@example.com' },
        { id: 'user-2', email: 'user2@example.com' },
        { id: 'user-3', email: 'user3@example.com' },
      ];
      vi.mocked(supabaseServer.auth.admin.listUsers).mockResolvedValue({
        data: { users: mockUsers },
        error: null,
      } as any);

      const result = await getUserByEmail('user2@example.com');

      expect(result).toEqual(mockUsers[1]);
    });
  });
});

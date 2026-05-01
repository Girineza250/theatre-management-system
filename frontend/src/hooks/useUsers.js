// src/hooks/useUsers.js - Updated to match the new backend implementation
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import userApi from '@api/users';

/**
 * Custom hook for managing users
 * Centralizes all user-related data fetching and mutations with improved error handling
 */
export const useUsers = () => {
  const queryClient = useQueryClient();

  /**
   * Get all users (Admin only) - Updated to support query parameters
   */
  const useGetAllUsers = (params = {}, options = {}) => {
    return useQuery({
      queryKey: ['admin-users', params], // Include params in query key for proper caching
      queryFn: async () => {
        try {
          const data = await userApi.getAllUsers(params);
          return Array.isArray(data) ? data : [];
        } catch (error) {
          console.error('Error fetching all users:', error);
          throw error; // Let React Query handle the error instead of returning mock data
        }
      },
      ...options
    });
  };

  /**
   * Get current user's profile
   */
  const useGetCurrentUser = (options = {}) => {
    return useQuery({
      queryKey: ['current-user'],
      queryFn: () => userApi.getCurrentUser(),
      ...options
    });
  };

  /**
   * Get a user by ID (Admin only)
   */
  const useGetUser = (id, options = {}) => {
    return useQuery({
      queryKey: ['user', id],
      queryFn: () => userApi.getUserById(id),
      enabled: !!id,
      ...options
    });
  };

  /**
   * Create a new user (Admin only)
   */
  const useCreateUser = (options = {}) => {
    return useMutation({
      mutationFn: (userData) => userApi.createUser(userData),
      onSuccess: () => {
        // Invalidate all user-related queries
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      },
      ...options
    });
  };

  /**
   * Update a user (Admin only)
   */
  const useUpdateUser = (options = {}) => {
    return useMutation({
      mutationFn: ({ id, userData }) => userApi.updateUser(id, userData),
      onSuccess: (_, variables) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      },
      ...options
    });
  };

  /**
   * Update current user's profile
   */
  const useUpdateProfile = (options = {}) => {
    return useMutation({
      mutationFn: (profileData) => userApi.updateProfile(profileData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['current-user'] });
      },
      ...options
    });
  };

  /**
   * Change current user's password
   */
  const useChangePassword = (options = {}) => {
    return useMutation({
      mutationFn: (passwordData) => userApi.changePassword(passwordData),
      ...options
    });
  };

  /**
   * Delete a user (Admin only)
   */
  const useDeleteUser = (options = {}) => {
    return useMutation({
      mutationFn: (id) => userApi.deleteUser(id),
      onSuccess: () => {
        // Invalidate all user-related queries
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      },
      ...options
    });
  };

  /**
   * Check if username exists
   */
  const useCheckUsername = (username, options = {}) => {
    return useQuery({
      queryKey: ['check-username', username],
      queryFn: () => userApi.existsByUsername(username),
      enabled: !!username,
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
      ...options
    });
  };

  /**
   * Check if email exists
   */
  const useCheckEmail = (email, options = {}) => {
    return useQuery({
      queryKey: ['check-email', email],
      queryFn: () => userApi.existsByEmail(email),
      enabled: !!email,
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
      ...options
    });
  };

  /**
   * Get user statistics - NEW HOOK
   */
  const useGetUserStats = (options = {}) => {
    return useQuery({
      queryKey: ['user-stats'],
      queryFn: () => userApi.getUserStats(),
      staleTime: 1000 * 60 * 2, // Cache for 2 minutes
      ...options
    });
  };

  /**
   * Update user role (Admin only) - NEW HOOK
   */
  const useUpdateUserRole = (options = {}) => {
    return useMutation({
      mutationFn: ({ id, role }) => userApi.updateUserRole(id, role),
      onSuccess: (_, variables) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      },
      ...options
    });
  };

  /**
   * Search users by query - UTILITY HOOK
   */
  const useSearchUsers = (query, options = {}) => {
    return useQuery({
      queryKey: ['search-users', query],
      queryFn: () => userApi.searchUsers(query),
      enabled: !!query && query.length >= 2,
      staleTime: 1000 * 60 * 1, // Cache for 1 minute
      ...options
    });
  };

  /**
   * Get users by role - UTILITY HOOK
   */
  const useGetUsersByRole = (role, options = {}) => {
    return useQuery({
      queryKey: ['users-by-role', role],
      queryFn: () => userApi.getUsersByRole(role),
      enabled: !!role,
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
      ...options
    });
  };

  return {
    useGetAllUsers,
    useGetCurrentUser,
    useGetUser,
    useCreateUser,
    useUpdateUser,
    useUpdateProfile,
    useChangePassword,
    useDeleteUser,
    useCheckUsername,
    useCheckEmail,
    useGetUserStats,        // NEW
    useUpdateUserRole,      // NEW
    useSearchUsers,         // NEW UTILITY
    useGetUsersByRole       // NEW UTILITY
  };
};

// Individual exports for easier imports - UPDATED TO INCLUDE NEW HOOKS
export const useGetAllUsers = (params = {}, options = {}) => useUsers().useGetAllUsers(params, options);
export const useGetCurrentUser = (options = {}) => useUsers().useGetCurrentUser(options);
export const useGetUser = (id, options = {}) => useUsers().useGetUser(id, options);
export const useCreateUser = (options = {}) => useUsers().useCreateUser(options);
export const useUpdateUser = (options = {}) => useUsers().useUpdateUser(options);
export const useUpdateProfile = (options = {}) => useUsers().useUpdateProfile(options);
export const useChangePassword = (options = {}) => useUsers().useChangePassword(options);
export const useDeleteUser = (options = {}) => useUsers().useDeleteUser(options);
export const useCheckUsername = (username, options = {}) => useUsers().useCheckUsername(username, options);
export const useCheckEmail = (email, options = {}) => useUsers().useCheckEmail(email, options);
export const useGetUserStats = (options = {}) => useUsers().useGetUserStats(options);
export const useUpdateUserRole = (options = {}) => useUsers().useUpdateUserRole(options);
export const useSearchUsers = (query, options = {}) => useUsers().useSearchUsers(query, options);
export const useGetUsersByRole = (role, options = {}) => useUsers().useGetUsersByRole(role, options);

export default useUsers;
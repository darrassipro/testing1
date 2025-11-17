import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseQuery from "../BaseQuery";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQuery,
  tagTypes: ['User', 'Users'],
  endpoints: (builder) => ({
    // Inscription d'un nouvel utilisateur
    registerUser: builder.mutation({
      query: (userData) => ({
        url: "/api/auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ['Users'],
    }),
providerRegister: builder.mutation({
  query: (providerData) => ({
    url: "/api/auth/provider-register",
    method: "POST",
    body: providerData,
  }),
  invalidatesTags: ['Users'],
}),

    // Connexion d'un utilisateur par téléphone
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "/api/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    // Récupérer le profil de l'utilisateur connecté
    getUserProfile: builder.query({
      query: () => ({
        url: "/api/users/profile",
        method: "GET",
      }),
      providesTags: ['User'],
      transformResponse: (response) => {
        // Handle both response formats: { user: ... } or { data: ... }
        return response.data || response.user || response;
      },
    }),

    // Mettre à jour le profil de l'utilisateur
    updateUserProfile: builder.mutation({
      query: (userData) => ({
        url: "/api/users/profile",
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Envoyer le code OTP (Step 1)
    sendOTP: builder.mutation({
      query: (data) => ({
        url: "/api/auth/otp/send",
        method: "POST",
        body: data,
      }),
    }),

    // Vérifier le code OTP (Step 2)
    verifyOTP: builder.mutation({
      query: (data) => ({
        url: "/api/auth/otp/verify",
        method: "POST",
        body: data,
      }),
    }),

    // Renvoyer le code OTP
    resendOTP: builder.mutation({
      query: (data) => ({
        url: "/api/auth/otp/send",
        method: "POST",
        body: data,
      }),
    }),

    // Envoyer OTP de réinitialisation de mot de passe
    sendPasswordResetOTP: builder.mutation({
      query: (data) => ({
        url: "/api/users/password-reset/send-otp",
        method: "POST",
        body: data,
      }),
    }),

    // Vérifier OTP de réinitialisation de mot de passe
    verifyPasswordResetOTP: builder.mutation({
      query: (data) => ({
        url: "/api/users/password-reset/verify-otp",
        method: "POST",
        body: data,
      }),
    }),

    // Réinitialiser le mot de passe
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/api/users/password-reset/reset",
        method: "POST",
        body: data,
      }),
    }),

    // ===== ADMIN ENDPOINTS =====
    
    // Get all users (admin only)
    getAllUsers: builder.query({
      query: ({ page = 1, limit = 10, search = '', status = 'all' } = {}) => ({
        url: `/api/users/`,
        method: "GET",
        params: { page, limit, search, status },
      }),
      providesTags: ['Users'],
    }),

    // Create user (admin only)
    createUser: builder.mutation({
      query: (userData) => ({
        url: "/api/users/admin/create",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ['Users'],
    }),

    // Update user (admin only)
    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/users/admin/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ['Users', 'User'],
    }),

    // Suspend/Unsuspend user (admin only)
    suspendUser: builder.mutation({
      query: (userId) => ({
        url: `/api/users/admin/${userId}/suspend`,
        method: "PUT",
      }),
      invalidatesTags: ['Users'],
    }),

    // Delete user (admin only)
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/api/users/admin/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Users'],
    }),

    // Update user role (admin only)
    updateUserRole: builder.mutation({
      query: ({ userId, role }) => ({
        url: `/api/users/admin/${userId}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: ['Users'],
    }),

    // Check if user has admin rights
    checkAdminRights: builder.query({
      query: () => ({
        url: "/api/users/check-admin",
        method: "GET",
      }),
      providesTags: ['User'],
    }),
  }),
});

// Export des hooks générés automatiquement
export const {
  // Authentification
  useRegisterUserMutation,
  useLoginUserMutation,
  useProviderRegisterMutation,
  // Profil utilisateur
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  // OTP Verification
  useSendOTPMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  // Password Reset
  useSendPasswordResetOTPMutation,
  useVerifyPasswordResetOTPMutation,
  useResetPasswordMutation,
  // Admin Endpoints
  useGetAllUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useSuspendUserMutation,
  useDeleteUserMutation,
  useUpdateUserRoleMutation,
  useCheckAdminRightsQuery,
} = userApi;

// Export de l'API pour l'utiliser dans le store
export default userApi;
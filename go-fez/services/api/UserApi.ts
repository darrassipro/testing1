import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../BaseQuery";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQuery,
  tagTypes: ['User', 'Users'],
  endpoints: (builder) => ({
    // Register new user
    registerUser: builder.mutation({
      query: (userData) => ({
        url: "/api/auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ['Users'],
    }),

    // Provider register (social auth)
    providerRegister: builder.mutation({
      query: (providerData) => ({
        url: "/api/auth/provider-register",
        method: "POST",
        body: providerData,
      }),
      invalidatesTags: ['Users'],
    }),

    // Login user
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "/api/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    // Get user profile
    getUserProfile: builder.query({
      query: () => ({
        url: "/api/users/profile",
        method: "GET",
      }),
      providesTags: ['User'],
      transformResponse: (response: any) => {
        return response.data || response.user || response;
      },
    }),

    // Update user profile
    updateUserProfile: builder.mutation({
      query: (userData) => ({
        url: "/api/users/profile",
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Send OTP
    sendOTP: builder.mutation({
      query: (data) => ({
        url: "/api/auth/otp/send",
        method: "POST",
        body: data,
      }),
    }),

    // Verify OTP
    verifyOTP: builder.mutation({
      query: (data) => ({
        url: "/api/auth/otp/verify",
        method: "POST",
        body: data,
      }),
    }),

    // Resend OTP
    resendOTP: builder.mutation({
      query: (data) => ({
        url: "/api/auth/otp/send",
        method: "POST",
        body: data,
      }),
    }),

    // Send password reset OTP
    sendPasswordResetOTP: builder.mutation({
      query: (data) => ({
        url: "/api/users/password-reset/send-otp",
        method: "POST",
        body: data,
      }),
    }),

    // Verify password reset OTP
    verifyPasswordResetOTP: builder.mutation({
      query: (data) => ({
        url: "/api/users/password-reset/verify-otp",
        method: "POST",
        body: data,
      }),
    }),

    // Resend password reset OTP
    resendPasswordResetOTP: builder.mutation({
      query: (data) => ({
        url: "/api/users/password-reset/send-otp",
        method: "POST",
        body: data,
      }),
    }),

    // Reset password
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/api/users/password-reset/reset",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useProviderRegisterMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useSendOTPMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useSendPasswordResetOTPMutation,
  useVerifyPasswordResetOTPMutation,
  useResendPasswordResetOTPMutation,
  useResetPasswordMutation,
} = userApi;

export default userApi;

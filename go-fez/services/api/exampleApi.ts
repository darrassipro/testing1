/**
 * Exemple d'API utilisant RTK Query
 * 
 * Ce fichier montre comment créer une API qui se connecte au backend.
 * Copiez ce fichier et adaptez-le selon vos besoins.
 * 
 * Exemple d'utilisation dans un composant :
 * 
 * import { useGetUsersQuery, useCreateUserMutation } from '@/services/api/exampleApi';
 * 
 * function MyComponent() {
 *   const { data, isLoading, error } = useGetUsersQuery();
 *   const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
 *   
 *   const handleCreate = async () => {
 *     try {
 *       await createUser({ name: 'John', email: 'john@example.com' }).unwrap();
 *     } catch (err) {
 *       console.error('Erreur:', err);
 *     }
 *   };
 *   
 *   return (...);
 * }
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '../BaseQuery';

// Types pour les données
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

// Création de l'API
export const exampleApi = createApi({
  reducerPath: 'exampleApi',
  baseQuery: baseQuery, // Utilise la configuration de baseQuery.tsx
  tagTypes: ['User'], // Pour le cache invalidation
  endpoints: (builder) => ({
    // Exemple: GET /users
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    
    // Exemple: GET /users/:id
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    
    // Exemple: POST /users
    createUser: builder.mutation<User, CreateUserRequest>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Exemple: PUT /users/:id
    updateUser: builder.mutation<User, { id: string; data: Partial<CreateUserRequest> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),
    
    // Exemple: DELETE /users/:id
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

// Export des hooks générés automatiquement
export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = exampleApi;


import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../BaseQuery";

export interface Category {
  id: string;
  ar: string | CategoryLocalization;
  fr: string | CategoryLocalization;
  en: string | CategoryLocalization;
  icon?: string;
  iconPublicId?: string;
  isActive: boolean;
  isDeleted: boolean;
  nbPois?: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryLocalization {
  name: string;
  desc: string;
}

export interface CategoryLocalizations {
  ar: { name: string; desc: string };
  fr: { name: string; desc: string };
  en: { name: string; desc: string };
}

export interface CreateCategoryData {
  localizations: CategoryLocalizations;
  isActive?: boolean;
}

export interface UpdateCategoryData {
  localizations: CategoryLocalizations;
  isActive?: boolean;
}

export interface GetCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'id' | 'name' | 'newest' | 'oldest';
}

export interface GetCategoriesResponse {
  status: string;
  message: string;
  data: {
    categories: Category[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: baseQuery,
  tagTypes: ['Category', 'Categories'],
  endpoints: (builder) => ({
    getAllCategories: builder.query<{ status: string; data: Category[] }, void>({
      query: () => ({
        url: "/api/categorys/",
        method: "GET",
      }),
      providesTags: ['Categories'],
    }),

    getFilteredCategories: builder.query<GetCategoriesResponse, GetCategoriesParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);

        return {
          url: `/api/categorys/?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ['Categories'],
    }),

    getCategoryById: builder.query<{ status: string; data: Category }, string>({
      query: (id) => ({
        url: `/api/categorys/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    createCategory: builder.mutation<{ status: string; data: Category }, FormData>({
      query: (formData) => ({
        url: "/api/categorys/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['Categories'],
    }),

    updateCategory: builder.mutation<{ status: string; data: Category }, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/api/categorys/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        'Categories'
      ],
    }),

    deleteCategory: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({
        url: `/api/categorys/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Categories'],
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useGetFilteredCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;

export default categoryApi;
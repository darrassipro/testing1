"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useGetReviewsForPOIQuery } from "@/services/api/ReviewApi";
import { useGetUserReviewsQuery } from "@/services/api/ReviewApi";
import { useSelector } from 'react-redux';
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReviewListProps {
  poiId: string;
}

const ReviewList = ({ poiId }: ReviewListProps) => {
  const t = useTranslations("ReviewList");
  const [page, setPage] = useState(1);
  const limit = 5;

  // Get current logged-in user from redux (if any) - MUST be before any conditional returns
  const auth = useSelector((state: any) => state.auth);
  const currentUserId = auth?.user?.id || auth?.user?.userId || auth?.user?.user_id || null;

  // Fetch public reviews
  const { data, isLoading, isError } = useGetReviewsForPOIQuery({
    poiId,
    page,
    limit,
  });

  // Fetch user's reviews so we can show their pending review on the POI page - MUST be before any conditional returns
  const { data: myReviewsData } = useGetUserReviewsQuery({ page: 1, limit: 50 }, { skip: !currentUserId });

  // Now we can have conditional returns
  if (isLoading) {
    return <div className="text-center py-8">{t("loading")}</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-red-500">{t("error") || "Erreur lors du chargement des avis"}</div>;
  }

  const reviews = data?.data?.reviews || [];
  const totalPages = data?.data?.totalPages || 1;

  const myReviews = myReviewsData?.data?.reviews || [];
  const myPendingReview = myReviews.find((r: any) => r.poiId === poiId && !r.isDeleted && !r.isAccepted);

  // If there are no accepted reviews, we may still show the current user's pending review
  if (reviews.length === 0 && !myPendingReview) {
    return <div className="text-gray-500 text-center py-8">{t("noReviews")}</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold border-b pb-2">{t("title")}</h3>
      {/* If the current logged-in user has a pending review for this POI, show it first */}
      {myPendingReview && (
        <article key={myPendingReview.id} className="p-4 border rounded-lg shadow-sm bg-yellow-50">
          <div className="flex items-start gap-4 mb-3">
            <Avatar className="h-12 w-12 border-2 border-gray-200">
              <AvatarImage src={auth?.user?.profileImage} alt={auth?.user?.firstName || 'User'} />
              <AvatarFallback className="text-sm font-semibold bg-[#007036]/10 text-[#007036]">
                {auth?.user?.firstName ? `${auth.user.firstName.charAt(0)}${(auth.user.lastName||'').charAt(0)}` : 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800">{auth?.user?.firstName ? `${auth.user.firstName} ${auth.user.lastName||''}` : (auth?.user?.email ? auth.user.email.split('@')[0] : 'You')}</span>
                <span className="text-sm text-gray-500">{new Date(myPendingReview.created_at || myPendingReview.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <div className="text-lg font-bold">{myPendingReview.rating}</div>
                <div className="text-sm text-gray-500">/ 5</div>
                <span className="ml-auto text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{t('pending') || 'Pending'}</span>
              </div>

              {myPendingReview.comment && <p className="text-gray-700">{myPendingReview.comment}</p>}
            </div>
          </div>
        </article>
      )}

      {reviews.map((review) => {
        const userName = review.user?.firstName && review.user?.lastName 
          ? `${review.user.firstName} ${review.user.lastName}`
          : review.user?.email 
          ? review.user.email.split('@')[0]
          : 'Utilisateur anonyme';
        
        const userInitials = review.user?.firstName && review.user?.lastName
          ? `${review.user.firstName.charAt(0)}${review.user.lastName.charAt(0)}`
          : review.user?.email
          ? review.user.email.charAt(0).toUpperCase()
          : 'U';

        return (
          <article key={review.id} className="p-4 border rounded-lg shadow-sm bg-white">
            <div className="flex items-start gap-4 mb-3">
              {/* User Avatar */}
              <Avatar className="h-12 w-12 border-2 border-gray-200">
                <AvatarImage src={review.user?.profileImage} alt={userName} />
                <AvatarFallback className="text-sm font-semibold bg-[#007036]/10 text-[#007036]">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              {/* User Info and Date */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-800">
                    {userName}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at || review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Star rating display */}
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.965a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.445a1 1 0 00-.364 1.118l1.287 3.965c.3.921-.755 1.688-1.54 1.118l-3.368-2.445a1 1 0 00-1.175 0l-3.368 2.445c-.784.57-1.838-.197-1.54-1.118l1.287-3.965a1 1 0 00-.364-1.118L2.05 9.392c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.965z" />
                    </svg>
                  ))}
                </div>
                
                {/* Review comment */}
                {review.comment && <p className="text-gray-700">{review.comment}</p>}
              </div>
            </div>
          </article>
        );
      })}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
          >
            {t("previous") || "Précédent"}
          </Button>
          <span className="text-sm text-gray-600">
            {t("page") || "Page"} {page} / {totalPages}
          </span>
          <Button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="outline"
          >
            {t("next") || "Suivant"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
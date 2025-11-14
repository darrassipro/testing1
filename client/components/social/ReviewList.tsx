"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useGetReviewsForPOIQuery } from "@/services/api/ReviewApi";
import { useGetUserReviewsQuery } from "@/services/api/ReviewApi";
import { useSelector } from 'react-redux';
import { Star, AlertCircle, Clock } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReviewListProps {
  poiId: string;
}

const ReviewList = ({ poiId }: ReviewListProps) => {
  const t = useTranslations("ReviewList");
  const [page, setPage] = useState(1);
  const limit = 5;

  const auth = useSelector((state: any) => state.auth);
  const currentUserId = auth?.user?.id || auth?.user?.userId || auth?.user?.user_id || null;

  const { data, isLoading, isError } = useGetReviewsForPOIQuery({
    poiId,
    page,
    limit,
  });

  const { data: myReviewsData } = useGetUserReviewsQuery({ page: 1, limit: 50 }, { skip: !currentUserId });

  if (isLoading) {
    return <div className="text-center py-8">{t("loading")}</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-red-500">{t("error")}</div>;
  }

  const reviews = data?.data?.reviews || [];
  const totalPages = data?.data?.totalPages || 1;

  const myReviews = myReviewsData?.data?.reviews || [];
  
  // Find user's review that is NOT accepted (Pending or Rejected)
  const myInteraction = myReviews.find((r: any) => r.poiId === poiId && !r.isDeleted && !r.isAccepted);

  if (reviews.length === 0 && !myInteraction) {
    return <div className="text-gray-500 text-center py-8">{t("noReviews")}</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold border-b pb-2">{t("title")}</h3>
      
      {/* --- USER STATUS CARD (Pending or Rejected) --- */}
      {myInteraction && (() => {
        const report = myInteraction.aiReport || "";
        
        // FIX: Simplified logic. 
        // If 'isAccepted' is false (which it is for this variable), 
        // and 'aiReport' exists and is NOT a system error ('UNCERTAIN'), then it is REJECTED.
        const isRejected = report && !report.startsWith("UNCERTAIN");
        
        // Extract clean reason
        let reason = report;
        // If AI rejection, remove prefix. If Manual rejection, keep as is.
        if (reason.startsWith("REJECT:")) {
            reason = reason.replace(/^REJECT:\s*/, "").trim();
        }

        // Styles and Labels
        const cardStyle = isRejected ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200";
        const badgeStyle = isRejected ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";
        const statusLabel = isRejected ? t("rejected") : t("pending");
        const Icon = isRejected ? AlertCircle : Clock;

        return (
            <article className={`p-4 border rounded-lg shadow-sm ${cardStyle} animate-in fade-in slide-in-from-top-2`}>
            <div className="flex items-start gap-4 mb-3">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                <AvatarImage src={auth?.user?.profileImage} alt={auth?.user?.firstName || 'User'} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {auth?.user?.firstName ? auth.user.firstName.charAt(0) : 'U'}
                </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">
                        {t("yourReview")}
                    </span>
                    <span className="text-xs text-gray-500">
                        {new Date(myInteraction.created_at || myInteraction.createdAt).toLocaleDateString()}
                    </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-100">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-gray-700">{myInteraction.rating}</span>
                    </div>
                    
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${badgeStyle}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {statusLabel}
                    </span>
                </div>

                {myInteraction.comment && (
                    <p className="text-gray-700 text-sm leading-relaxed bg-white/50 p-2 rounded">
                        {myInteraction.comment}
                    </p>
                )}

                {/* Rejection Reason - Only show if Rejected */}
                {isRejected && reason && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-red-600 bg-red-100/50 p-2.5 rounded-md border border-red-100">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>
                            <strong>{t("reason")} :</strong> {reason}
                        </span>
                    </div>
                )}
                
                {/* Pending Message - Only show if NOT Rejected */}
                {!isRejected && (
                    <p className="mt-2 text-xs text-amber-600 italic">
                        {t("moderationPending")}
                    </p>
                )}
                </div>
            </div>
            </article>
        );
      })()}

      {/* --- PUBLIC REVIEWS --- */}
      <div className="flex flex-col gap-4">
        {reviews.map((review) => {
            const userName = review.user?.firstName && review.user?.lastName 
            ? `${review.user.firstName} ${review.user.lastName}`
            : review.user?.email 
            ? review.user.email.split('@')[0]
            : 'Utilisateur anonyme';
            
            const userInitials = userName.charAt(0).toUpperCase();

            return (
            <article key={review.id} className="p-5 border rounded-xl bg-white hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 border border-gray-100">
                    <AvatarImage src={review.user?.profileImage} alt={userName} />
                    <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
                    {userInitials}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{userName}</h4>
                            <div className="flex items-center gap-0.5 mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                <Star 
                                    key={i} 
                                    className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} 
                                />
                                ))}
                            </div>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                            {new Date(review.created_at || review.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    
                    {review.comment && (
                        <p className="text-gray-600 text-sm mt-2 leading-relaxed break-words">
                            {review.comment}
                        </p>
                    )}
                </div>
                </div>
            </article>
            );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
            size="sm"
          >
            {t("previous")}
          </Button>
          <span className="text-sm font-medium text-gray-600">
            {t("page")} {page} / {totalPages}
          </span>
          <Button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="outline"
            size="sm"
          >
            {t("next")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
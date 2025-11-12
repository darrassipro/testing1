"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useCreateReviewMutation } from "@/services/api/ReviewApi";
import { toast } from "sonner";

interface ReviewFormProps {
  poiId: string;
  onSubmitSuccess?: () => void; // Callback to refetch reviews (now optional)
}

const ReviewForm = ({ poiId, onSubmitSuccess }: ReviewFormProps) => {
  const t = useTranslations("ReviewForm");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  
  const [createReview, { isLoading }] = useCreateReviewMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error(t("ratingRequired"));
      return;
    }
    
    try {
      const result = await createReview({
        poiId,
        rating,
        comment: comment.trim() || undefined,
      }).unwrap();
      
      toast.success(t("successTitle"));
      setRating(0);
      setComment("");
      onSubmitSuccess?.(); // Trigger refetch (optional)
    } catch (error: any) {
      console.error("Error submitting review:", error);
      const errorMessage = error?.data?.message || error?.message || t("errorSubmit") || "Erreur lors de la soumission de l'avis";
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-sm bg-white space-y-4">
      <h3 className="text-2xl font-semibold">{t("title")}</h3>
      
      {/* Star Rating Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t("yourRating")}</label>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
              <button
                type="button"
                key={starValue}
                onClick={() => setRating(starValue)}
                className="focus:outline-none"
              >
                <svg
                  className={`w-8 h-8 cursor-pointer ${
                    starValue <= rating ? "text-yellow-400" : "text-gray-300"
                  } hover:text-yellow-400 transition`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.965a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.445a1 1 0 00-.364 1.118l1.287 3.965c.3.921-.755 1.688-1.54 1.118l-3.368-2.445a1 1 0 00-1.175 0l-3.368 2.445c-.784.57-1.838-.197-1.54-1.118l1.287-3.965a1 1 0 00-.364-1.118L2.05 9.392c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.965z" />
                </svg>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Comment Input */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">{t("yourComment")}</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("commentPlaceholder")}
          className="mt-1 w-full p-2 border rounded-md"
          rows={4}
        />
      </div>

      <button type="submit" disabled={isLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50">
        {isLoading ? t("submitting") : t("submit")}
      </button>
    </form>
  );
};

export default ReviewForm;
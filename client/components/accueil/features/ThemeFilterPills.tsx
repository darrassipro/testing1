"use client";

import React, { useState } from "react";
import { useGetAllCategoriesQuery } from "@/services/api/CategoryApi";

interface ThemeFilterPillsProps {
  themes: any[];
  locale: string;
  onCategorySelect?: (categoryId: string | null) => void;
}

export default function ThemeFilterPills({ themes, locale, onCategorySelect }: ThemeFilterPillsProps) {
  const { data: categoriesData, isLoading } = useGetAllCategoriesQuery();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const categories = categoriesData?.data || [];
  const activeCategories = categories.filter((c) => c.isActive);
  
  // Limit to first 5 categories
  const displayCategories = activeCategories.slice(0, 5);

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-row items-start gap-2 w-full">
        <div className="animate-pulse h-12 md:h-[61px] bg-gray-200 rounded-full w-32"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-start gap-2 w-full flex-wrap md:flex-nowrap">
      {displayCategories.map((category) => {
        // Extract localized name
        let categoryName = "";
        try {
          if (category[locale as keyof typeof category]) {
            const localization =
              typeof category[locale as keyof typeof category] === "string"
                ? JSON.parse(category[locale as keyof typeof category] as string)
                : category[locale as keyof typeof category];
            categoryName = (localization as any)?.name || "";
          }
        } catch (e) {
          categoryName = "Untitled";
        }

        const isSelected = selectedCategory === category.id;

        return (
          <div
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`box-border flex flex-row justify-center items-center px-4 md:px-[18px] py-3 md:py-[18px] gap-2 md:gap-3 h-12 md:h-[61px] border md:border rounded-full md:rounded-[145.588px] flex-none md:flex-1 cursor-pointer transition-all ${
              isSelected 
                ? "bg-[#007036] border-[#007036] text-white" 
                : "bg-white border-[#D9D9D9] text-black hover:border-[#007036]"
            }`}
          >
            {/* Icon */}
            {category.icon && (
              <div className="w-5 md:w-6 h-5 md:h-6 flex-none">
                <img
                  src={category.icon}
                  alt={categoryName}
                  className={`w-full h-full object-contain ${isSelected ? "brightness-0 invert" : ""}`}
                />
              </div>
            )}

            {/* Category Name */}
            <span className={`font-['Inter'] font-medium text-sm md:text-[20.5882px] leading-5 md:leading-[25px] flex-none whitespace-nowrap`}>
              {categoryName}
            </span>
          </div>
        );
      })}

      {/* View All Button */}
      <div 
        onClick={() => handleCategoryClick(null)}
        className={`box-border flex flex-row justify-center items-center px-4 md:px-[18px] py-3 md:py-[18px] gap-1 md:gap-[2.57px] h-12 md:h-[61px] border md:border rounded-full md:rounded-[145.588px] flex-shrink-0 cursor-pointer transition-all ${
          selectedCategory === null
            ? "bg-[#007036] border-[#007036] text-white"
            : "bg-white border-[#D9D9D9] text-black hover:border-[#007036]"
        }`}
      >
        <span className={`font-['Inter'] font-medium text-sm md:text-[20.5882px] leading-5 md:leading-[25px] flex-none`}>
          View all
        </span>
      </div>
    </div>
  );
}

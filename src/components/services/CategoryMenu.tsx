
import React from "react";
import { cn } from "@/lib/utils";

interface CategoryProps {
  categories: {
    id: string;
    name: string;
    icon: string;
    slug: string;
  }[];
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

export const CategoryMenu: React.FC<CategoryProps> = ({
  categories,
  activeCategory,
  setActiveCategory,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-20">
      <h2 className="font-semibold text-lg mb-4">Categories</h2>
      <div className="space-y-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              "w-full flex items-center px-3 py-2 rounded-md text-sm transition-colors",
              activeCategory === category.id
                ? "bg-brand/10 text-brand font-medium"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <img 
              src={category.icon} 
              alt={category.name}
              className="w-5 h-5 mr-3" 
            />
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

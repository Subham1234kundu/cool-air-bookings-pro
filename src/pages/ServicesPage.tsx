
import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { CategoryMenu } from "@/components/services/CategoryMenu";
import { ServiceList } from "@/components/services/ServiceList";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/services/supabase/categories";
import { fetchServices } from "@/services/supabase/services";
import { Skeleton } from "@/components/ui/skeleton";

const ServicesPage = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices
  });

  const category = categories?.find(cat => cat.id.toString() === activeCategory);
  const categoryName = category ? category.name : "All Services";

  if (loadingCategories || loadingServices) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">AC Repair & Services</h1>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4">
              <Skeleton className="h-[300px] w-full" />
            </div>
            <div className="md:w-3/4">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[200px] w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">AC Repair & Services</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Category Menu - Left Sidebar */}
          <div className="md:w-1/4 w-full">
            <CategoryMenu 
              categories={[{ id: "all", name: "All Services", icon: "/icons/service.svg", slug: "all" }, 
                ...(categories?.map(cat => ({
                  id: cat.id.toString(),
                  name: cat.name,
                  icon: cat.image_url || "/icons/service.svg",
                  slug: cat.id.toString()
                })) || [])
              ]} 
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory} 
            />
          </div>
          
          {/* Service List - Main Content */}
          <div className="md:w-3/4 w-full">
            <ServiceList 
              services={services?.map(service => ({
                id: service.id.toString(),
                name: service.name,
                description: service.description || undefined,
                price: service.price,
                duration: `${service.duration_minutes} mins`,
                rating: service.rating || 0,
                reviews: service.review_count || 0,
                image: service.image_url || "/placeholder.svg",
                categoryId: service.category_id?.toString() || ""
              })) || []} 
              category={activeCategory}
              title={categoryName}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ServicesPage;

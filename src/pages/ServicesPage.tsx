
import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { CategoryMenu } from "@/components/services/CategoryMenu";
import { ServiceList } from "@/components/services/ServiceList";
import { categories, services } from "@/data/mock-data";

const ServicesPage = () => {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);

  const category = categories.find(cat => cat.id === activeCategory);
  const categoryName = category ? category.name : "All Services";
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">AC Repair & Services</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Category Menu - Left Sidebar */}
          <div className="md:w-1/4 w-full">
            <CategoryMenu 
              categories={categories} 
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory} 
            />
          </div>
          
          {/* Service List - Main Content */}
          <div className="md:w-3/4 w-full">
            <ServiceList 
              services={services} 
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

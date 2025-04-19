
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const FeaturedServices = () => {
  const featuredServices = [
    {
      id: "service-1",
      title: "AC Repair",
      description: "Expert diagnosis and fixing of AC issues",
      icon: "/icons/repair.svg",
      path: "/services"
    },
    {
      id: "service-2",
      title: "AC Installation",
      description: "Professional setup of new AC units",
      icon: "/icons/installation.svg",
      path: "/services"
    },
    {
      id: "service-3",
      title: "AC Maintenance",
      description: "Regular servicing for optimal performance",
      icon: "/icons/maintenance.svg",
      path: "/services"
    },
    {
      id: "service-4",
      title: "Gas Refill",
      description: "AC refrigerant recharge service",
      icon: "/icons/gas-refill.svg",
      path: "/services"
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold">Our Services</h2>
          <p className="mt-4 text-lg text-gray-600">
            Professional AC services tailored to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg border p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-acblue-50 rounded-full flex items-center justify-center mb-4">
                {/* If you have icons, use them here */}
                <div className="text-skyblue font-bold text-xl">AC</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <div className="mt-auto pt-4">
                <Link to={service.path}>
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

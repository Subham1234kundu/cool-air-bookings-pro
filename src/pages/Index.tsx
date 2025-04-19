
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturedServices } from "@/components/home/FeaturedServices";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Testimonials } from "@/components/home/Testimonials";
const Index = () => {
  return (
    <Layout>
      <Hero />
      <FeaturedServices />
      <HowItWorks />
      <WhyChooseUs />
      <Testimonials />
    </Layout>
  );
};

export default Index;

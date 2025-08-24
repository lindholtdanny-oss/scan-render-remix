import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { DesignStudio } from "@/components/DesignStudio";
import { Features } from "@/components/Features";
import { Demo } from "@/components/Demo";
import { Pricing } from "@/components/Pricing";
import { Support } from "@/components/Support";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Features />
      <Demo />
      <DesignStudio />
      <Pricing />
      <Support />
    </div>
  );
};

export default Index;
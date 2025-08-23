import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { DesignStudio } from "@/components/DesignStudio";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <DesignStudio />
    </div>
  );
};

export default Index;
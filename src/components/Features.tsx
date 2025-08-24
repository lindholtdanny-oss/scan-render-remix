import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Palette, Home, Zap } from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: Camera,
      title: "Photo Upload & Analysis",
      description: "Upload photos of your home and get instant AI-powered analysis and design suggestions."
    },
    {
      icon: Palette,
      title: "Interior Design",
      description: "Transform your interior spaces with AI-generated design concepts and color schemes."
    },
    {
      icon: Home,
      title: "Exterior Renovations",
      description: "Visualize exterior changes, deck additions, and landscaping improvements."
    },
    {
      icon: Zap,
      title: "Instant Rendering",
      description: "Get photorealistic renderings of your renovation ideas in seconds."
    }
  ];

  return (
    <section id="features" className="py-24 bg-surface">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to visualize and plan your home renovation projects
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
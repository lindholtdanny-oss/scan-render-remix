import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, ArrowRight } from "lucide-react";

export const Demo = () => {
  return (
    <section id="demo" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">See It In Action</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch how easy it is to transform your home with AI-powered design
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                  1
                </div>
                <h3 className="text-lg font-semibold">Upload Your Photo</h3>
              </div>
              <p className="text-muted-foreground ml-11">
                Take a photo of your room or exterior and upload it to our platform
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                  2
                </div>
                <h3 className="text-lg font-semibold">Choose Your Style</h3>
              </div>
              <p className="text-muted-foreground ml-11">
                Select from interior, exterior, or deck design options
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                  3
                </div>
                <h3 className="text-lg font-semibold">Get AI Renderings</h3>
              </div>
              <p className="text-muted-foreground ml-11">
                Receive multiple design options in photorealistic quality
              </p>
            </div>
            
            <Button size="lg" className="mt-8">
              Try Demo Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <Card className="bg-surface">
            <CardContent className="p-8">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-6">
                <PlayCircle className="w-16 h-16 text-primary" />
              </div>
              <CardHeader className="p-0">
                <CardTitle>Interactive Demo Available</CardTitle>
                <CardDescription>
                  Try our full design studio above to experience the power of AI-driven home renovation
                </CardDescription>
              </CardHeader>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
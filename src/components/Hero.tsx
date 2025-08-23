import { Button } from "@/components/ui/button";
import { ArrowRight, Scan, Box, Camera } from "lucide-react";
import heroImage from "@/assets/hero-interior.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light rounded-full text-sm font-medium text-primary">
                <Scan className="w-4 h-4" />
                AI-Powered 3D Scanning
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Scan, Design,{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Visualize
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Transform any interior space with AI-powered 3D scanning. Edit walls, 
                move furniture, and generate stunning 4K renders of your perfect design.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group">
                Start Scanning
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg">
                View Demo
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                  <Scan className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">3D Scanning</h3>
                  <p className="text-sm text-muted-foreground">Instant room capture</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center">
                  <Box className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">Live Editing</h3>
                  <p className="text-sm text-muted-foreground">Move walls & furniture</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">4K Renders</h3>
                  <p className="text-sm text-muted-foreground">Professional quality</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={heroImage} 
                alt="Modern interior design showcase" 
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -top-4 -right-4 bg-surface-elevated p-4 rounded-xl shadow-md border">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                Scanning Active
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-surface-elevated p-4 rounded-xl shadow-md border">
              <div className="text-sm font-medium">4K Resolution</div>
              <div className="text-xs text-muted-foreground">3840 × 2160 pixels</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
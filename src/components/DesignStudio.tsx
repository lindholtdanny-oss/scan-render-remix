import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoomViewer3D } from "./RoomViewer3D";
import { PhotoUpload } from "./PhotoUpload";
import { RenderGallery } from "./RenderGallery";
import { 
  Scan, 
  Box, 
  Image, 
  Download,
  Settings,
  Layers,
  Palette,
  Ruler,
  Camera,
  Lightbulb
} from "lucide-react";

interface RenderedImage {
  id: string;
  url: string;
  thumbnail: string;
  type: 'exterior' | 'design-integration';
  createdAt: string;
  originalImages: string[];
  prompt?: string;
  status: 'processing' | 'completed' | 'failed';
}

export const DesignStudio = () => {
  const [renderedImages, setRenderedImages] = useState<RenderedImage[]>([
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
      type: 'exterior',
      createdAt: new Date().toISOString(),
      originalImages: [],
      prompt: 'Modern home exterior with enhanced landscaping',
      status: 'completed'
    }
  ]);

  const handleRenderComplete = (newImages: string[]) => {
    const newRenders: RenderedImage[] = newImages.map((url, index) => ({
      id: `${Date.now()}-${index}`,
      url,
      thumbnail: url,
      type: 'design-integration',
      createdAt: new Date().toISOString(),
      originalImages: [],
      prompt: 'AI-generated design integration',
      status: 'completed'
    }));
    setRenderedImages(prev => [...prev, ...newRenders]);
  };

  const handleDeleteRender = (id: string) => {
    setRenderedImages(prev => prev.filter(r => r.id !== id));
  };

  return (
    <section className="py-20 bg-surface">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light rounded-full text-sm font-medium text-primary mb-4">
            <Box className="w-4 h-4" />
            Live Demo
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Design Studio
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the power of real-time 3D editing. Scan, modify, and visualize your space instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tools */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <Scan className="w-4 h-4 mr-2" />
                  Scan Room
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Camera className="w-4 h-4 mr-2" />
                  Exterior Photos
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Design Ideas  
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Layers className="w-4 h-4 mr-2" />
                  Layers
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Palette className="w-4 h-4 mr-2" />
                  Materials
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Ruler className="w-4 h-4 mr-2" />
                  Measurements
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button size="sm" className="w-full">
                  <Image className="w-4 h-4 mr-2" />
                  Render 4K
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Model
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Viewer */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="3d" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="3d">3D View</TabsTrigger>
                <TabsTrigger value="exterior">Exterior</TabsTrigger>
                <TabsTrigger value="design">Design Ideas</TabsTrigger>
                <TabsTrigger value="2d">Floor Plan</TabsTrigger>
                <TabsTrigger value="render">Gallery</TabsTrigger>
              </TabsList>
              
              <TabsContent value="3d" className="mt-4">
                <div className="h-[600px]">
                  <RoomViewer3D />
                </div>
              </TabsContent>

              <TabsContent value="exterior" className="mt-4">
                <div className="max-h-[600px] overflow-y-auto">
                  <PhotoUpload 
                    type="exterior" 
                    maxFiles={8} 
                    onRenderComplete={handleRenderComplete}
                  />
                </div>
              </TabsContent>

              <TabsContent value="design" className="mt-4">
                <div className="max-h-[600px] overflow-y-auto">
                  <PhotoUpload 
                    type="design-ideas" 
                    maxFiles={10} 
                    onRenderComplete={handleRenderComplete}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="2d" className="mt-4">
                <div className="h-[600px] bg-surface-elevated rounded-lg border flex items-center justify-center">
                  <div className="text-center">
                    <Layers className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">2D Floor Plan</h3>
                    <p className="text-muted-foreground">Top-down view coming soon</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="render" className="mt-4">
                <div className="max-h-[600px] overflow-y-auto">
                  <RenderGallery 
                    renders={renderedImages} 
                    onDelete={handleDeleteRender}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
};
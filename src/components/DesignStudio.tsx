import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoomViewer3D } from "./RoomViewer3D";
import { 
  Scan, 
  Box, 
  Image, 
  Download,
  Settings,
  Layers,
  Palette,
  Ruler
} from "lucide-react";

export const DesignStudio = () => {
  const [activeProject, setActiveProject] = useState("living-room");
  
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
            {/* Project Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Current Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <Badge variant="secondary">Living Room</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Dimensions</span>
                  <span className="text-sm font-medium">4.5m × 6.2m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <span className="text-sm">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>

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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="3d">3D View</TabsTrigger>
                <TabsTrigger value="2d">Floor Plan</TabsTrigger>
                <TabsTrigger value="render">Renders</TabsTrigger>
              </TabsList>
              
              <TabsContent value="3d" className="mt-4">
                <div className="h-[600px]">
                  <RoomViewer3D />
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
                <div className="h-[600px] bg-surface-elevated rounded-lg border flex items-center justify-center">
                  <div className="text-center">
                    <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Rendered Images</h3>
                    <p className="text-muted-foreground">4K renders will appear here</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
};
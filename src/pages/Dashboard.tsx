import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { LiDARScanner } from "@/components/LiDARScanner";
import { RoomViewer3D } from "@/components/RoomViewer3D";
import { PhotoUpload } from "@/components/PhotoUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scan, Camera, Box, History, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("scan");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Room Scanner Dashboard</h1>
                <p className="text-muted-foreground">
                  Scan rooms, visualize layouts, and design your space
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/history")}
                  className="flex items-center gap-2"
                >
                  <History className="w-4 h-4" />
                  Scan History
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                <Scan className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 from last week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rooms Scanned</CardTitle>
                <Box className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Across 3 properties</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Photos Processed</CardTitle>
                <Camera className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">43</div>
                <p className="text-xs text-muted-foreground">AI-enhanced renders</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Pro Plan</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Unlimited scans</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scan" className="flex items-center gap-2">
                <Scan className="w-4 h-4" />
                LiDAR Scanner
              </TabsTrigger>
              <TabsTrigger value="visualize" className="flex items-center gap-2">
                <Box className="w-4 h-4" />
                3D Visualizer
              </TabsTrigger>
              <TabsTrigger value="enhance" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Photo Enhancement
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scan" className="mt-6">
              <LiDARScanner />
            </TabsContent>

            <TabsContent value="visualize" className="mt-6">
              <RoomViewer3D />
            </TabsContent>

            <TabsContent value="enhance" className="mt-6">
              <PhotoUpload type="design-ideas" maxFiles={5} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};
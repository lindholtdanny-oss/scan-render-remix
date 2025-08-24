import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiDARScanner } from "@/components/LiDARScanner";
import { ArrowLeft, Scan, History, Settings, Download, Eye } from "lucide-react";
import { toast } from "sonner";

interface ProjectData {
  id: string;
  name: string;
  type: string;
  description?: string;
  createdAt: Date;
  location?: string;
  scanCount: number;
  lastScanned?: Date;
}

interface ScanResult {
  id: string;
  name: string;
  timestamp: Date;
  pointCount: number;
  fileSize: string;
  preview?: string;
}

export const Project = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectData | null>(location.state?.project || null);
  const [activeTab, setActiveTab] = useState("scan");
  const [scanResults, setScanResults] = useState<ScanResult[]>([
    {
      id: "1",
      name: "Initial Room Scan",
      timestamp: new Date("2024-01-16T10:30:00"),
      pointCount: 125000,
      fileSize: "2.4 MB"
    },
    {
      id: "2", 
      name: "After Furniture Removal",
      timestamp: new Date("2024-01-18T14:15:00"),
      pointCount: 98000,
      fileSize: "1.9 MB"
    }
  ]);

  useEffect(() => {
    if (!project && id) {
      // In a real app, you'd fetch the project data from your backend
      // For now, redirect back to projects if no project data
      toast.error("Project not found");
      navigate("/projects");
    }
  }, [project, id, navigate]);

  if (!project) {
    return null;
  }

  const onScanComplete = (scanData: any) => {
    const newScan: ScanResult = {
      id: Date.now().toString(),
      name: `Scan ${scanResults.length + 1}`,
      timestamp: new Date(),
      pointCount: scanData.metadata.pointCount,
      fileSize: `${(scanData.points.length * 4 / 1024 / 1024).toFixed(1)} MB`
    };
    
    setScanResults([newScan, ...scanResults]);
    
    // Update project scan count
    setProject({
      ...project,
      scanCount: project.scanCount + 1,
      lastScanned: new Date()
    });
    
    toast.success("Scan saved to project!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="secondary">
                  {project.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Badge>
                {project.location && (
                  <span className="text-muted-foreground">{project.location}</span>
                )}
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>{project.scanCount} scans</div>
              <div>Created {project.createdAt.toLocaleDateString()}</div>
            </div>
          </div>
          
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <Scan className="w-4 h-4" />
              Scan Room
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Scan History
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-6">
            <div className="max-w-4xl">
              <LiDARScanner onScanComplete={onScanComplete} />
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scan History</CardTitle>
                <CardDescription>
                  All scans captured in this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scanResults.length === 0 ? (
                  <div className="text-center py-8">
                    <Scan className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Scans Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Switch to the Scan Room tab to capture your first scan
                    </p>
                    <Button onClick={() => setActiveTab("scan")}>
                      Start Scanning
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scanResults.map((scan) => (
                      <div key={scan.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h4 className="font-medium">{scan.name}</h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>{scan.timestamp.toLocaleString()}</div>
                            <div>{scan.pointCount.toLocaleString()} points • {scan.fileSize}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>
                  Configure project preferences and export options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Export Settings</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure default export formats and quality settings
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Default Format</span>
                        <Badge variant="outline">PLY</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Point Cloud Quality</span>
                        <Badge variant="outline">High</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Include Colors</span>
                        <Badge variant="outline">Yes</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Irreversible actions that affect this project
                    </p>
                    <Button variant="destructive" size="sm">
                      Delete Project
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
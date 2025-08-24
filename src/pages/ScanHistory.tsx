import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RoomLayout } from "@/components/RoomLayout";
import { 
  ArrowLeft, 
  Search, 
  Calendar, 
  MapPin, 
  Download, 
  Eye, 
  Trash2,
  Filter,
  MoreVertical
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ScanRecord {
  id: string;
  name: string;
  location: string;
  scanDate: Date;
  roomType: string;
  pointCount: number;
  roomDimensions: {
    width: number;
    height: number;
    depth: number;
  };
  furniture: Array<{
    id: string;
    type: string;
    position: number[];
    dimensions: number[];
    confidence: number;
  }>;
  roomLayout: any;
  thumbnail?: string;
}

export const ScanHistory = () => {
  const navigate = useNavigate();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [filteredScans, setFilteredScans] = useState<ScanRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app this would come from Supabase
  useEffect(() => {
    const mockScans: ScanRecord[] = [
      {
        id: "1",
        name: "Master Bedroom",
        location: "123 Oak Street, Apt 2B",
        scanDate: new Date("2024-01-15"),
        roomType: "bedroom",
        pointCount: 25430,
        roomDimensions: { width: 4.2, height: 2.8, depth: 3.6 },
        furniture: [
          {
            id: "bed_1",
            type: "bed",
            position: [1.5, 0.4, 2.0],
            dimensions: [2.0, 0.6, 1.5],
            confidence: 0.92
          },
          {
            id: "wardrobe_1",
            type: "wardrobe",
            position: [3.8, 1.0, 1.0],
            dimensions: [0.6, 2.0, 1.8],
            confidence: 0.87
          }
        ],
        roomLayout: {
          floorPlan: [
            {
              id: "wall_1",
              points: [[0, 0], [4.2, 0], [4.2, 3.6], [0, 3.6]],
              length: 15.6,
              type: "wall"
            }
          ],
          roomType: "bedroom",
          totalArea: 15.12,
          wallCount: 4,
          furnitureCount: 2
        }
      },
      {
        id: "2",
        name: "Living Room",
        location: "456 Pine Avenue",
        scanDate: new Date("2024-01-12"),
        roomType: "living_room",
        pointCount: 41250,
        roomDimensions: { width: 6.8, height: 2.9, depth: 4.5 },
        furniture: [
          {
            id: "table_1",
            type: "table",
            position: [3.4, 0.4, 2.2],
            dimensions: [1.2, 0.6, 0.8],
            confidence: 0.89
          }
        ],
        roomLayout: {
          floorPlan: [
            {
              id: "wall_1",
              points: [[0, 0], [6.8, 0], [6.8, 4.5], [0, 4.5]],
              length: 22.6,
              type: "wall"
            }
          ],
          roomType: "living_room",
          totalArea: 30.6,
          wallCount: 4,
          furnitureCount: 1
        }
      }
    ];

    setScans(mockScans);
    setFilteredScans(mockScans);
    setLoading(false);
  }, []);

  useEffect(() => {
    const filtered = scans.filter(scan => 
      scan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.roomType.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredScans(filtered);
  }, [searchTerm, scans]);

  const handleDeleteScan = async (scanId: string) => {
    try {
      // In real app, delete from Supabase
      setScans(prev => prev.filter(scan => scan.id !== scanId));
      toast.success("Scan deleted successfully");
    } catch (error) {
      toast.error("Failed to delete scan");
    }
  };

  const handleDownloadScan = (scan: ScanRecord) => {
    const dataStr = JSON.stringify(scan, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${scan.name.replace(/\s+/g, '_')}_scan.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success("Scan data downloaded");
  };

  if (selectedScan) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-6">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedScan(null)}
                className="flex items-center gap-2 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to History
              </Button>
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{selectedScan.name}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedScan.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(selectedScan.scanDate, "PPP")}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleDownloadScan(selectedScan)}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>

            <RoomLayout 
              roomLayout={selectedScan.roomLayout} 
              furniture={selectedScan.furniture}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-2 mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
                <h1 className="text-3xl font-bold mb-2">Scan History</h1>
                <p className="text-muted-foreground">
                  View and manage your previous room scans
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search scans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </div>

          {/* Scans Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-muted rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredScans.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-muted-foreground mb-4">
                  {searchTerm ? "No scans match your search" : "No scans found"}
                </div>
                <Button onClick={() => navigate("/dashboard")}>
                  Create Your First Scan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScans.map((scan) => (
                <Card key={scan.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{scan.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {scan.location}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {scan.roomType.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Points:</span>
                          <div className="font-medium">{scan.pointCount.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Area:</span>
                          <div className="font-medium">{scan.roomLayout.totalArea.toFixed(1)} m²</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Furniture:</span>
                          <div className="font-medium">{scan.furniture.length} items</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date:</span>
                          <div className="font-medium">{format(scan.scanDate, "MMM dd")}</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedScan(scan)}
                          className="flex-1 flex items-center gap-2"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadScan(scan)}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteScan(scan.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
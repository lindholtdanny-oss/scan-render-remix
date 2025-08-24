import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scan, Camera, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Capacitor } from '@capacitor/core';
import LiDAR from '@/plugins/lidar';

interface LiDARData {
  points: Float32Array;
  colors?: Uint8Array;
  metadata: {
    pointCount: number;
    scanTime: number;
    roomDimensions?: {
      width: number;
      height: number;
      depth: number;
    };
  };
}

export const LiDARScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanData, setScanData] = useState<LiDARData | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check if running on native iOS with LiDAR support
    const checkLiDARSupport = async () => {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
        try {
          // This would be implemented through a custom Capacitor plugin
          // For now, we'll simulate the check
          const hasLiDAR = await checkDeviceLiDARCapability();
          setIsSupported(hasLiDAR);
        } catch (error) {
          console.error('Error checking LiDAR support:', error);
          setIsSupported(false);
        }
      } else {
        setIsSupported(false);
      }
    };

    checkLiDARSupport();
  }, []);

  const checkDeviceLiDARCapability = async (): Promise<boolean> => {
    try {
      const result = await LiDAR.checkLiDARSupport();
      return result.supported;
    } catch (error) {
      console.error('Error checking LiDAR support:', error);
      return false;
    }
  };

  const startLiDARScan = async () => {
    if (!isSupported) {
      toast.error("LiDAR scanning is only available on supported iOS devices");
      return;
    }

    setIsScanning(true);
    toast("Starting LiDAR room scan...");

    try {
      // This would interface with ARKit through a custom Capacitor plugin
      const scanResult = await performLiDARScan();
      setScanData(scanResult);
      toast.success("Room scan completed successfully!");
      
      // Visualize the point cloud
      if (canvasRef.current && scanResult) {
        visualizePointCloud(scanResult);
      }
    } catch (error) {
      console.error('LiDAR scan failed:', error);
      toast.error("Failed to complete room scan");
    } finally {
      setIsScanning(false);
    }
  };

  const performLiDARScan = async (): Promise<LiDARData> => {
    try {
      const result = await LiDAR.startScan();
      
      // Convert points array to Float32Array
      const pointCount = result.points.length;
      const points = new Float32Array(pointCount * 3);
      const colors = new Uint8Array(pointCount * 3);
      
      // Process the point cloud data from native plugin
      result.points.forEach((point, i) => {
        const idx = i * 3;
        points[idx] = point[0];     // x
        points[idx + 1] = point[1]; // y
        points[idx + 2] = point[2]; // z
        
        // Generate colors based on height for better visualization
        const height = point[1];
        colors[idx] = Math.min(255, Math.max(0, (height + 2) * 60));     // Red based on height
        colors[idx + 1] = Math.min(255, Math.max(0, 150 - height * 30)); // Green inverse of height
        colors[idx + 2] = 100; // Blue constant
      });

      return {
        points,
        colors,
        metadata: {
          pointCount: result.pointCount,
          scanTime: result.scanTime,
          roomDimensions: result.roomDimensions
        }
      };
    } catch (error) {
      console.error('Native LiDAR scan failed:', error);
      toast.error("LiDAR scanning failed. Please try again.");
      throw error;
    }
  };

  const visualizePointCloud = (data: LiDARData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Simple 2D projection of point cloud (top-down view)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 20;

    ctx.fillStyle = '#3B82F6';
    
    for (let i = 0; i < data.points.length; i += 3) {
      const x = data.points[i] * scale + centerX;
      const z = data.points[i + 2] * scale + centerY;
      
      if (x >= 0 && x < canvas.width && z >= 0 && z < canvas.height) {
        ctx.fillRect(x, z, 2, 2);
      }
    }
  };

  const exportScanData = () => {
    if (!scanData) return;

    const dataStr = JSON.stringify({
      points: Array.from(scanData.points),
      colors: scanData.colors ? Array.from(scanData.colors) : null,
      metadata: scanData.metadata
    });
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `lidar-scan-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success("Scan data exported successfully!");
  };

  if (!Capacitor.isNativePlatform()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5" />
            LiDAR Room Scanner
          </CardTitle>
          <CardDescription>
            3D room scanning using LiDAR technology
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Mobile App Required</p>
              <p className="text-sm text-amber-700">
                LiDAR scanning is only available in the mobile app on supported iOS devices
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="w-5 h-5" />
          LiDAR Room Scanner
          {isSupported && <Badge variant="secondary">Supported</Badge>}
        </CardTitle>
        <CardDescription>
          Capture accurate 3D room measurements using your device's LiDAR sensor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isSupported ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">LiDAR Not Available</p>
              <p className="text-sm text-red-700">
                This device doesn't support LiDAR scanning. Available on iPhone 12 Pro and newer.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-3">
              <Button 
                onClick={startLiDARScan} 
                disabled={isScanning}
                className="flex-1"
              >
                {isScanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Scanning Room...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Start Room Scan
                  </>
                )}
              </Button>
              
              {scanData && (
                <Button variant="outline" onClick={exportScanData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
            </div>

            {scanData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Points:</span> {scanData.metadata.pointCount.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Scan Time:</span> {new Date(scanData.metadata.scanTime).toLocaleTimeString()}
                  </div>
                  {scanData.metadata.roomDimensions && (
                    <>
                      <div>
                        <span className="font-medium">Width:</span> {scanData.metadata.roomDimensions.width.toFixed(1)}m
                      </div>
                      <div>
                        <span className="font-medium">Height:</span> {scanData.metadata.roomDimensions.height.toFixed(1)}m
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Point Cloud Visualization (Top View)</h4>
                  <canvas 
                    ref={canvasRef}
                    width={400}
                    height={300}
                    className="border border-border rounded-lg bg-background"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scan, Camera, Download, AlertCircle, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { Capacitor } from '@capacitor/core';
import LiDAR from '@/plugins/lidar';
import { RoomLayout } from './RoomLayout';

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
  walls?: number[][][];
  furniture?: {
    id: string;
    type: string;
    position: number[];
    dimensions: number[];
    confidence: number;
  }[];
  roomLayout?: {
    floorPlan: {
      id: string;
      points: number[][];
      length: number;
      type: string;
    }[];
    roomType: string;
    totalArea: number;
    wallCount: number;
    furnitureCount: number;
  };
}

interface LiDARScannerProps {
  onScanComplete?: (scanData: LiDARData) => void;
}

export const LiDARScanner = ({ onScanComplete }: LiDARScannerProps = {}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanData, setScanData] = useState<LiDARData | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [realTimeData, setRealTimeData] = useState<Partial<LiDARData> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveCanvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);

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

    // Set up real-time update listener
    const handleRealTimeUpdate = (event: any) => {
      const data = event.detail;
      if (data && data.status === 'scanning') {
        // Process real-time data
        const scanData = {
          points: new Float32Array(data.points.flat()),
          colors: new Uint8Array(data.points.length * 3).fill(100),
          metadata: {
            pointCount: data.pointCount,
            scanTime: data.scanTime,
            roomDimensions: data.roomDimensions
          },
          walls: data.walls,
          furniture: data.furniture,
          roomLayout: data.roomLayout
        };

        setRealTimeData(scanData);

        // Update live visualization
        if (liveCanvasRef.current) {
          visualizeLiveDetection(scanData);
        }
      }
    };

    // Add listener for real-time updates
    if (Capacitor.isNativePlatform()) {
      LiDAR.addListener('realTimeUpdate', handleRealTimeUpdate);
    }

    return () => {
      // Clean up listener
      if (Capacitor.isNativePlatform()) {
        LiDAR.removeAllListeners();
      }
      stopCameraPreview();
    };
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
    setRealTimeData(null);
    toast("Starting LiDAR room scan...");

    try {
      // Start camera preview
      await startCameraPreview();
      
      // Start real-time scanning with callbacks
      await performRealTimeLiDARScan();
      
    } catch (error) {
      console.error('LiDAR scan failed:', error);
      toast.error("Failed to complete room scan");
      setIsScanning(false);
    }
  };

  const stopLiDARScan = async () => {
    try {
      const result = await LiDAR.stopScan();
      if (result.status === 'success' && realTimeData) {
        const finalScanData = realTimeData as LiDARData;
        setScanData(finalScanData);
        toast.success("Room scan completed successfully!");
        
        // Visualize the final point cloud
        if (canvasRef.current && finalScanData) {
          visualizePointCloud(finalScanData);
        }
        
        // Notify parent component
        if (onScanComplete) {
          onScanComplete(finalScanData);
        }
      }
    } catch (error) {
      console.error('Failed to stop scan:', error);
      toast.error("Failed to complete scan");
    } finally {
      setIsScanning(false);
      stopCameraPreview();
    }
  };

  const startCameraPreview = async () => {
    if (!cameraRef.current) {
      console.error('Camera ref not available');
      return;
    }
    
    try {
      console.log('Requesting camera access...');
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera stream obtained:', stream);
      
      cameraRef.current.srcObject = stream;
      
      // Ensure video plays
      cameraRef.current.onloadedmetadata = () => {
        console.log('Video metadata loaded, starting playback');
        cameraRef.current?.play().catch(err => {
          console.error('Failed to play video:', err);
        });
      };
      
      await cameraRef.current.play();
      console.log('Camera preview started successfully');
      toast.success("Camera preview started");
      
    } catch (error) {
      console.error('Failed to start camera:', error);
      toast.error("Failed to access camera. Please check permissions.");
    }
  };

  const stopCameraPreview = () => {
    if (cameraRef.current?.srcObject) {
      const stream = cameraRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      cameraRef.current.srcObject = null;
    }
  };

  const performRealTimeLiDARScan = async () => {
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

      const scanData = {
        points,
        colors,
        metadata: {
          pointCount: result.pointCount,
          scanTime: result.scanTime,
          roomDimensions: result.roomDimensions
        },
        walls: result.walls,
        furniture: result.furniture,
        roomLayout: result.roomLayout
      };
      
      setRealTimeData(scanData);
      
      // Update live visualization
      if (liveCanvasRef.current) {
        visualizeLiveDetection(scanData);
      }
      
    } catch (error) {
      console.error('Native LiDAR scan failed:', error);
      toast.error("LiDAR scanning failed. Please try again.");
      throw error;
    }
  };

  const visualizeLiveDetection = (data: LiDARData) => {
    const canvas = liveCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous overlays
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw detected walls in green
    if (data.walls) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      data.walls.forEach(wall => {
        if (wall.length >= 2) {
          ctx.beginPath();
          const startPoint = projectToScreen(wall[0]);
          ctx.moveTo(startPoint.x, startPoint.y);
          
          for (let i = 1; i < wall.length; i++) {
            const point = projectToScreen(wall[i]);
            ctx.lineTo(point.x, point.y);
          }
          ctx.stroke();
        }
      });
    }

    // Draw detected furniture in blue
    if (data.furniture) {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      
      data.furniture.forEach(item => {
        const screenPos = projectToScreen(item.position);
        const screenDims = {
          width: item.dimensions[0] * 50,
          height: item.dimensions[2] * 50
        };
        
        // Draw furniture bounding box
        ctx.fillRect(
          screenPos.x - screenDims.width / 2,
          screenPos.y - screenDims.height / 2,
          screenDims.width,
          screenDims.height
        );
        ctx.strokeRect(
          screenPos.x - screenDims.width / 2,
          screenPos.y - screenDims.height / 2,
          screenDims.width,
          screenDims.height
        );
        
        // Draw furniture label
        ctx.fillStyle = '#1f2937';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          item.type.toUpperCase(),
          screenPos.x,
          screenPos.y - screenDims.height / 2 - 5
        );
        ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
      });
    }
  };

  const projectToScreen = (point: number[]) => {
    // Simple projection from 3D to screen coordinates
    const canvas = liveCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 50;
    
    return {
      x: point[0] * scale + centerX,
      y: point[2] * scale + centerY
    };
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
              {!isScanning ? (
                <Button 
                  onClick={startLiDARScan} 
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Start Room Scan
                </Button>
              ) : (
                <Button 
                  onClick={stopLiDARScan} 
                  variant="destructive"
                  className="flex-1"
                >
                  <StopCircle className="w-4 h-4 mr-2" />
                  Stop Scanning
                </Button>
              )}
              
              {scanData && (
                <Button variant="outline" onClick={exportScanData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
            </div>

            {/* Live Camera View During Scanning */}
            {isScanning && (
              <div className="space-y-4">
                <h4 className="font-medium">Live Room Scanning</h4>
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={cameraRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                    style={{ minHeight: '200px' }}
                  />
                  <canvas
                    ref={liveCanvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    width={400}
                    height={256}
                  />
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      Scanning...
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    <div className="text-green-400">■ Walls</div>
                    <div className="text-blue-400">■ Furniture</div>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {cameraRef.current?.srcObject ? 'Camera Active' : 'Camera Loading...'}
                  </div>
                </div>
                
                {/* Live Floor Plan Preview */}
                {realTimeData?.roomLayout && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">Live Floor Plan</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                      <div>
                        <span className="text-muted-foreground">Walls:</span> {realTimeData.roomLayout.wallCount}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Furniture:</span> {realTimeData.roomLayout.furnitureCount}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Area:</span> {realTimeData.roomLayout.totalArea.toFixed(1)}m²
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

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
                
                {scanData.roomLayout && scanData.furniture && (
                  <RoomLayout 
                    roomLayout={scanData.roomLayout} 
                    furniture={scanData.furniture}
                  />
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
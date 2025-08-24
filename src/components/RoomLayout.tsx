import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Bed, Sofa, Table, Archive } from "lucide-react";

interface RoomLayoutProps {
  roomLayout: {
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
  furniture: {
    id: string;
    type: string;
    position: number[];
    dimensions: number[];
    confidence: number;
  }[];
}

const getFurnitureIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'bed':
      return <Bed className="w-4 h-4" />;
    case 'table':
      return <Table className="w-4 h-4" />;
    case 'chair':
      return <Sofa className="w-4 h-4" />;
    case 'wardrobe':
      return <Archive className="w-4 h-4" />;
    default:
      return <Home className="w-4 h-4" />;
  }
};

const getFurnitureColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'bed':
      return '#10B981'; // emerald
    case 'table':
      return '#F59E0B'; // amber
    case 'chair':
      return '#8B5CF6'; // violet
    case 'wardrobe':
      return '#EF4444'; // red
    default:
      return '#6B7280'; // gray
  }
};

export const RoomLayout = ({ roomLayout, furniture }: RoomLayoutProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawRoomLayout();
  }, [roomLayout, furniture]);

  const drawRoomLayout = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up coordinate system
    const padding = 40;
    const drawWidth = canvas.width - 2 * padding;
    const drawHeight = canvas.height - 2 * padding;
    
    // Find bounds of the room
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    
    roomLayout.floorPlan.forEach(wall => {
      wall.points.forEach(point => {
        minX = Math.min(minX, point[0]);
        maxX = Math.max(maxX, point[0]);
        minZ = Math.min(minZ, point[1]);
        maxZ = Math.max(maxZ, point[1]);
      });
    });
    
    const roomWidth = maxX - minX;
    const roomHeight = maxZ - minZ;
    const scale = Math.min(drawWidth / roomWidth, drawHeight / roomHeight) * 0.8;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Transform coordinates
    const transform = (x: number, z: number) => ({
      x: centerX + (x - (minX + maxX) / 2) * scale,
      y: centerY + (z - (minZ + maxZ) / 2) * scale
    });

    // Draw room outline/walls
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    roomLayout.floorPlan.forEach((wall, index) => {
      if (wall.points.length < 2) return;
      
      const firstPoint = transform(wall.points[0][0], wall.points[0][1]);
      ctx.moveTo(firstPoint.x, firstPoint.y);
      
      for (let i = 1; i < wall.points.length; i++) {
        const point = transform(wall.points[i][0], wall.points[i][1]);
        ctx.lineTo(point.x, point.y);
      }
    });
    
    // Close the room shape if needed
    if (roomLayout.floorPlan.length > 0) {
      const firstWall = roomLayout.floorPlan[0];
      const lastWall = roomLayout.floorPlan[roomLayout.floorPlan.length - 1];
      if (firstWall.points.length > 0 && lastWall.points.length > 0) {
        const firstPoint = transform(firstWall.points[0][0], firstWall.points[0][1]);
        const lastPoint = transform(
          lastWall.points[lastWall.points.length - 1][0], 
          lastWall.points[lastWall.points.length - 1][1]
        );
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(firstPoint.x, firstPoint.y);
      }
    }
    
    ctx.stroke();

    // Fill room area
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.fill();

    // Draw furniture
    furniture.forEach((item, index) => {
      const pos = transform(item.position[0], item.position[2]); // x, z coordinates for top-down view
      const width = item.dimensions[0] * scale;
      const height = item.dimensions[2] * scale;
      
      // Draw furniture rectangle
      ctx.fillStyle = getFurnitureColor(item.type);
      ctx.fillRect(pos.x - width/2, pos.y - height/2, width, height);
      
      // Draw furniture border
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 1;
      ctx.strokeRect(pos.x - width/2, pos.y - height/2, width, height);
      
      // Draw furniture label
      ctx.fillStyle = '#1F2937';
      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.type, pos.x, pos.y + 4);
    });

    // Draw grid for reference
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.2)';
    ctx.lineWidth = 1;
    const gridSize = scale * 0.5; // 0.5m grid
    
    for (let x = padding; x < canvas.width - padding; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();
    }
    
    for (let y = padding; y < canvas.height - padding; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5" />
          Room Layout
          <Badge variant="secondary">{roomLayout.roomType}</Badge>
        </CardTitle>
        <CardDescription>
          Detected layout with {roomLayout.wallCount} walls and {roomLayout.furnitureCount} furniture items
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Room Type:</span> {roomLayout.roomType}
          </div>
          <div>
            <span className="font-medium">Total Area:</span> {roomLayout.totalArea.toFixed(1)} m²
          </div>
          <div>
            <span className="font-medium">Walls:</span> {roomLayout.wallCount}
          </div>
          <div>
            <span className="font-medium">Furniture:</span> {roomLayout.furnitureCount}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Floor Plan</h4>
          <canvas 
            ref={canvasRef}
            width={600}
            height={400}
            className="border border-border rounded-lg bg-background w-full"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Top-down view • Grid lines represent 0.5m intervals
          </p>
        </div>

        {furniture.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Detected Furniture</h4>
            <div className="grid grid-cols-1 gap-2">
              {furniture.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div style={{ color: getFurnitureColor(item.type) }}>
                    {getFurnitureIcon(item.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium capitalize">{item.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.dimensions[0].toFixed(1)}m × {item.dimensions[2].toFixed(1)}m
                    </div>
                  </div>
                  <Badge variant="outline">
                    {Math.round(item.confidence * 100)}% confidence
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
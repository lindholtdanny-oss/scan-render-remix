import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Box, Plane } from "@react-three/drei";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Move3D, RotateCcw, ZoomIn, ZoomOut, Square, Circle } from "lucide-react";

const Room = () => {
  return (
    <group>
      {/* Floor */}
      <Plane 
        args={[10, 10]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color="#f5f5f5" />
      </Plane>
      
      {/* Walls */}
      <Plane args={[10, 3]} position={[0, 1.5, -5]}>
        <meshStandardMaterial color="#ffffff" />
      </Plane>
      <Plane args={[10, 3]} position={[-5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <meshStandardMaterial color="#ffffff" />
      </Plane>
      
      {/* Sample Furniture */}
      <Box args={[2, 0.8, 1]} position={[-2, 0.4, -2]}>
        <meshStandardMaterial color="#8B5A3C" />
      </Box>
      
      <Box args={[0.8, 1.6, 0.8]} position={[2, 0.8, -3]}>
        <meshStandardMaterial color="#4A5568" />
      </Box>
      
      <Box args={[3, 0.1, 1.5]} position={[0, 0.5, 2]}>
        <meshStandardMaterial color="#2D3748" />
      </Box>
    </group>
  );
};

export const RoomViewer3D = () => {
  const [selectedTool, setSelectedTool] = useState<string>("select");
  
  return (
    <div className="w-full h-full relative bg-surface rounded-lg overflow-hidden border">
      {/* 3D Canvas */}
      <Canvas shadows className="w-full h-full">
        <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={60} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={3}
          maxDistance={20}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.2} />
        
        <Room />
      </Canvas>
      
      {/* Toolbar Overlay */}
      <div className="absolute top-4 left-4 bg-surface-elevated/95 backdrop-blur-sm rounded-lg p-2 shadow-md border">
        <div className="flex flex-col gap-2">
          <Button 
            variant={selectedTool === "select" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedTool("select")}
          >
            <Move3D className="w-4 h-4" />
          </Button>
          <Button 
            variant={selectedTool === "wall" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedTool("wall")}
          >
            <Square className="w-4 h-4" />
          </Button>
          <Button 
            variant={selectedTool === "furniture" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedTool("furniture")}
          >
            <Circle className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* View Controls */}
      <div className="absolute top-4 right-4 bg-surface-elevated/95 backdrop-blur-sm rounded-lg p-2 shadow-md border">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="absolute bottom-4 left-4 right-4 bg-surface-elevated/95 backdrop-blur-sm rounded-lg p-3 shadow-md border">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span>3D View Active</span>
            </div>
            <div className="text-muted-foreground">
              Objects: 6 | Walls: 2
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Tool:</span>
            <span className="font-medium capitalize">{selectedTool}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
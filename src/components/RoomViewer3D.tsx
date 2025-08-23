import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Box, Plane } from "@react-three/drei";
import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Move3D, RotateCcw, ZoomIn, ZoomOut, Trash2, RotateCw } from "lucide-react";
import { ObjectLibrary, ObjectDefinition } from "./ObjectLibrary";
import * as THREE from "three";

interface PlacedObject extends ObjectDefinition {
  sceneId: string;
  position: [number, number, number];
  rotation?: [number, number, number];
}

interface RoomProps {
  objects: PlacedObject[];
  selectedObjectId: string | null;
  onObjectClick: (objectId: string) => void;
}

const Room = ({ objects, selectedObjectId, onObjectClick }: RoomProps) => {
  return (
    <group>
      {/* Floor */}
      <Plane 
        args={[20, 20]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#f5f5f5" />
      </Plane>
      
      {/* Grid Helper for Reference */}
      <gridHelper args={[20, 20, "#cccccc", "#eeeeee"]} position={[0, 0.01, 0]} />
      
      {/* Room Objects */}
      {objects.map((obj) => {
        const isSelected = obj.sceneId === selectedObjectId;
        const [width, height, depth] = obj.dimensions;
        const [x, y, z] = obj.position;
        
        return (
          <Box
            key={obj.sceneId}
            args={[width, height, depth]}
            position={[x, y + height/2, z]}
            rotation={obj.rotation || [0, 0, 0]}
            castShadow
            receiveShadow
            onClick={(e) => {
              e.stopPropagation();
              onObjectClick(obj.sceneId);
            }}
          >
            <meshStandardMaterial 
              color={isSelected ? "#3b82f6" : obj.color}
              transparent={isSelected}
              opacity={isSelected ? 0.8 : 1}
            />
            {isSelected && (
              <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
                <lineBasicMaterial color="#ffffff" linewidth={2} />
              </lineSegments>
            )}
          </Box>
        );
      })}
    </group>
  );
};

export const RoomViewer3D = () => {
  const [selectedTool, setSelectedTool] = useState<string>("select");
  const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(true);

  const handleObjectSelect = useCallback((objectDef: ObjectDefinition) => {
    if (selectedTool === "select") {
      const newObject: PlacedObject = {
        ...objectDef,
        sceneId: `${objectDef.id}-${Date.now()}`,
        position: [
          Math.random() * 6 - 3, // Random X between -3 and 3
          0,
          Math.random() * 6 - 3  // Random Z between -3 and 3
        ],
      };
      setPlacedObjects(prev => [...prev, newObject]);
    }
  }, [selectedTool]);

  const handleObjectClick = useCallback((objectId: string) => {
    setSelectedObjectId(prev => prev === objectId ? null : objectId);
  }, []);

  const deleteSelectedObject = useCallback(() => {
    if (selectedObjectId) {
      setPlacedObjects(prev => prev.filter(obj => obj.sceneId !== selectedObjectId));
      setSelectedObjectId(null);
    }
  }, [selectedObjectId]);

  const rotateSelectedObject = useCallback(() => {
    if (selectedObjectId) {
      setPlacedObjects(prev => prev.map(obj => 
        obj.sceneId === selectedObjectId 
          ? { ...obj, rotation: [0, (obj.rotation?.[1] || 0) + Math.PI / 2, 0] as [number, number, number] }
          : obj
      ));
    }
  }, [selectedObjectId]);

  return (
    <div className="w-full h-full flex bg-surface rounded-lg overflow-hidden border">
      {/* Object Library Sidebar */}
      {showLibrary && (
        <ObjectLibrary onObjectSelect={handleObjectSelect} />
      )}
      
      <div className="flex-1 relative">
        {/* 3D Canvas */}
        <Canvas shadows className="w-full h-full">
          <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={60} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={5}
            maxDistance={30}
          />
          
          {/* Enhanced Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[15, 15, 10]} 
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <pointLight position={[-10, 10, -10]} intensity={0.3} />
          <pointLight position={[10, 5, 10]} intensity={0.2} />
          
          <Room 
            objects={placedObjects}
            selectedObjectId={selectedObjectId}
            onObjectClick={handleObjectClick}
          />
        </Canvas>
        
        {/* Toggle Library Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 bg-surface-elevated/95 backdrop-blur-sm border"
          onClick={() => setShowLibrary(!showLibrary)}
        >
          {showLibrary ? "Hide Library" : "Show Library"}
        </Button>
        
        {/* Tool Controls */}
        <div className="absolute top-4 right-4 bg-surface-elevated/95 backdrop-blur-sm rounded-lg p-2 shadow-md border">
          <div className="flex gap-2">
            <Button 
              variant={selectedTool === "select" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedTool("select")}
              title="Add Objects"
            >
              <Move3D className="w-4 h-4" />
            </Button>
            {selectedObjectId && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={rotateSelectedObject}
                  title="Rotate Object"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={deleteSelectedObject}
                  title="Delete Object"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* View Controls */}
        <div className="absolute bottom-4 right-4 bg-surface-elevated/95 backdrop-blur-sm rounded-lg p-2 shadow-md border">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" title="Reset View">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="absolute bottom-4 left-4 bg-surface-elevated/95 backdrop-blur-sm rounded-lg p-3 shadow-md border max-w-md">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span>3D Design Mode</span>
              </div>
              <div className="text-muted-foreground">
                Objects: {placedObjects.length}
              </div>
            </div>
            {selectedObjectId && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Selected:</span>
                <span className="font-medium">
                  {placedObjects.find(obj => obj.sceneId === selectedObjectId)?.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
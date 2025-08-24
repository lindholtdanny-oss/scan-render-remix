import { registerPlugin } from '@capacitor/core';

export interface LiDARPlugin {
  checkLiDARSupport(): Promise<{
    supported: boolean;
    device: string;
  }>;
  
  startScan(): Promise<{
    points: number[][];
    pointCount: number;
    scanTime: number;
    roomDimensions: {
      width: number;
      height: number;
      depth: number;
    };
    walls: number[][][];
    furniture: {
      id: string;
      type: string;
      position: number[];
      dimensions: number[];
      confidence: number;
    }[];
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
    status: string;
  }>;
  
  stopScan(): Promise<{
    points: number[][];
    pointCount: number;
    scanTime: number;
    roomDimensions: {
      width: number;
      height: number;
      depth: number;
    };
    walls: number[][][];
    furniture: {
      id: string;
      type: string;
      position: number[];
      dimensions: number[];
      confidence: number;
    }[];
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
    status: string;
  }>;

  addListener(eventName: 'realTimeUpdate', listenerFunc: (event: any) => void): Promise<{ remove: () => void }>;
  removeAllListeners(): Promise<void>;
}

const LiDAR = registerPlugin<LiDARPlugin>('LiDARPlugin');

export default LiDAR;
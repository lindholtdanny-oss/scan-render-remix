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
    status: string;
  }>;
  
  stopScan(): Promise<{
    status: string;
  }>;
}

const LiDAR = registerPlugin<LiDARPlugin>('LiDARPlugin');

export default LiDAR;
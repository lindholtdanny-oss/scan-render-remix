import Foundation
import Capacitor
import ARKit
import RealityKit

@objc(LiDARPlugin)
public class LiDARPlugin: CAPPlugin {
    private var arView: ARView?
    private var isScanning = false
    private var pointCloud: [SIMD3<Float>] = []
    
    @objc func checkLiDARSupport(_ call: CAPPluginCall) {
        let isSupported = ARWorldTrackingConfiguration.supportsSceneReconstruction(.mesh)
        call.resolve([
            "supported": isSupported,
            "device": UIDevice.current.model
        ])
    }
    
    @objc func startScan(_ call: CAPPluginCall) {
        guard ARWorldTrackingConfiguration.supportsSceneReconstruction(.mesh) else {
            call.reject("LiDAR not supported on this device")
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            self?.setupARSession(call)
        }
    }
    
    private func setupARSession(_ call: CAPPluginCall) {
        let configuration = ARWorldTrackingConfiguration()
        configuration.sceneReconstruction = .mesh
        configuration.environmentTexturing = .automatic
        
        if let arView = self.arView {
            arView.session.run(configuration, options: [.resetTracking, .removeExistingAnchors])
            self.isScanning = true
            
            // Start scanning for 5 seconds
            DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) { [weak self] in
                self?.finishScan(call)
            }
            
            call.resolve([
                "status": "scanning_started",
                "message": "LiDAR scanning initiated"
            ])
        }
    }
    
    private func finishScan(_ call: CAPPluginCall) {
        guard let arView = self.arView else {
            call.reject("AR session not available")
            return
        }
        
        self.isScanning = false
        var points: [[Float]] = []
        var roomDimensions: [String: Float] = [:]
        
        // Extract mesh data from AR session
        arView.session.currentFrame?.anchors.forEach { anchor in
            if let meshAnchor = anchor as? ARMeshAnchor {
                let vertices = meshAnchor.geometry.vertices
                let vertexCount = vertices.count
                
                for i in 0..<vertexCount {
                    let vertex = vertices[i]
                    points.append([vertex.x, vertex.y, vertex.z])
                }
                
                // Calculate basic room dimensions
                let bounds = meshAnchor.geometry.extent
                roomDimensions = [
                    "width": bounds.x,
                    "height": bounds.y,
                    "depth": bounds.z
                ]
            }
        }
        
        call.resolve([
            "points": points,
            "pointCount": points.count,
            "scanTime": Date().timeIntervalSince1970 * 1000,
            "roomDimensions": roomDimensions,
            "status": "completed"
        ])
    }
    
    @objc func stopScan(_ call: CAPPluginCall) {
        self.isScanning = false
        self.arView?.session.pause()
        call.resolve(["status": "stopped"])
    }
}
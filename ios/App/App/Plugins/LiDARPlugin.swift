import Foundation
import Capacitor
import ARKit
import RealityKit
import Vision

@objc(LiDARPlugin)
public class LiDARPlugin: CAPPlugin {
    private var arView: ARView?
    private var isScanning = false
    private var pointCloud: [SIMD3<Float>] = []
    private var detectedWalls: [[SIMD3<Float>]] = []
    private var detectedFurniture: [FurnitureObject] = []
    private var currentCall: CAPPluginCall?
    private var scanTimer: Timer?
    
    struct FurnitureObject {
        let id: String
        let type: String
        let position: SIMD3<Float>
        let dimensions: SIMD3<Float>
        let confidence: Float
    }
    
    struct WallSegment {
        let points: [SIMD3<Float>]
        let normal: SIMD3<Float>
        let length: Float
    }
    
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
        
        self.currentCall = call
        DispatchQueue.main.async { [weak self] in
            self?.setupARSession()
        }
    }
    
    private func setupARSession() {
        let configuration = ARWorldTrackingConfiguration()
        configuration.sceneReconstruction = .mesh
        configuration.environmentTexturing = .automatic
        
        // Create ARView if it doesn't exist
        if self.arView == nil {
            self.arView = ARView()
        }
        
        if let arView = self.arView {
            arView.session.run(configuration, options: [.resetTracking, .removeExistingAnchors])
            self.isScanning = true
            
            // Start real-time scanning updates
            startRealTimeUpdates()
            
            // Acknowledge scan start
            currentCall?.resolve([
                "status": "scanning_started", 
                "message": "Real-time LiDAR scanning initiated"
            ])
        }
    }
    
    private func startRealTimeUpdates() {
        // Send updates every 0.5 seconds
        scanTimer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { [weak self] _ in
            self?.sendRealTimeUpdate()
        }
    }
    
    private func sendRealTimeUpdate() {
        guard let arView = self.arView, isScanning else { return }
        
        var points: [[Float]] = []
        var roomDimensions: [String: Float] = [:]
        var walls: [[[Float]]] = []
        var furniture: [[String: Any]] = []
        var roomLayout: [String: Any] = [:]
        
        // Extract current mesh data
        arView.session.currentFrame?.anchors.forEach { anchor in
            if let meshAnchor = anchor as? ARMeshAnchor {
                let vertices = meshAnchor.geometry.vertices
                let vertexCount = min(vertices.count, 1000) // Limit for performance
                
                // Extract limited point cloud for real-time updates
                for i in stride(from: 0, to: vertexCount, by: 5) { // Sample every 5th point
                    let vertex = vertices[i]
                    points.append([vertex.x, vertex.y, vertex.z])
                }
                
                // Calculate current room dimensions
                let bounds = meshAnchor.geometry.extent
                roomDimensions = [
                    "width": bounds.x,
                    "height": bounds.y,
                    "depth": bounds.z
                ]
                
                // Analyze current mesh state
                let analysisResult = analyzeMeshForLayout(meshAnchor: meshAnchor)
                walls = analysisResult.walls
                furniture = analysisResult.furniture
                roomLayout = analysisResult.layout
            }
        }
        
        // Send real-time update to JavaScript
        notifyListeners("realTimeUpdate", data: [
            "points": points,
            "pointCount": points.count,
            "scanTime": Date().timeIntervalSince1970 * 1000,
            "roomDimensions": roomDimensions,
            "walls": walls,
            "furniture": furniture,
            "roomLayout": roomLayout,
            "status": "scanning"
        ])
    }
    
    private func finishScan(_ call: CAPPluginCall) {
        guard let arView = self.arView else {
            call.reject("AR session not available")
            return
        }
        
        self.isScanning = false
        var points: [[Float]] = []
        var roomDimensions: [String: Float] = [:]
        var walls: [[[Float]]] = []
        var furniture: [[String: Any]] = []
        var roomLayout: [String: Any] = [:]
        
        // Extract mesh data from AR session
        arView.session.currentFrame?.anchors.forEach { anchor in
            if let meshAnchor = anchor as? ARMeshAnchor {
                let vertices = meshAnchor.geometry.vertices
                let vertexCount = vertices.count
                
                // Extract point cloud
                for i in 0..<vertexCount {
                    let vertex = vertices[i]
                    points.append([vertex.x, vertex.y, vertex.z])
                }
                
                // Calculate room dimensions
                let bounds = meshAnchor.geometry.extent
                roomDimensions = [
                    "width": bounds.x,
                    "height": bounds.y,
                    "depth": bounds.z
                ]
                
                // Analyze mesh for walls and furniture
                let analysisResult = analyzeMeshForLayout(meshAnchor: meshAnchor)
                walls = analysisResult.walls
                furniture = analysisResult.furniture
                roomLayout = analysisResult.layout
            }
        }
        
        call.resolve([
            "points": points,
            "pointCount": points.count,
            "scanTime": Date().timeIntervalSince1970 * 1000,
            "roomDimensions": roomDimensions,
            "walls": walls,
            "furniture": furniture,
            "roomLayout": roomLayout,
            "status": "completed"
        ])
    }
    
    private func analyzeMeshForLayout(meshAnchor: ARMeshAnchor) -> (walls: [[[Float]]], furniture: [[String: Any]], layout: [String: Any]) {
        let vertices = meshAnchor.geometry.vertices
        let faces = meshAnchor.geometry.faces
        
        // Detect walls using geometric analysis
        let wallSegments = detectWalls(vertices: vertices, faces: faces)
        let walls = wallSegments.map { wall in
            wall.map { point in [point.x, point.y, point.z] }
        }
        
        // Detect furniture using volume analysis
        let furnitureObjects = detectFurniture(vertices: vertices, faces: faces)
        let furniture = furnitureObjects.map { obj in
            [
                "id": obj.id,
                "type": obj.type,
                "position": [obj.position.x, obj.position.y, obj.position.z],
                "dimensions": [obj.dimensions.x, obj.dimensions.y, obj.dimensions.z],
                "confidence": obj.confidence
            ] as [String: Any]
        }
        
        // Generate room layout
        let layout = generateRoomLayout(walls: wallSegments, furniture: furnitureObjects, bounds: meshAnchor.geometry.extent)
        
        return (walls: walls, furniture: furniture, layout: layout)
    }
    
    private func detectWalls(vertices: ARGeometrySource, faces: ARGeometrySource) -> [[SIMD3<Float>]] {
        var wallSegments: [[SIMD3<Float>]] = []
        
        // Simple wall detection: find vertical planar surfaces
        let vertexData = vertices.buffer.contents().assumingMemoryBound(to: Float.self)
        let vertexCount = vertices.count
        
        // Group vertices by height and detect vertical planes
        var candidateWalls: [SIMD3<Float>] = []
        
        for i in stride(from: 0, to: vertexCount * 3, by: 3) {
            let point = SIMD3<Float>(vertexData[i], vertexData[i + 1], vertexData[i + 2])
            
            // Consider points that are likely wall points (not floor or ceiling)
            if point.y > 0.1 && point.y < 2.5 {
                candidateWalls.append(point)
            }
        }
        
        // Cluster wall points into segments (simplified approach)
        let wallClusters = clusterWallPoints(points: candidateWalls)
        wallSegments = wallClusters
        
        return wallSegments
    }
    
    private func detectFurniture(vertices: ARGeometrySource, faces: ARGeometrySource) -> [FurnitureObject] {
        var furnitureObjects: [FurnitureObject] = []
        
        let vertexData = vertices.buffer.contents().assumingMemoryBound(to: Float.self)
        let vertexCount = vertices.count
        
        // Detect furniture by identifying elevated horizontal surfaces and volumes
        var candidateFurniture: [SIMD3<Float>] = []
        
        for i in stride(from: 0, to: vertexCount * 3, by: 3) {
            let point = SIMD3<Float>(vertexData[i], vertexData[i + 1], vertexData[i + 2])
            
            // Look for furniture-height surfaces (0.3m to 1.2m)
            if point.y > 0.3 && point.y < 1.2 {
                candidateFurniture.append(point)
            }
        }
        
        // Cluster furniture points and classify
        let furnitureClusters = clusterFurniturePoints(points: candidateFurniture)
        
        for (index, cluster) in furnitureClusters.enumerated() {
            let bounds = calculateBounds(points: cluster)
            let center = calculateCenter(points: cluster)
            let furnitureType = classifyFurniture(bounds: bounds, center: center)
            
            let furniture = FurnitureObject(
                id: "furniture_\(index)",
                type: furnitureType,
                position: center,
                dimensions: bounds,
                confidence: 0.75
            )
            
            furnitureObjects.append(furniture)
        }
        
        return furnitureObjects
    }
    
    private func clusterWallPoints(points: [SIMD3<Float>]) -> [[SIMD3<Float>]] {
        // Simplified clustering: group nearby points
        var clusters: [[SIMD3<Float>]] = []
        var processedIndices: Set<Int> = []
        
        for i in 0..<points.count {
            if processedIndices.contains(i) { continue }
            
            var cluster: [SIMD3<Float>] = [points[i]]
            processedIndices.insert(i)
            
            for j in (i + 1)..<points.count {
                if processedIndices.contains(j) { continue }
                
                let distance = simd_distance(points[i], points[j])
                if distance < 0.5 { // 50cm threshold
                    cluster.append(points[j])
                    processedIndices.insert(j)
                }
            }
            
            if cluster.count > 10 { // Minimum points for a wall segment
                clusters.append(cluster)
            }
        }
        
        return clusters
    }
    
    private func clusterFurniturePoints(points: [SIMD3<Float>]) -> [[SIMD3<Float>]] {
        // Similar clustering for furniture
        var clusters: [[SIMD3<Float>]] = []
        var processedIndices: Set<Int> = []
        
        for i in 0..<points.count {
            if processedIndices.contains(i) { continue }
            
            var cluster: [SIMD3<Float>] = [points[i]]
            processedIndices.insert(i)
            
            for j in (i + 1)..<points.count {
                if processedIndices.contains(j) { continue }
                
                let distance = simd_distance(points[i], points[j])
                if distance < 0.3 { // 30cm threshold for furniture
                    cluster.append(points[j])
                    processedIndices.insert(j)
                }
            }
            
            if cluster.count > 5 { // Minimum points for furniture
                clusters.append(cluster)
            }
        }
        
        return clusters
    }
    
    private func calculateBounds(points: [SIMD3<Float>]) -> SIMD3<Float> {
        guard !points.isEmpty else { return SIMD3<Float>(0, 0, 0) }
        
        let minX = points.min { $0.x < $1.x }?.x ?? 0
        let maxX = points.max { $0.x < $1.x }?.x ?? 0
        let minY = points.min { $0.y < $1.y }?.y ?? 0
        let maxY = points.max { $0.y < $1.y }?.y ?? 0
        let minZ = points.min { $0.z < $1.z }?.z ?? 0
        let maxZ = points.max { $0.z < $1.z }?.z ?? 0
        
        return SIMD3<Float>(maxX - minX, maxY - minY, maxZ - minZ)
    }
    
    private func calculateCenter(points: [SIMD3<Float>]) -> SIMD3<Float> {
        guard !points.isEmpty else { return SIMD3<Float>(0, 0, 0) }
        
        let sum = points.reduce(SIMD3<Float>(0, 0, 0)) { $0 + $1 }
        return sum / Float(points.count)
    }
    
    private func classifyFurniture(bounds: SIMD3<Float>, center: SIMD3<Float>) -> String {
        let volume = bounds.x * bounds.y * bounds.z
        let height = bounds.y
        let maxDimension = max(bounds.x, bounds.z)
        
        // Simple classification based on dimensions and height
        if height < 0.5 && volume > 0.1 {
            return "table"
        } else if height > 0.8 && height < 1.5 && maxDimension > 1.5 {
            return "bed"
        } else if height > 1.5 && volume > 0.5 {
            return "wardrobe"
        } else if height < 0.6 && maxDimension < 0.8 {
            return "chair"
        } else {
            return "unknown"
        }
    }
    
    private func generateRoomLayout(walls: [WallSegment], furniture: [FurnitureObject], bounds: SIMD3<Float>) -> [String: Any] {
        // Generate a simplified room layout
        let floorPlan = generateFloorPlan(walls: walls, bounds: bounds)
        
        return [
            "floorPlan": floorPlan,
            "roomType": classifyRoom(furniture: furniture),
            "totalArea": bounds.x * bounds.z,
            "wallCount": walls.count,
            "furnitureCount": furniture.count
        ]
    }
    
    private func generateFloorPlan(walls: [WallSegment], bounds: SIMD3<Float>) -> [[String: Any]] {
        // Create a simplified floor plan representation
        return walls.enumerated().map { index, wall in
            [
                "id": "wall_\(index)",
                "points": wall.points.map { [$0.x, $0.z] }, // Top-down view (x, z coordinates)
                "length": wall.length,
                "type": "wall"
            ]
        }
    }
    
    private func classifyRoom(furniture: [FurnitureObject]) -> String {
        let furnitureTypes = Set(furniture.map { $0.type })
        
        if furnitureTypes.contains("bed") {
            return "bedroom"
        } else if furnitureTypes.contains("table") && furniture.count > 2 {
            return "living_room"
        } else {
            return "room"
        }
    }
    
    @objc func stopScan(_ call: CAPPluginCall) {
        self.isScanning = false
        self.scanTimer?.invalidate()
        self.scanTimer = nil
        
        // Get final scan data
        guard let arView = self.arView else {
            call.reject("AR session not available")
            return
        }
        
        var points: [[Float]] = []
        var roomDimensions: [String: Float] = [:]
        var walls: [[[Float]]] = []
        var furniture: [[String: Any]] = []
        var roomLayout: [String: Any] = [:]
        
        // Extract final mesh data
        arView.session.currentFrame?.anchors.forEach { anchor in
            if let meshAnchor = anchor as? ARMeshAnchor {
                let vertices = meshAnchor.geometry.vertices
                let vertexCount = vertices.count
                
                // Extract complete point cloud
                for i in 0..<vertexCount {
                    let vertex = vertices[i]
                    points.append([vertex.x, vertex.y, vertex.z])
                }
                
                // Calculate final room dimensions
                let bounds = meshAnchor.geometry.extent
                roomDimensions = [
                    "width": bounds.x,
                    "height": bounds.y,
                    "depth": bounds.z
                ]
                
                // Final mesh analysis
                let analysisResult = analyzeMeshForLayout(meshAnchor: meshAnchor)
                walls = analysisResult.walls
                furniture = analysisResult.furniture
                roomLayout = analysisResult.layout
            }
        }
        
        arView.session.pause()
        
        call.resolve([
            "points": points,
            "pointCount": points.count,
            "scanTime": Date().timeIntervalSince1970 * 1000,
            "roomDimensions": roomDimensions,
            "walls": walls,
            "furniture": furniture,
            "roomLayout": roomLayout,
            "status": "success"
        ])
    }
}
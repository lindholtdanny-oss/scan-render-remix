import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FolderOpen, Calendar, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  type: string;
  description?: string;
  createdAt: Date;
  location?: string;
  scanCount: number;
  lastScanned?: Date;
}

export const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Living Room Renovation",
      type: "living-room",
      description: "Redesigning the main living space",
      createdAt: new Date("2024-01-15"),
      location: "Main House",
      scanCount: 3,
      lastScanned: new Date("2024-01-16")
    },
    {
      id: "2", 
      name: "Kitchen Remodel",
      type: "kitchen",
      description: "Complete kitchen makeover project",
      createdAt: new Date("2024-01-10"),
      location: "Main House",
      scanCount: 5,
      lastScanned: new Date("2024-01-18")
    }
  ]);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    type: "",
    description: "",
    location: ""
  });

  const roomTypes = [
    { value: "living-room", label: "Living Room" },
    { value: "bedroom", label: "Bedroom" },
    { value: "kitchen", label: "Kitchen" },
    { value: "bathroom", label: "Bathroom" },
    { value: "office", label: "Office" },
    { value: "dining-room", label: "Dining Room" },
    { value: "basement", label: "Basement" },
    { value: "garage", label: "Garage" },
    { value: "other", label: "Other" }
  ];

  const createProject = () => {
    if (!newProject.name || !newProject.type) {
      toast.error("Please fill in the required fields");
      return;
    }

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      type: newProject.type,
      description: newProject.description,
      location: newProject.location,
      createdAt: new Date(),
      scanCount: 0
    };

    setProjects([project, ...projects]);
    setNewProject({ name: "", type: "", description: "", location: "" });
    setIsCreateDialogOpen(false);
    toast.success("Project created successfully!");
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    toast.success("Project deleted");
  };

  const openProject = (project: Project) => {
    navigate(`/project/${project.id}`, { state: { project } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
            <p className="text-muted-foreground mt-2">
              Organize your 3D scanning projects and track progress
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Set up a new 3D scanning project to organize your scans.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="Living Room Renovation"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Room Type *</Label>
                  <Select
                    value={newProject.type}
                    onValueChange={(value) => setNewProject({ ...newProject, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newProject.location}
                    onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                    placeholder="Main House, Apartment, etc."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Brief description of the project"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createProject}>Create Project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first project to start organizing your 3D scans
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {roomTypes.find(t => t.value === project.type)?.label || project.type}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(project.id);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {project.description && (
                    <CardDescription className="mt-2">{project.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Created {project.createdAt.toLocaleDateString()}
                    </div>
                    {project.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {project.location}
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2">
                      <span>{project.scanCount} scans</span>
                      {project.lastScanned && (
                        <span className="text-xs">
                          Last: {project.lastScanned.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4"
                    onClick={() => openProject(project)}
                  >
                    Open Project
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
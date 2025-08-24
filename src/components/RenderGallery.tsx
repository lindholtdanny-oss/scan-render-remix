import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Image as ImageIcon, 
  Download, 
  Eye, 
  Share, 
  Trash2,
  Calendar,
  Clock
} from "lucide-react";
import { toast } from "sonner";

interface RenderedImage {
  id: string;
  url: string;
  thumbnail: string;
  type: 'exterior' | 'design-integration' | 'deck-rendering';
  createdAt: string;
  originalImages: string[];
  prompt?: string;
  status: 'processing' | 'completed' | 'failed';
}

interface RenderGalleryProps {
  renders: RenderedImage[];
  onDelete?: (id: string) => void;
}

export const RenderGallery = ({ renders, onDelete }: RenderGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<RenderedImage | null>(null);

  const handleDownload = async (render: RenderedImage) => {
    try {
      const response = await fetch(render.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `render-${render.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    }
  };

  const handleShare = async (render: RenderedImage) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Room Render',
          text: 'Check out this AI-generated room rendering!',
          url: render.url
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(render.url);
        toast.success('URL copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy URL');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'exterior':
        return 'Exterior Render';
      case 'design-integration':
        return 'Design Integration';
      case 'deck-rendering':
        return 'Deck Addition';
      default:
        return 'Render';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'processing':
        return 'bg-warning text-warning-foreground';
      case 'failed':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (renders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Renders Yet</h3>
            <p className="text-muted-foreground">
              Upload photos and generate your first AI rendering
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Rendered Images ({renders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {renders.map((render) => (
              <div key={render.id} className="group relative">
                <div className="aspect-video rounded-lg overflow-hidden bg-surface border">
                  <img
                    src={render.thumbnail || render.url}
                    alt={`Render ${render.id}`}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setSelectedImage(render)}
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className={getStatusColor(render.status)}>
                      {render.status}
                    </Badge>
                  </div>

                  {/* Type Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">
                      {getTypeLabel(render.type)}
                    </Badge>
                  </div>

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedImage(render)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(render)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleShare(render)}
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(render.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(render.createdAt)}
                  </div>
                  
                  {render.prompt && (
                    <p className="text-xs text-muted-foreground truncate">
                      {render.prompt}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Full Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              {selectedImage && getTypeLabel(selectedImage.type)}
              <Badge className={selectedImage ? getStatusColor(selectedImage.status) : ''}>
                {selectedImage?.status}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedImage.url}
                  alt={`Render ${selectedImage.id}`}
                  className="w-full rounded-lg"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Created: {formatDate(selectedImage.createdAt)}
                  </div>
                  
                  {selectedImage.prompt && (
                    <p className="text-sm text-muted-foreground">
                      Prompt: {selectedImage.prompt}
                    </p>
                  )}
                  
                  <p className="text-sm text-muted-foreground">
                    Based on {selectedImage.originalImages.length} original image(s)
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(selectedImage)}
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDownload(selectedImage)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
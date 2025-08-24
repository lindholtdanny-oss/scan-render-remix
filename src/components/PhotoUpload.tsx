import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Upload, 
  Camera, 
  Video, 
  X, 
  Eye,
  Loader2,
  Image as ImageIcon,
  Wand2
} from "lucide-react";

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
  uploaded: boolean;
  processing?: boolean;
}

interface PhotoUploadProps {
  type: 'exterior' | 'design-ideas';
  maxFiles: number;
  onRenderComplete?: (renderedImages: string[]) => void;
}

export const PhotoUpload = ({ type, maxFiles, onRenderComplete }: PhotoUploadProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = useCallback((selectedFiles: FileList) => {
    const newFiles: UploadedFile[] = Array.from(selectedFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      uploaded: false
    }));

    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
  }, [maxFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [handleFileSelect]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploadProgress(0);
    const uploadPromises = files.map(async (fileData, index) => {
      try {
        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('type', type);

        const response = await fetch('/api/upload-media', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Upload failed');

        const result = await response.json();
        
        setFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, uploaded: true }
            : f
        ));

        setUploadProgress((index + 1) / files.length * 100);
        return result.url;
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${fileData.file.name}`);
        return null;
      }
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    const successfulUploads = uploadedUrls.filter(Boolean);

    if (successfulUploads.length > 0) {
      toast.success(`Uploaded ${successfulUploads.length} files successfully`);
    }

    return successfulUploads;
  };

  const processWithAI = async () => {
    if (files.length === 0) {
      toast.error('Please upload files first');
      return;
    }

    setIsProcessing(true);
    try {
      const uploadedUrls = await uploadFiles();
      if (!uploadedUrls || uploadedUrls.length === 0) {
        throw new Error('No files uploaded successfully');
      }

      const response = await fetch('/api/process-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaUrls: uploadedUrls,
          type,
          processType: type === 'exterior' ? 'exterior-rendering' : 'design-integration'
        })
      });

      if (!response.ok) throw new Error('AI processing failed');

      const result = await response.json();
      
      toast.success('AI rendering completed!');
      onRenderComplete?.(result.renderedImages);

    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to process with AI. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'exterior':
        return 'Exterior Photos';
      case 'design-ideas':
        return 'Design Ideas';
      default:
        return 'Upload Media';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'exterior':
        return `Upload up to ${maxFiles} photos of your home's exterior for AI rendering`;
      case 'design-ideas':
        return 'Upload photos/videos of design ideas to integrate into your space';
      default:
        return 'Upload your media files';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          {getTitle()}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{getDescription()}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById(`file-input-${type}`)?.click()}
        >
          <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports JPG, PNG, MP4, MOV ({maxFiles - files.length} remaining)
          </p>
          <input
            id={`file-input-${type}`}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          />
        </div>

        {/* File Preview */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Uploaded Files ({files.length}/{maxFiles})</h4>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <Progress value={uploadProgress} className="w-24" />
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {files.map((file) => (
                <div key={file.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-surface border">
                    {file.type === 'image' ? (
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Status badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {file.uploaded && (
                        <Badge variant="secondary" className="bg-success text-success-foreground">
                          ✓
                        </Badge>
                      )}
                      {file.processing && (
                        <Badge variant="secondary" className="bg-warning text-warning-foreground">
                          <Loader2 className="w-3 h-3 animate-spin" />
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {file.file.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {files.length > 0 && (
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={uploadFiles} variant="outline" size="sm" className="flex-1">
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
            <Button 
              onClick={processWithAI} 
              size="sm" 
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              {type === 'exterior' ? 'Generate Rendering' : 'Integrate Design'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
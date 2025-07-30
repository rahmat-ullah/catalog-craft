import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, FileText, Trash2, Eye } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Attachment } from '@shared/schema';
import MarkdownViewer from './MarkdownViewer';

interface FileUploadProps {
  productId: string;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
}

export default function FileUpload({ productId, attachments, onAttachmentsChange }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewerAttachment, setViewerAttachment] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/admin/products/${productId}/attachments`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (newAttachment) => {
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      onAttachmentsChange([...attachments, newAttachment]);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      const response = await fetch(`/api/admin/attachments/${attachmentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Delete failed');
      }
    },
    onSuccess: (_, attachmentId) => {
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
      onAttachmentsChange(attachments.filter(att => att.id !== attachmentId));
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete file",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const isValidType = file.type === 'application/pdf' || 
                         file.name.toLowerCase().endsWith('.md') ||
                         file.type === 'text/markdown' ||
                         file.type === 'text/x-markdown';
      
      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description: "Only PDF and Markdown files are allowed",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleDelete = (attachmentId: string) => {
    deleteMutation.mutate(attachmentId);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    return fileType === 'pdf' ? <File className="w-4 h-4" /> : <FileText className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>File Attachments</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Upload PDF and Markdown files for this product
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.md,.markdown"
                onChange={handleFileSelect}
                className="mb-2"
              />
              {selectedFile && (
                <div className="flex items-center justify-between bg-muted p-2 rounded">
                  <div className="flex items-center gap-2">
                    {getFileIcon(selectedFile.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'md')}
                    <span className="text-sm">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({formatFileSize(selectedFile.size)})
                    </span>
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    size="sm"
                  >
                    {uploadMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Upload
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Uploaded Files</Label>
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between bg-muted p-3 rounded"
                >
                  <div className="flex items-center gap-2">
                    {getFileIcon(attachment.fileType || 'pdf')}
                    <div>
                      <p className="text-sm font-medium">{attachment.originalName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.size)} • {attachment.fileType?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {attachment.fileType === 'md' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewerAttachment(attachment)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/api/attachments/${attachment.id}/download`, '_blank')}
                    >
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(attachment.id)}
                      disabled={deleteMutation.isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Markdown Viewer */}
      {viewerAttachment && (
        <MarkdownViewer
          attachment={viewerAttachment}
          open={!!viewerAttachment}
          onOpenChange={(open) => !open && setViewerAttachment(null)}
        />
      )}
    </div>
  );
}
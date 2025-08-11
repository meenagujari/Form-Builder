import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface SimpleFileUploadProps {
  onUpload: (fileUrl: string) => void;
  accept?: string;
  maxSize?: number; // in bytes
  buttonText?: string;
  className?: string;
}

export function SimpleFileUpload({
  onUpload,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  buttonText = "Upload File",
  className = ""
}: SimpleFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize) {
      alert(`File is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
        }
      });

      // Handle upload completion
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.success && response.url) {
            onUpload(response.url);
          } else {
            alert('Upload failed: ' + (response.error || 'Unknown error'));
          }
        } else {
          alert('Upload failed with status: ' + xhr.status);
        }
        setIsUploading(false);
        setUploadProgress(0);
      };

      xhr.onerror = () => {
        alert('Upload failed due to network error');
        setIsUploading(false);
        setUploadProgress(0);
      };

      xhr.open('POST', '/api/upload');
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsUploading(false);
      setUploadProgress(0);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="relative overflow-hidden"
      >
        {isUploading ? (
          <>
            <div 
              className="absolute left-0 top-0 h-full bg-primary/20 transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
            <span className="relative z-10">
              Uploading: {Math.round(uploadProgress)}%
            </span>
          </>
        ) : (
          <>
            <Upload size={16} className="mr-2" />
            {buttonText}
          </>
        )}
      </Button>
    </div>
  );
}
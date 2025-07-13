import React, { useState, useCallback } from 'react';
import { FileUpload } from './file-upload';
import { Upload, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Alert, AlertDescription } from '../ui/alert';

interface SmartFileUploadProps {
  onUploadComplete: (urls: string[]) => void;
}

export function SmartFileUpload({ onUploadComplete }: SmartFileUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<'uploadthing' | 'fallback'>('uploadthing');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleUploadThingComplete = useCallback((urls: string[]) => {
    onUploadComplete(urls);
    setError('');
  }, [onUploadComplete]);

  const handleFallbackUpload = useCallback(async (files: File[]) => {
    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const response = await fetch('/api/upload/fallback', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const urls = result.data.map((file: any) => file.url);
        onUploadComplete(urls);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Fallback upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadComplete]);

  const switchToFallback = () => {
    setUploadMethod('fallback');
    setError('');
  };

  const switchToUploadThing = () => {
    setUploadMethod('uploadthing');
    setError('');
  };

  if (uploadMethod === 'fallback') {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Using fallback upload method. Files will be stored locally on the server.
            <Button
              variant="link"
              size="sm"
              onClick={switchToUploadThing}
              className="ml-2 h-auto p-0"
            >
              Try UploadThing again
            </Button>
          </AlertDescription>
        </Alert>
        
        <FallbackFileUpload
          onUpload={handleFallbackUpload}
          isUploading={isUploading}
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FileUpload 
        onUploadComplete={handleUploadThingComplete}
        onError={(error: string) => {
          if (error.includes('network') || error.includes('ECONNRESET') || error.includes('Transport error')) {
            setError(error);
          }
        }}
      />
      
      {error && (
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <div className="space-y-2">
              <p>UploadThing upload failed: {error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={switchToFallback}
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                <Upload className="h-3 w-3 mr-1" />
                Use Alternative Upload
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

interface FallbackFileUploadProps {
  onUpload: (files: File[]) => void;
  isUploading: boolean;
  error: string;
}

function FallbackFileUpload({ onUpload, isUploading, error }: FallbackFileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-border rounded-lg p-6">
        <div className="text-center space-y-4">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
          <div>
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Only PDF files up to 4MB are allowed
            </p>
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Selected Files:</div>
              {selectedFiles.map((file, index) => (
                <div key={index} className="text-xs text-muted-foreground">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
                </div>
              ))}
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="mt-2"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { useUploadThing } from "@/lib/uploadthing-hooks";
import { Upload, File, CheckCircle, AlertCircle } from "lucide-react";

interface FileUploadProps {
    onUploadComplete: (urls: string[]) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    
    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(acceptedFiles);
        setUploadStatus('idle');
    }, []);

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept: generateClientDropzoneAccept(["pdf"]),
        multiple: true,
        maxSize: 10 * 1024 * 1024, // 10MB max file size
    });

    const { startUpload, isUploading } = useUploadThing("contractUploader", {
        onClientUploadComplete: (res) => {
            if (res) {
                const urls = res.map((r: { url: string }) => r.url);
                onUploadComplete(urls);
                setFiles([]);
                setUploadStatus('success');
                // Reset status after 2 seconds
                setTimeout(() => setUploadStatus('idle'), 2000);
            }
        },
        onUploadError: (error: Error) => {
            console.error(error);
            setUploadStatus('error');
            // Reset status after 3 seconds
            setTimeout(() => setUploadStatus('idle'), 3000);
        },
    });

    // Auto-upload when files are selected
    useEffect(() => {
        if (files.length > 0 && uploadStatus === 'idle') {
            setUploadStatus('uploading');
            startUpload(files);
        }
    }, [files, startUpload, uploadStatus]);

    const getStatusIcon = () => {
        switch (uploadStatus) {
            case 'uploading':
                return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>;
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Upload className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const getBorderClass = () => {
        if (isDragActive) {
            return 'border-primary bg-primary/10 scale-105';
        }
        switch (uploadStatus) {
            case 'uploading':
                return 'border-primary bg-primary/5';
            case 'success':
                return 'border-green-500 bg-green-50 dark:bg-green-900/20';
            case 'error':
                return 'border-red-500 bg-red-50 dark:bg-red-900/20';
            default:
                return 'border-border hover:border-primary/50 dark:border-border dark:hover:border-primary/50';
        }
    };

    const getStatusText = () => {
        if (isDragActive) {
            return 'Drop the files here...';
        }
        switch (uploadStatus) {
            case 'uploading':
                return `Uploading ${files.length} file(s)...`;
            case 'success':
                return 'Upload completed successfully!';
            case 'error':
                return 'Upload failed. Please try again.';
            default:
                return files.length > 0
                    ? `${files.length} file(s) ready to upload`
                    : "Drag 'n' drop PDF files here, or click to select files";
        }
    };

    return (
        <div className="space-y-3">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all duration-200 ${getBorderClass()}`}
            >
                <input {...getInputProps()} />
                <div className="text-center space-y-3">
                    <div className="flex justify-center">
                        {getStatusIcon()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {getStatusText()}
                    </p>
                    {files.length > 0 && uploadStatus === 'idle' && (
                        <div className="text-xs text-muted-foreground">
                            Files will upload automatically
                        </div>
                    )}
                    {files.length > 0 && (
                        <div className="text-xs text-muted-foreground space-y-1 max-h-20 overflow-y-auto">
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center justify-center gap-2">
                                    <File className="h-3 w-3" />
                                    <span className="truncate max-w-xs">{file.name}</span>
                                    <span className="text-muted-foreground/70">
                                        ({(file.size / 1024 / 1024).toFixed(1)}MB)
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="text-xs text-muted-foreground/70">
                        Only PDF files up to 10MB are allowed
                    </div>
                </div>
            </div>
            
            {/* File rejection errors */}
            {fileRejections.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-3">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-300 text-sm font-medium">
                        <AlertCircle className="h-4 w-4" />
                        Some files were rejected:
                    </div>
                    <ul className="mt-2 text-xs text-red-600 dark:text-red-400 space-y-1">
                        {fileRejections.map(({ file, errors }, index) => (
                            <li key={index}>
                                <span className="font-medium">{file.name}</span>
                                {errors.map((error) => (
                                    <span key={error.code} className="ml-2">
                                        - {error.message}
                                    </span>
                                ))}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

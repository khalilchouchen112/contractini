"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { useUploadThing } from "@/lib/uploadthing-hooks";

interface FileUploadProps {
    onUploadComplete: (urls: string[]) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
    const [files, setFiles] = useState<File[]>([]);
    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(acceptedFiles);
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: generateClientDropzoneAccept(["pdf"]),
    });

    const { startUpload, isUploading } = useUploadThing("contractUploader", {
        onClientUploadComplete: (res) => {
            if (res) {
                const urls = res.map((r: { url: string }) => r.url);
                onUploadComplete(urls);
                setFiles([]);
            }
        },
        onUploadError: (error: Error) => {
            console.error(error);
        },
    });

    return (
        <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-colors"
        >
            <input {...getInputProps()} />
            <div className="text-center">
                <p className="text-sm text-gray-600">
                    {files.length > 0
                        ? `Selected ${files.length} file(s)`
                        : "Drag 'n' drop files here, or click to select files"}
                </p>
                {files.length > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            startUpload(files);
                        }}
                        disabled={isUploading}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {isUploading ? "Uploading..." : "Upload"}
                    </button>
                )}
            </div>
        </div>
    );
}

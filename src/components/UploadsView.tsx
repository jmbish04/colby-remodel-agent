
"use client";

import React, { useState, useEffect } from 'react';
import UploadForm from './forms/UploadForm';
import { apiClient } from '@/lib/services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';

interface R2File {
    key: string;
    size: number;
    lastModified: string;
    eTag: string;
}

const UploadsView: React.FC = () => {
    const [files, setFiles] = useState<R2File[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFiles = async () => {
        try {
            setIsLoading(true);
            const fileList = await apiClient.get<R2File[]>('/uploads');
            setFiles(fileList);
        } catch (error) {
            console.error("Failed to fetch files:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleUploadSuccess = (fileKey: string) => {
        console.log(`Upload successful: ${fileKey}`);
        // Refresh the file list after a successful upload
        fetchFiles();
    };

    return (
        <div className="space-y-8">
            <UploadForm onUploadSuccess={handleUploadSuccess} />

            <Card>
                <CardHeader>
                    <CardTitle>Uploaded Files</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p>Loading files...</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>File Name</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Last Modified</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {files.length > 0 ? (
                                    files.map((file) => (
                                        <TableRow key={file.key}>
                                            <TableCell className="font-medium">{file.key}</TableCell>
                                            <TableCell>{(file.size / 1024).toFixed(2)} KB</TableCell>
                                            <TableCell>{new Date(file.lastModified).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center">
                                            No files uploaded yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default UploadsView;

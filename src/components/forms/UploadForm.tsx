
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/services/api';

interface UploadFormProps {
  onUploadSuccess: (fileKey: string) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 1. Get a presigned URL from our API
      const { signedUrl, key } = await apiClient.post<{ signedUrl: string, key: string }>('/uploads', {
        filename: file.name,
        contentType: file.type,
      });

      // 2. Upload the file directly to R2 using the presigned URL
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('File upload failed.');
      }

      // 3. Notify parent component of success
      onUploadSuccess(key);
      setFile(null);

    } catch (err) {
      console.error(err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Upload File</CardTitle>
        <CardDescription>Select a file and upload it to the project.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">File</Label>
            <Input id="file-upload" type="file" onChange={handleFileChange} />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={!file || isUploading}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UploadForm;

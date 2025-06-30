'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';
import { TextArea } from '@/components/shared/Form';

export default function ImageUploader() {
  const [urls, setUrls] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Function to validate URLs
  const validateUrls = (urlsText: string): string[] => {
    const urlList = urlsText.split('\n').map(url => url.trim()).filter(Boolean);
    const validUrls: string[] = [];
    
    for (const url of urlList) {
      try {
        new URL(url);
        validUrls.push(url);
      } catch {
        setError(`Invalid URL format: ${url}`);
        return [];
      }
    }
    
    return validUrls;
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const validUrls = validateUrls(urls);
    if (validUrls.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: validUrls }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`API Error: ${data.error || response.statusText}`);
      }
      
      setUrls('');
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to add images: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <form onSubmit={handleSubmit} className="mb-8">
          <TextArea
            id="urls"
            label="Add Image URLs (one per line)"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding Images...' : 'Add Images'}
          </Button>
        </form>
        {error && (
          <div className="mt-6 mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

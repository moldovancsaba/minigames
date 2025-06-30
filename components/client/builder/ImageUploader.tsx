'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
          <div className="mb-4">
            <label htmlFor="urls" className="block text-sm font-medium mb-2">
              Add Image URLs (one per line)
            </label>
            <textarea
              id="urls"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              className="w-full h-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isLoading ? 'Adding Images...' : 'Add Images'}
          </button>
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

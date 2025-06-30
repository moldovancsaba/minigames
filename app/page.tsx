// Main page component with navigation only
'use client';

import Navigation from '@/components/client/Navigation';

export default function Home() {
  return (
    <div style={{ height: '100vh', margin: 0, padding: 0 }}>
      <Navigation />
    </div>
  );
}

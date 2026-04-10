export function GET() {
  const body = {
    name: 'Kids Swipe Game',
    short_name: 'Swipe Game',
    description: 'Swipe cards, compare favorites, and see the final ranking.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8b94a',
    theme_color: '#f8b94a',
    orientation: 'any',
    icons: [
      {
        src: '/images/card_01.jpeg',
        sizes: '192x192',
        type: 'image/jpeg'
      },
      {
        src: '/images/card_01.jpeg',
        sizes: '512x512',
        type: 'image/jpeg'
      }
    ]
  };

  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/manifest+json'
    }
  });
}

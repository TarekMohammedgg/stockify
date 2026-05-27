const candidates = [
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600",
  "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
  "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600",
  "https://images.unsplash.com/photo-1628294895518-2e457f722cf1?w=600",
  "https://images.unsplash.com/photo-1547058886-f39f9a8b5570?w=600",
  "https://images.unsplash.com/photo-1577906096429-f73dc180d226?w=600",
  "https://images.unsplash.com/photo-1637949385162-e416fb15b2ce?w=600",
  "https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?w=600"
];

async function check() {
  for (const url of candidates) {
    try {
      const res = await fetch(url, { method: 'GET' });
      const contentType = res.headers.get('content-type') || '';
      console.log(`URL: ${url} -> Status: ${res.status}, Type: ${contentType}`);
    } catch (err) {
      console.log(`URL: ${url} -> Error: ${err.message}`);
    }
  }
}

check();

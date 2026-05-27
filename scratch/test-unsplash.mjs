import fs from 'fs';
import path from 'path';

// Parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const candidateUrls = {
  "Hummus": [
    "https://images.unsplash.com/photo-1577906096429-f73dc180d226?w=600",
    "https://images.unsplash.com/photo-1547058886-f39f9a8b5570?w=600"
  ],
  "Fava Beans": [
    "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600",
    "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600"
  ],
  "Macarona Béchamel": [
    "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600",
    "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600"
  ],
  "Grilled Chicken": [
    "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600",
    "https://images.unsplash.com/photo-1610057099443-fde8c4d90ef8?w=600"
  ]
};

async function findWorkingUrls() {
  console.log("Testing candidate Unsplash images...");
  const working = {};

  for (const [item, urls] of Object.entries(candidateUrls)) {
    for (const url of urls) {
      try {
        const res = await fetch(url, { method: 'GET' });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.startsWith('image/')) {
          console.log(`[OK] ${item} -> ${url}`);
          working[item] = url;
          break; // Found working one, skip rest for this item
        } else {
          console.log(`[FAIL] ${item} -> ${url} (Status: ${res.status}, Type: ${contentType})`);
        }
      } catch (err) {
        console.log(`[ERROR] ${item} -> ${url} (${err.message})`);
      }
    }
  }

  // Update Supabase if we found working replacements
  if (Object.keys(working).length > 0) {
    console.log("\nUpdating Supabase database with working images...");
    
    const idMap = {
      "Hummus": "d1000000-0000-0000-0000-000000000001",
      "Fava Beans": "d1000000-0000-0000-0000-000000000002",
      "Macarona Béchamel": "d1000000-0000-0000-0000-000000000006",
      "Grilled Chicken": "d1000000-0000-0000-0000-000000000009"
    };

    for (const [item, url] of Object.entries(working)) {
      const id = idMap[item];
      const patchUrl = `${supabaseUrl}/rest/v1/menu_items?id=eq.${id}`;
      try {
        const patchRes = await fetch(patchUrl, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ photo_url: url })
        });

        if (patchRes.ok) {
          console.log(`Successfully updated ${item} image to: ${url}`);
        } else {
          const errText = await patchRes.text();
          console.error(`Failed to update ${item}: ${patchRes.status} - ${errText}`);
        }
      } catch (err) {
        console.error(`Error updating ${item} in database: ${err.message}`);
      }
    }
  }
}

findWorkingUrls();

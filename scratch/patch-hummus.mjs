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

const id = "d1000000-0000-0000-0000-000000000001"; // Hummus UUID
const newUrl = "https://images.unsplash.com/photo-1637949385162-e416fb15b2ce?w=600";

async function patch() {
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
      body: JSON.stringify({ photo_url: newUrl })
    });

    if (patchRes.ok) {
      console.log(`Successfully updated Hummus image in Supabase to: ${newUrl}`);
    } else {
      const errText = await patchRes.text();
      console.error(`Failed to update Hummus image: ${patchRes.status} - ${errText}`);
    }
  } catch (err) {
    console.error(`Error updating Hummus image in database: ${err.message}`);
  }
}

patch();

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

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env.local");
  process.exit(1);
}

async function checkImages() {
  console.log("Fetching menu items from Supabase REST API...");
  
  const restUrl = `${supabaseUrl}/rest/v1/menu_items?select=id,name_ar,name_en,photo_url`;
  
  let items = [];
  try {
    const response = await fetch(restUrl, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    
    items = await response.json();
  } catch (error) {
    console.error("Error fetching menu items:", error);
    process.exit(1);
  }

  console.log(`Found ${items.length} menu items. Checking photo URLs...`);
  console.log("--------------------------------------------------");

  const results = [];

  for (const item of items) {
    const { id, name_ar, name_en, photo_url } = item;
    if (!photo_url) {
      results.push({ id, name_ar, name_en, url: null, status: 'No photo URL' });
      continue;
    }

    try {
      // Perform a fetch with a timeout
      const controller = new AbortController();
      const idTimeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(photo_url, { 
        method: 'GET',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      clearTimeout(idTimeout);

      const contentType = res.headers.get('content-type') || '';
      const isImage = contentType.startsWith('image/');
      
      if (res.ok && isImage) {
        results.push({ id, name_ar, name_en, url: photo_url, status: 'OK', code: res.status, contentType });
      } else if (res.ok && !isImage) {
        results.push({ id, name_ar, name_en, url: photo_url, status: `Not an image (Content-Type: ${contentType})`, code: res.status });
      } else {
        results.push({ id, name_ar, name_en, url: photo_url, status: `Broken (HTTP Status: ${res.status})`, code: res.status });
      }
    } catch (err) {
      results.push({ id, name_ar, name_en, url: photo_url, status: `Error: ${err.message}` });
    }
  }

  console.table(results.map(r => ({
    "Item (AR)": r.name_ar,
    "Item (EN)": r.name_en,
    "Status": r.status,
    "URL": r.url ? (r.url.length > 50 ? r.url.substring(0, 47) + "..." : r.url) : 'N/A'
  })));

  // Write full details to a JSON file in the scratch directory
  const reportPath = path.resolve(process.cwd(), 'scratch/image-check-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nDetailed report written to: ${reportPath}`);
}

checkImages();

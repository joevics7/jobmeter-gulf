import { createClient } from '@supabase/supabase-js';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gulf.jobmeter.app';

export async function GET() {
  const lines: string[] = [];

  // Segmented static routes for Gulf
  const staticRoutes = [
    { url: `${siteUrl}/jobs/uae`,            priority: '0.9' },
  ];

  const today = new Date().toISOString();
  for (const r of staticRoutes) {
    lines.push(urlEntry(r.url, today, 'weekly', r.priority));
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[sitemap-locations] Missing Supabase credentials');
      return xmlResponse(lines);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // ✅ Filter by website_country = 'gulf'
    const { data: statePages, error: stateError } = await supabase
      .from('location_state_pages')
      .select('country_slug, slug, full_path, updated_at, towns')
      .eq('is_active', true)
      .eq('website_country', 'gulf');

    if (stateError) {
      console.error('[sitemap-locations] Error fetching state pages:', stateError.message);
      return xmlResponse(lines);
    }

    let stateCount = 0;
    let townCount = 0;

    for (const page of statePages || []) {
      const stateUrl = `${siteUrl}/jobs/Location/${page.full_path || `${page.country_slug}/${page.slug}`}`;
      lines.push(urlEntry(stateUrl, page.updated_at || today, 'daily', '0.8'));
      stateCount++;

      const towns: Array<{ slug: string; is_active: boolean; updated_at?: string }> = page.towns || [];
      for (const town of towns) {
        if (!town.is_active || !town.slug) continue;
        const townUrl = `${stateUrl}/${town.slug}`;
        lines.push(urlEntry(townUrl, town.updated_at || today, 'daily', '0.7'));
        townCount++;
      }
    }
    console.log(`[sitemap-locations-gulf] ${stateCount} state pages, ${townCount} active town pages`);
  } catch (err) {
    console.error('[sitemap-locations] Unexpected error:', err);
    return xmlResponse(lines);
  }
  return xmlResponse(lines);
}

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function xmlResponse(lines: string[]) {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${lines.join('\n')}
</urlset>`;
  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  });
}

export const revalidate = 3600;
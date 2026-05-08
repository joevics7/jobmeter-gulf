import { notFound } from 'next/navigation';
import { mapJobToSchema } from '@/lib/mapJobToSchema';
import JobClient from './JobClient';
import { Metadata } from 'next';
import { cache } from 'react';

export const revalidate = false;
export const dynamic = 'force-static';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const COMPANIES_URL = 'https://jobs-api.joevicspro.workers.dev/companies';

// ─── Table for this site ──────────────────────────────────────────────────────
const JOBS_TABLE = 'jobs_gulf';

// ─── Gulf country identifiers ─────────────────────────────────────────────────
// Jobs whose `country` array or `location.country` matches any of these are
// considered Gulf jobs and receive internal same-domain links.
const GULF_COUNTRY_CODES = new Set([
  'AE', 'SA', 'KW', 'QA', 'BH', 'OM', 'JO', 'EG', 'LB',
  'UAE', 'uae', 'united arab emirates',
  'saudi arabia', 'ksa',
  'kuwait', 'qatar', 'bahrain', 'oman', 'jordan', 'egypt', 'lebanon',
]);

const getJob = cache(async (slug: string) => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${JOBS_TABLE}?slug=eq.${slug}&select=*&limit=1`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: false },
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data[0] || null;
});

const getCompanies = cache(async () => {
  try {
    const res = await fetch(COMPANIES_URL, { next: { revalidate: 604800 } });
    const data = await res.json();
    return data.companies || [];
  } catch (error) {
    console.error('Failed to fetch companies from Cloudflare:', error);
    return [];
  }
});

/**
 * Related jobs for gulf.jobmeter.app:
 * Fetches jobs in the same category, then filters client-side to those whose
 * country array or location.country is in the Gulf set.
 * Falls back to showing all same-category jobs if no Gulf matches are found.
 */
const getRelatedJobs = cache(async (currentJob: any) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateStr = thirtyDaysAgo.toISOString();

  const params = new URLSearchParams({
    select: 'id,title,company,location,country,category,slug,status,deadline,created_at',
    category: `eq.${currentJob.category}`,
    id: `neq.${currentJob.id}`,
    created_at: `gte.${dateStr}`,
    order: 'created_at.desc',
    limit: '30', // fetch more so we have room to filter
  });

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${JOBS_TABLE}?${params.toString()}`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: false },
    }
  );
  if (!res.ok) return [];

  const allJobs: any[] = await res.json();

  // Prefer Gulf-country jobs; fall back to all results if too few Gulf matches
  const gulfJobs = allJobs.filter((j) => {
    const countryArr: string[] = Array.isArray(j.country) ? j.country : [];
    const locationCountry =
      typeof j.location === 'object' ? (j.location?.country || '') : '';
    return [...countryArr, locationCountry].some((c) =>
      GULF_COUNTRY_CODES.has(c?.toLowerCase?.() ?? c)
    );
  });

  return (gulfJobs.length >= 3 ? gulfJobs : allJobs).slice(0, 10);
});

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const job = await getJob(params.slug);
  if (!job) return { title: 'Job Not Found' };

  const companyName = typeof job.company === 'string' ? job.company : job.company?.name || 'Company';
  const titleCore = `${job.title} at ${companyName}`;
  const description = job.description?.replace(/<[^>]*>/g, '').slice(0, 160) || '';
  const isNoIndex = job.status === 'expired';

  return {
    title: titleCore,
    description,
    openGraph: {
      title: titleCore,
      description,
      type: 'website',
      siteName: 'JobMeter Gulf',
      url: `https://gulf.jobmeter.app/jobs/${job.slug || job.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: titleCore,
      description,
    },
    alternates: {
      canonical: `https://gulf.jobmeter.app/jobs/${job.slug || job.id}`,
    },
    robots: isNoIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default async function JobPage({ params }: { params: { slug: string } }) {
  const job = await getJob(params.slug);
  if (!job) notFound();

  const companies = await getCompanies();
  const relatedJobs = await getRelatedJobs(job);
  const schema = mapJobToSchema(job);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <JobClient
        job={job}
        relatedJobs={relatedJobs}
        companies={companies}
      />
    </>
  );
}
import { notFound } from 'next/navigation';
import { mapJobToSchema } from '@/lib/mapJobToSchema';
import JobClient from './JobClient';
import { Metadata } from 'next';
import { cache } from 'react';

// force-static + revalidate=false means: render once per slug on first request,
// cache forever on Vercel. Cloudflare then caches the HTML on top indefinitely.
// Only re-renders if you manually call revalidatePath('/jobs/[slug]') when a job changes.
export const revalidate = false;
export const dynamic = 'force-static';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const COMPANIES_URL = 'https://jobs-api.joevicspro.workers.dev/companies';

// ─── Table for this site ──────────────────────────────────────────────────────
const JOBS_TABLE = 'jobs_nigeria';

// Plain REST fetch — no cookies, no request state, fully static-compatible
const JOB_FIELDS = [
  'id','title','role','slug','status','category','sector','employment_type',
  'job_type','experience_level','location','company','about_company',
  'salary_range','application','application_email','application_phone','application_url',
  'apply_instruction','posted_date','deadline','description','responsibilities',
  'qualifications','skills_required','ai_enhanced_skills','benefits',
  'about_role','who_apply','standout','subject','related_roles','views','country','state',
].join(',');

const getJob = cache(async (slug: string) => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${JOBS_TABLE}?slug=eq.${slug}&select=${JOB_FIELDS}&limit=1`,
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
    const res = await fetch(COMPANIES_URL, {
      next: { revalidate: false },
    });
    const data = await res.json();
    return data.companies || [];
  } catch (error) {
    console.error('Failed to fetch companies from Cloudflare:', error);
    return [];
  }
});

// Plain REST fetch for related jobs — queries jobs_nigeria table
const getRelatedJobs = cache(async (currentJob: any) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  // Truncate to date-only so the fetch URL is identical for all renders on the
  // same day — without this, the full ISO timestamp changes every second and
  // Next.js treats every request as a cache miss, causing a full server render
  // on every visit and inflating ISR writes and Function Invocations ~69x.
  const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

  const params = new URLSearchParams({
    select: 'id,title,company,location,category,slug,status,deadline,created_at',
    category: `eq.${currentJob.category}`,
    id: `neq.${currentJob.id}`,
    created_at: `gte.${dateStr}`,
    order: 'created_at.desc',
    limit: '10',
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
  return await res.json();
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
      siteName: 'JobMeter',
      url: `https://www.jobmeter.app/jobs/${job.slug || job.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: titleCore,
      description,
    },
    alternates: {
      canonical: `https://www.jobmeter.app/jobs/${job.slug || job.id}`,
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
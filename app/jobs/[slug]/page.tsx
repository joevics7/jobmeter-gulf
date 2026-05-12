import { notFound } from 'next/navigation';
import { mapJobToSchema } from '@/lib/mapJobToSchema';
import JobClient from './JobClient';
import JobList from '@/components/jobs/JobList'; // Added to handle country breadcrumb
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
const GULF_COUNTRY_CODES = new Set([
  'AE', 'SA', 'KW', 'QA', 'BH', 'OM', 'JO', 'EG', 'LB',
  'UAE', 'uae', 'united arab emirates',
  'saudi arabia', 'ksa',
  'kuwait', 'qatar', 'bahrain', 'oman', 'jordan', 'egypt', 'lebanon',
]);

// Map for breadcrumb links to work
const COUNTRY_MAP: Record<string, string> = {
  'united-arab-emirates': 'United Arab Emirates',
  'saudi-arabia': 'Saudi Arabia',
  'qatar': 'Qatar',
  'kuwait': 'Kuwait',
  'oman': 'Oman',
  'bahrain': 'Bahrain'
};

const getJob = cache(async (slug: string) => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${JOBS_TABLE}?slug=eq.${slug}&select=*&limit=1`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: 3600 },
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data[0] || null;
});

const getRelatedJobs = async (job: any) => {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${JOBS_TABLE}?id=neq.${job.id}&limit=6`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );
  if (!res.ok) return [];
  return res.json();
};

const getCompanies = async () => {
  try {
    const res = await fetch(COMPANIES_URL);
    if (!res.ok) return [];
    const data = await res.json();
    // Ensure we return the array part if the API wraps it in an object
    return Array.isArray(data) ? data : data.companies || [];
  } catch (error) {
    return [];
  }
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;

  // Fix 404 for breadcrumb links
  if (COUNTRY_MAP[slug]) {
    return {
      title: `Jobs in ${COUNTRY_MAP[slug]} - JobMeter Gulf`,
      description: `Find the latest employment opportunities in ${COUNTRY_MAP[slug]}.`,
    };
  }

  const job = await getJob(slug);
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
  const { slug } = params;

  // Handle Country Breadcrumb clicks (/jobs/united-arab-emirates)
  if (COUNTRY_MAP[slug]) {
    return (
      <main className="min-h-screen bg-white pt-8">
        <div className="max-w-7xl mx-auto px-4">
          <JobList initialCountry={COUNTRY_MAP[slug]} />
        </div>
      </main>
    );
  }

  const job = await getJob(slug);
  if (!job) notFound();

  const companiesData = await getCompanies();
  // Minimal fix: Ensure companies is always an array to prevent .find() error
  const companies = Array.isArray(companiesData) ? companiesData : [];
  
  const relatedJobs = await getRelatedJobs(job);
  
  // 1. Generate the schema object
  const schema = mapJobToSchema(job);

  return (
    <>
      {/* 2. Inject the JSON-LD schema script directly into the HTML head/body via Server Component */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      {/* 3. Pass only the data JobClient is expecting (schema removed) */}
      <JobClient 
        job={job} 
        relatedJobs={relatedJobs} 
        companies={companies} 
      />
    </>
  );
}
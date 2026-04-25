"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { theme } from '@/lib/theme';

import { 
  Briefcase, 
  MapPin, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Shield,
  PlusCircle,
  Globe,
  Building2,
  BadgeCheck
} from 'lucide-react';

import Link from 'next/link';
import AdUnit from '@/components/ads/AdUnit';

const AuthModal = dynamic(() => import('@/components/AuthModal'), { ssr: false });
const RecruiterAuthModal = dynamic(() => import('@/components/RecruiterAuthModal'), { ssr: false });

const GCC_REGIONS = [
  { name: 'United Arab Emirates', slug: 'uae', cities: 'Dubai, Abu Dhabi, Sharjah, Ajman' },
  { name: 'Saudi Arabia', slug: 'saudi-arabia', cities: 'Riyadh, Jeddah, Dammam, NEOM' },
  { name: 'Qatar', slug: 'qatar', cities: 'Doha, Lusail, Al Wakrah' },
  { name: 'Kuwait', slug: 'kuwait', cities: 'Kuwait City, Al Ahmadi' },
  { name: 'Oman', slug: 'oman', cities: 'Muscat, Salalah, Sohar' },
  { name: 'Bahrain', slug: 'bahrain', cities: 'Manama, Riffa' },
];

const GULF_INDUSTRIES = [
  { title: 'Oil & Gas', slug: 'oil-and-gas' },
  { title: 'Construction', slug: 'construction' },
  { title: 'Civil Engineering', slug: 'civil-engineering' },
  { title: 'Hospitality', slug: 'hospitality' },
  { title: 'Tourism', slug: 'tourism' },
  { title: 'Healthcare', slug: 'healthcare' },
  { title: 'Nursing', slug: 'nursing' },
  { title: 'Banking', slug: 'banking' },
  { title: 'Fintech', slug: 'fintech' },
  { title: 'Aviation', slug: 'aviation' },
  { title: 'Logistics', slug: 'logistics' },
  { title: 'Digital Marketing', slug: 'marketing' },
  { title: 'Software Development', slug: 'software' },
  { title: 'Cybersecurity', slug: 'cybersecurity' },
  { title: 'Education', slug: 'education' },
  { title: 'Real Estate', slug: 'real-estate' },
];

const GULF_FAQS = [
  {
    question: "Do I need a work visa to work in the Gulf?",
    answer: "Yes. Most employers in the UAE, Saudi Arabia, and Qatar provide full visa sponsorship and entry permits for international hires."
  },
  {
    question: "Are salaries in the GCC tax-free?",
    answer: "Yes, GCC countries generally do not levy personal income tax on employment earnings, allowing you to keep your full gross salary."
  },
  {
    question: "What benefits are typical in Gulf job offers?",
    answer: "Many offers include a basic salary plus allowances for housing, transportation, and annual flight tickets to your home country."
  }
];

export default function GulfHomePage({ jobs = [] }: { jobs: any[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [recruiterModalOpen, setRecruiterModalOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/jobs?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO SECTION: Reverted to Gradient, No Image ── */}
      <section className="relative px-6 py-16 md:py-24 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-8 text-sm">
            <Sparkles size={14} /> AI-Powered Job Matching for the Middle East
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Find Your Career <br />
            <span style={{ color: theme.colors.primary.DEFAULT }}>Opportunity in the Gulf</span>
          </h1>
          
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
            Connect with top employers in UAE, Saudi Arabia, and Qatar. Tax-free salaries and global career growth.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
            <div className="flex flex-col md:flex-row gap-2 p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              <div className="flex-1 relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="e.g. Accountant, Civil Engineer..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                Search Jobs
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-6 text-gray-400 text-sm">
            <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Verified Employers</div>
            <div className="flex items-center gap-2"><Shield size={16} className="text-blue-500" /> Visa Sponsorship</div>
          </div>
        </div>
      </section>

      {/* ── AD 1 ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <AdUnit slot="4198231153" format="auto" />
      </div>

      {/* ── FEATURED JOBS ── */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Gulf Jobs</h2>
            <Link href="/jobs" className="text-blue-600 font-semibold flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.slice(0, 6).map((job: any) => (
              <Link key={job.id} href={`/jobs/${job.slug}`} className="p-6 rounded-2xl border border-gray-200 hover:border-blue-500 transition-all shadow-sm">
                <h3 className="font-bold text-gray-900 mb-1">{job.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{job.company?.name || 'Top Employer'}</p>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase">
                  {job.location?.name || 'GCC Region'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW LINE: JOBS BY GCC COUNTRY ── */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Jobs by GCC Country</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GCC_REGIONS.map((region) => (
              <Link 
                key={region.slug}
                href={`/jobs?search=${region.name}`}
                className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Globe size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900">{region.name}</h3>
                </div>
                <p className="text-xs text-gray-500 ml-11">{region.cities}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── AD 2 ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <AdUnit slot="4690286797" format="fluid" layout="in-article" />
      </div>

      {/* ── NEW LINE: TOP GULF INDUSTRIES ── */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Top Gulf Industries</h2>
          <div className="flex flex-wrap gap-3">
            {GULF_INDUSTRIES.map((ind) => (
              <Link 
                key={ind.slug}
                href={`/jobs?search=${ind.title}`}
                className="px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
              >
                {ind.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Common Questions</h2>
          <div className="space-y-4">
            {GULF_FAQS.map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-gray-200">
                <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-gray-900 list-none">
                  {faq.question}
                  <PlusCircle size={20} className="text-blue-600 group-open:rotate-45 transition-all" />
                </summary>
                <div className="px-6 pb-6 text-sm text-gray-600 border-t border-gray-50 pt-4">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm mb-4">© 2026 JobMeter Gulf. Tax-free careers in the Middle East.</p>
          <div className="flex justify-center gap-6 text-xs font-medium">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/about" className="hover:text-white">About</Link>
          </div>
        </div>
      </footer>

      {authModalOpen && <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />}
      {recruiterModalOpen && <RecruiterAuthModal open={recruiterModalOpen} onOpenChange={setRecruiterModalOpen} />}
    </div>
  );
}
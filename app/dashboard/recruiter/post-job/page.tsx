"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';
import { Loader2, CheckCircle2 } from 'lucide-react';

const SECTORS = [
  'Information Technology & Software',
  'Engineering & Manufacturing',
  'Finance & Banking',
  'Healthcare & Medical',
  'Education & Training',
  'Sales & Marketing',
  'Human Resources & Recruitment',
  'Customer Service & Support',
  'Media, Advertising & Communications',
  'Design, Arts & Creative',
  'Construction & Real Estate',
  'Logistics, Transport & Supply Chain',
  'Agriculture & Agribusiness',
  'Energy & Utilities (Oil, Gas, Renewable Energy)',
  'Legal & Compliance',
  'Government & Public Administration',
  'Retail & E-commerce',
  'Hospitality & Tourism',
  'Science & Research',
  'Security & Defense',
  'Telecommunications',
  'Nonprofit & NGO',
  'Environment & Sustainability',
  'Product Management & Operations',
  'Data & Analytics',
];

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];

export default function RecruiterPostJobPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState(SECTORS[0]);
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState(EMPLOYMENT_TYPES[0]);
  const [description, setDescription] = useState('');
  const [applyInApp, setApplyInApp] = useState(true);
  const [screeningEnabled, setScreeningEnabled] = useState(false);
  const [screeningIncludesWritten, setScreeningIncludesWritten] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth?redirect=/dashboard/recruiter/post-job');
        return;
      }
      setUserId(session.user.id);
      setChecking(false);
    };
    init();
  }, [router]);

  const handleSubmit = async () => {
    if (!userId || !title.trim() || !description.trim() || !location.trim()) {
      setError('Please fill in title, location, and description.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/recruiter/post-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title,
          companyName,
          sector,
          location,
          employmentType,
          description,
          applyInApp,
          screeningEnabled,
          screeningIncludesWritten,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit job');
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={28} color={theme.colors.primary.DEFAULT} />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle2 className="mx-auto mb-4" size={48} color={theme.colors.primary.DEFAULT} />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Job submitted for review</h1>
          <p className="text-gray-600 mb-6">
            We'll review it shortly and publish it once approved. You'll see it on your
            dashboard either way.
          </p>
          <a
            href="/dashboard/recruiter"
            className="inline-block px-6 py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: theme.colors.primary.DEFAULT }}
          >
            Go to dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Post a job</h1>
        <p className="text-gray-500 text-sm mb-6">
          Submissions go to review before they go live. You'll be able to track status on your dashboard.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Warehouse Supervisor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company name <span className="text-gray-400 font-normal">(optional — leave blank to post as confidential)</span>
            </label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Leave blank for a confidential listing"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SECTORS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Dubai, UAE"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Role responsibilities, requirements, etc."
            />
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={applyInApp}
                onChange={(e) => {
                  setApplyInApp(e.target.checked);
                  if (!e.target.checked) setScreeningEnabled(false);
                }}
              />
              Let candidates apply directly on JobMeter
            </label>

            {applyInApp && (
              <>
                <label className="flex items-center gap-2 text-sm text-gray-700 pl-6">
                  <input
                    type="checkbox"
                    checked={screeningEnabled}
                    onChange={(e) => setScreeningEnabled(e.target.checked)}
                  />
                  Add a screening quiz (paid add-on — candidates must pass before applying)
                </label>

                {screeningEnabled && (
                  <label className="flex items-center gap-2 text-sm text-gray-700 pl-12">
                    <input
                      type="checkbox"
                      checked={screeningIncludesWritten}
                      onChange={(e) => setScreeningIncludesWritten(e.target.checked)}
                    />
                    Include written questions (AI-graded)
                  </label>
                )}
              </>
            )}
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 rounded-lg text-white font-medium disabled:opacity-60"
            style={{ backgroundColor: theme.colors.primary.DEFAULT }}
          >
            {submitting ? 'Submitting...' : 'Submit for review'}
          </button>
        </div>
      </div>
    </div>
  );
}

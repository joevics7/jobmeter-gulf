"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';
import { Loader2, Users, Plus } from 'lucide-react';

interface RecruiterJob {
  id: string;
  title: string;
  status: string;
  apply_in_app: boolean;
  screening_enabled: boolean;
  created_at: string;
  applicant_count: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_review: { label: 'Pending review', color: '#B45309' },
  active: { label: 'Live', color: '#16A34A' },
  rejected: { label: 'Rejected', color: '#DC2626' },
  expired: { label: 'Expired', color: '#6B7280' },
  expired_indexed: { label: 'Expired', color: '#6B7280' },
};

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth?redirect=/dashboard/recruiter');
        return;
      }

      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title, status, apply_in_app, screening_enabled, created_at')
        .eq('posted_by_user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (jobsError || !jobsData) {
        setLoading(false);
        return;
      }

      const jobIds = jobsData.map((j) => j.id);
      const counts: Record<string, number> = {};
      if (jobIds.length > 0) {
        const { data: apps } = await supabase
          .from('applications')
          .select('job_id')
          .in('job_id', jobIds);
        (apps || []).forEach((a: any) => {
          counts[a.job_id] = (counts[a.job_id] || 0) + 1;
        });
      }

      setJobs(
        jobsData.map((j: any) => ({ ...j, applicant_count: counts[j.id] || 0 }))
      );
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={28} color={theme.colors.primary.DEFAULT} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Your jobs</h1>
          <Link
            href="/dashboard/recruiter/post-job"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: theme.colors.primary.DEFAULT }}
          >
            <Plus size={16} /> Post a job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            You haven't posted any jobs yet.
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => {
              const statusInfo = STATUS_LABELS[job.status] || { label: job.status, color: '#6B7280' };
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between"
                >
                  <div>
                    <h2 className="font-medium text-gray-900">{job.title}</h2>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span
                        className="px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${statusInfo.color}15`, color: statusInfo.color }}
                      >
                        {statusInfo.label}
                      </span>
                      {job.apply_in_app && (
                        <span className="text-gray-500">
                          {job.screening_enabled ? 'In-app + quiz' : 'In-app apply'}
                        </span>
                      )}
                    </div>
                  </div>
                  {job.apply_in_app ? (
                    <Link
                      href={`/dashboard/recruiter/jobs/${job.id}/applicants`}
                      className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <Users size={15} />
                      {job.applicant_count} applicant{job.applicant_count !== 1 ? 's' : ''}
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-400">External apply</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

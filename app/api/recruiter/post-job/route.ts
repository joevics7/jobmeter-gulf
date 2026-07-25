import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();
    const {
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
    } = body;

    if (!userId || !title?.trim() || !description?.trim() || !location?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: job, error: insertError } = await supabase
      .from('jobs')
      .insert({
        title: title.trim(),
        company: companyName?.trim() ? { name: companyName.trim() } : null,
        sector,
        location: { city: location.trim() },
        employment_type: employmentType,
        description: description.trim(),
        status: 'pending_review',
        posted_by_user_id: userId,
        apply_in_app: !!applyInApp,
        screening_enabled: !!applyInApp && !!screeningEnabled,
        screening_includes_written: !!applyInApp && !!screeningEnabled && !!screeningIncludesWritten,
      })
      .select('id')
      .single();

    if (insertError || !job) {
      console.error('Job insert error:', insertError);
      return NextResponse.json({ error: 'Failed to submit job' }, { status: 500 });
    }

    return NextResponse.json({ jobId: job.id });
  } catch (err) {
    console.error('Recruiter post-job error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

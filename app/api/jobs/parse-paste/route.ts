import { NextRequest, NextResponse } from 'next/server';

// Mirrors the extraction schema used in app/api/jobs/process-submission/route.ts
// (callGeminiAI), but this route never touches the database — it only returns
// structured fields for the /submit form so the user can review and edit before
// actually submitting anything.

async function callGeminiAI(jobText: string): Promise<string> {
  const prompt = `You are an expert job parser. Parse the following job posting text and extract structured information.

Extract and enhance the following information:
1. Basic Information: title, sector
2. Company: name (only if 90% confident it's the real company name — otherwise null), website (if mentioned)
3. Location: city, state, country, remote status
4. Employment type - MUST be one of: Full-time, Part-time, Contract, Freelance, Internship
5. Experience level - Calculate from years mentioned and use ONLY one of these exact values (without the years):
   Entry-level, Junior, Mid-Level, Senior, Lead, Executive
   Calculation guide: 0-1 years = Entry-level, 1-3 years = Junior, 3-5 years = Mid-Level, 5-8 years = Senior, 8-10 years = Lead, 10+ years = Executive
6. Sector - MUST be exactly one of these 25 sectors:
   Information Technology & Software, Engineering & Manufacturing, Finance & Banking, Healthcare & Medical, Education & Training, Sales & Marketing, Human Resources & Recruitment, Customer Service & Support, Media, Advertising & Communications, Design, Arts & Creative, Construction & Real Estate, Logistics, Transport & Supply Chain, Agriculture & Agribusiness, Energy & Utilities (Oil, Gas, Renewable Energy), Legal & Compliance, Government & Public Administration, Retail & E-commerce, Hospitality & Tourism, Science & Research, Security & Defense, Telecommunications, Nonprofit & NGO, Environment & Sustainability, Product Management & Operations, Data & Analytics
7. Skills required (comma-separated string)
8. Description (rewrite to be clear and professional, plain text)
9. Responsibilities (as a plain text list, one per line)
10. Qualifications (as a plain text list, one per line)
11. Benefits (as a plain text list, one per line)
12. Salary range (if mentioned)
13. Application details: url, email, phone (raw values, no mailto:/tel:/https:// prefixes)
14. Deadline (if mentioned, YYYY-MM-DD)

CRITICAL COMPANY NAME EXTRACTION RULES:
- ONLY extract a company name if you are 90% confident it's the actual company name
- DO NOT use generic terms like "leading company", "our company", "the company", "prestigious firm"
- If no clear company name is found, use null - this is perfectly acceptable

IMPORTANT: Return ONLY a valid JSON object, no markdown formatting, no code blocks, no explanations. Use this exact structure:
{
  "title": "string",
  "sector": "string (must be one of the 25 sectors)",
  "companyName": "string or null",
  "companyWebsite": "string or null",
  "city": "string",
  "state": "string",
  "remote": boolean,
  "employmentType": "string (Full-time, Part-time, Contract, Freelance, or Internship)",
  "experienceLevel": "string (Entry-level, Junior, Mid-Level, Senior, Lead, or Executive - NO YEARS)",
  "skills": "string (comma-separated)",
  "description": "string",
  "responsibilities": "string (one per line)",
  "qualifications": "string (one per line)",
  "benefits": "string (one per line)",
  "salaryMin": number or null,
  "salaryMax": number or null,
  "currency": "string",
  "period": "string (annually, monthly, etc.)",
  "applicationUrl": "string or empty",
  "applicationEmail": "string or empty",
  "applicationPhone": "string or empty",
  "deadline": "string (YYYY-MM-DD) or empty"
}

Job text to parse:
${jobText}`;

  const models = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
  ];

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      }
      throw new Error('Invalid response format from Gemini API');
    } catch (error) {
      console.error(`Model ${model} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

export async function POST(req: NextRequest) {
  try {
    const { rawContent } = await req.json();
    if (!rawContent || !rawContent.trim()) {
      return NextResponse.json({ error: 'Please paste a job description first' }, { status: 400 });
    }

    const aiResponse = await callGeminiAI(rawContent);
    let jsonResponse = aiResponse.trim();

    if (jsonResponse.includes('```json')) {
      const m = jsonResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (m) jsonResponse = m[1];
    } else if (jsonResponse.includes('```')) {
      const m = jsonResponse.match(/```\s*([\s\S]*?)\s*```/);
      if (m) jsonResponse = m[1];
    }
    jsonResponse = jsonResponse.trim();

    const objMatch = jsonResponse.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(objMatch ? objMatch[0] : jsonResponse);

    return NextResponse.json({ parsed });
  } catch (err: any) {
    console.error('parse-paste error:', err);
    return NextResponse.json(
      { error: err.message || "Couldn't parse that. Try filling the form manually instead." },
      { status: 500 }
    );
  }
}

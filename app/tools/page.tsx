import React from 'react';
import Link from 'next/link';
import {
  FileText, FileCheck, Search, Shield, Calculator, MessageCircle,
  GraduationCap, ArrowRight, Briefcase, Brain, Globe, MapPin,
  DollarSign, Plane, Home, BookOpen, Award, BarChart2, Users,
  RefreshCw, CreditCard, Landmark, Star, TrendingUp, ClipboardList,
  CheckSquare, Navigation, Flag, Wallet
} from 'lucide-react';
import { theme } from '@/lib/theme';
import { Metadata } from 'next';
import AdUnit from '@/components/ads/AdUnit';

export const revalidate = false;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gulf.jobmeter.app';

export const metadata: Metadata = {
  title: 'Career Tools — Free AI-Powered Job Search Tools | JobMeter',
  description: 'Free AI-powered career tools: CV checker, keyword analyzer, ATS review, interview practice, career coach, salary calculator, scam detector and more.',
  keywords: ['career tools', 'job tools', 'CV checker', 'ATS review', 'interview practice', 'salary calculator', 'scam detector', 'career coach'],
  openGraph: {
    title: 'Career Tools — Free AI-Powered Job Search Tools | JobMeter',
    description: 'Free AI-powered career tools: CV checker, keyword analyzer, ATS review, interview practice, career coach, salary calculator, scam detector and more.',
    type: 'website',
    url: `${siteUrl}/tools`,
    siteName: 'JobMeter',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Career Tools — Free AI-Powered Job Search Tools | JobMeter',
    description: 'Free AI-powered career tools: CV checker, keyword analyzer, ATS review, interview practice, career coach, salary calculator, scam detector and more.',
  },
  alternates: {
    canonical: `${siteUrl}/tools`,
  },
};

interface Tool {
  id: string; title: string; description: string; icon: React.ComponentType<any>; color: string; route?: string;
}

interface ToolCategory {
  id: string; title: string; description: string; icon: React.ComponentType<any>; color: string; tools: Tool[];
}

export default function ToolsPage() {
  const categories: ToolCategory[] = [
    {
      id: 'career-tools', title: 'Career Tools', description: 'Tools to help advance your career', icon: Briefcase, color: '#F59E0B',
      tools: [
        { id: 'interview', title: 'Interview Practice', description: 'Practice with personalized questions based on job descriptions', icon: MessageCircle, color: '#8B5CF6', route: '/tools/interview' },
        { id: 'quiz', title: 'Recruitment Assessment Practice Tests', description: 'Practice aptitude tests from top companies', icon: Brain, color: '#EC4899', route: '/tools/quiz' },
        { id: 'job-offer-evaluator', title: 'Job Offer Evaluator', description: 'Evaluate and compare Gulf job offers to make the best decision', icon: ClipboardList, color: '#F59E0B', route: '/tools/job-offer-evaluator' },
        { id: 'profession-country-match', title: 'Profession Country Match', description: 'Find the best Gulf country for your profession and skills', icon: Globe, color: '#10B981', route: '/tools/profession-country-match' },
        { id: 'certification-roadmap', title: 'Certification Roadmap', description: 'Plan your professional certifications for Gulf career growth', icon: Award, color: '#6366F1', route: '/tools/certification-roadmap' },
        { id: 'education-equivalency-checker', title: 'Education Equivalency Checker', description: 'Check how your degree is recognized across Gulf countries', icon: GraduationCap, color: '#0EA5E9', route: '/tools/education-equivalency-checker' },
        { id: 'ielts-checker', title: 'IELTS Checker', description: 'Verify IELTS score requirements for Gulf jobs and visas', icon: BookOpen, color: '#14B8A6', route: '/tools/ielts-checker' },
        { id: 'saudi-profession-classifier', title: 'Saudi Profession Classifier', description: 'Classify your job under Saudi Arabia\'s official profession codes', icon: CheckSquare, color: '#8B5CF6', route: '/tools/saudi-profession-classifier' },
      ],
    },
    {
      id: 'gulf-compliance', title: 'Gulf Compliance & Visa', description: 'Navigate Gulf regulations, visas, and work permits', icon: Shield, color: '#EF4444',
      tools: [
        { id: 'noc-job-change-checker', title: 'NOC & Job Change Checker', description: 'Check NOC requirements and job change rules by Gulf country', icon: RefreshCw, color: '#EF4444', route: '/tools/noc-job-change-checker' },
        { id: 'gcc-comparison', title: 'GCC Country Comparison', description: 'Compare living, working, and salary conditions across GCC countries', icon: BarChart2, color: '#3B82F6', route: '/tools/gcc-comparison' },
        { id: 'nitaqat-checker', title: 'Nitaqat Checker', description: 'Check Nitaqat Saudization category for Saudi employers', icon: Flag, color: '#DC2626', route: '/tools/nitaqat-checker' },
        { id: 'saudi-visa-calculator', title: 'Saudi Visa Calculator', description: 'Estimate visa fees and requirements for Saudi Arabia', icon: Plane, color: '#F97316', route: '/tools/saudi-visa-calculator' },
        { id: 'uae-job-seeker-visa', title: 'UAE Job Seeker Visa', description: 'Check eligibility and requirements for the UAE job seeker visa', icon: Navigation, color: '#0891B2', route: '/tools/uae-job-seeker-visa' },
      ],
    },
    {
      id: 'salary-tools', title: 'Salary & Financial Tools', description: 'Calculate salaries, benefits, and financial planning for the Gulf', icon: Calculator, color: '#3B82F6',
      tools: [
        { id: 'salary-benchmark', title: 'Salary Benchmark', description: 'Compare your salary against Gulf market rates by role and country', icon: TrendingUp, color: '#10B981', route: '/tools/salary-benchmark' },
        { id: 'take-home-pay-calculator', title: 'Take-Home Pay Calculator', description: 'Calculate your net salary after Gulf country deductions', icon: DollarSign, color: '#3B82F6', route: '/tools/take-home-pay-calculator' },
        { id: 'saudi-dependent-levy', title: 'Saudi Dependent Levy Calculator', description: 'Calculate monthly dependent fees for expats in Saudi Arabia', icon: Users, color: '#7C3AED', route: '/tools/saudi-dependent-levy' },
        { id: 'saudi-eosb-calculator', title: 'Saudi EOSB Calculator', description: 'Calculate your end-of-service benefit under Saudi labor law', icon: Landmark, color: '#059669', route: '/tools/saudi-eosb-calculator' },
        { id: 'uae-gratuity-calculator', title: 'UAE Gratuity Calculator', description: 'Calculate your UAE end-of-service gratuity entitlement', icon: CreditCard, color: '#0EA5E9', route: '/tools/uae-gratuity-calculator' },
        { id: 'iqama-cost-calculator', title: 'Iqama Cost Calculator', description: 'Estimate the full cost of Iqama sponsorship in Saudi Arabia', icon: Star, color: '#D97706', route: '/tools/iqama-cost-calculator' },
      ],
    },
    {
      id: 'relocation-tools', title: 'Relocation Tools', description: 'Plan your move to the Gulf with confidence', icon: MapPin, color: '#10B981',
      tools: [
        { id: 'relocation-budget-planner', title: 'Relocation Budget Planner', description: 'Plan and estimate your total relocation costs to any Gulf city', icon: Wallet, color: '#10B981', route: '/tools/relocation-budget-planner' },
        { id: 'cost-of-living', title: 'Cost of Living Comparison', description: 'Compare cost of living across Gulf cities and your home country', icon: Home, color: '#F59E0B', route: '/tools/cost-of-living' },
        { id: 'remittance-estimator', title: 'Remittance Estimator', description: 'Estimate money transfer costs and rates from Gulf countries', icon: RefreshCw, color: '#6366F1', route: '/tools/remittance-estimator' },
      ],
    },
  ];

  const totalTools = categories.reduce((sum, category) => sum + category.tools.length, 0);
  const showMiddleAd = totalTools >= 14;

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.muted }}>
      {/* Header */}
      <div className="pt-12 pb-10 px-6" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: theme.colors.text.light }}>Career Tools</h1>
        </div>
      </div>

      {/* ── AD 1: Top banner ── */}
      <div className="px-4 md:px-6 pt-6 max-w-6xl mx-auto">
        <AdUnit slot="4198231153" format="auto" />
      </div>

      <div className="px-4 md:px-6 py-8 max-w-6xl mx-auto">
        <div className="space-y-12">
          {categories.map((category, index) => {
            const CategoryIcon = category.icon;
            return (
              <React.Fragment key={category.id}>
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${category.color}15` }}>
                      <CategoryIcon size={24} style={{ color: category.color }} />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">{category.title}</h2>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.tools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <Link
                          key={tool.id}
                          href={tool.route || '#'}
                          className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 flex items-start gap-4 group"
                          style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}
                        >
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${tool.color}15` }}>
                            <Icon size={22} style={{ color: tool.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{tool.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{tool.description}</p>
                          </div>
                          <ArrowRight size={18} className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                        </Link>
                      );
                    })}
                  </div>
                </section>

                {/* ── Conditional Middle AD ── */}
                {showMiddleAd && index === 1 && (
                  <div className="py-2">
                    <AdUnit slot="8181708196" format="fluid" layout="in-article" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── AD 3: Bottom banner ── */}
        <div className="mt-12">
          <AdUnit slot="9751041788" format="auto" />
        </div>
      </div>
    </div>
  );
}
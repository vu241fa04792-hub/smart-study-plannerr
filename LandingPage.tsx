import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Timer,
  BarChart3,
  BookOpen,
  ChevronDown,
  Clock,
  Flame,
  FileText,
  CheckSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const { currentUser, enterDemoMode } = useApp();
  const navigate = useNavigate();

  const heroWorkspaceImage = '/src/assets/images/hero_student_workspace_1792929824850.jpg';

  const features = [
    {
      title: 'Smart Task & Assignment Queue',
      desc: 'Organize coursework by priority (Low, Medium, High, Urgent), deadlines, and tags. Never miss another project submission.',
      targetRoute: '/app/tasks',
      icon: CheckSquare,
      highlights: [
        'Urgent & High priority visual color cues',
        'Filter by Due Today, Upcoming, and Overdue',
        'Custom estimated study duration and tags'
      ]
    },
    {
      title: 'Subject Hub & Syllabus Tracker',
      desc: 'Track syllabus topics unit by unit, monitor syllabus completion percentages, and associate notes with courses.',
      targetRoute: '/app/subjects',
      icon: BookOpen,
      highlights: [
        'Detailed unit-by-unit syllabus checklist',
        'Dynamic completion progress bars',
        'Custom subject colors and lecture locations'
      ]
    },
    {
      title: 'Scientifically-Tuned Pomodoro',
      desc: 'Deep work focus timer with configurable intervals, native sound chimes, and a distraction-free fullscreen mode.',
      targetRoute: '/app/focus',
      icon: Timer,
      highlights: [
        'Standard 25/5/15 min intervals or custom durations',
        'Distraction-free fullscreen focus workspace',
        'Web Audio API chime notifications with zero external lag'
      ]
    },
    {
      title: 'AI Study Plan Generator',
      desc: 'Formulate an optimized weekly timetable tailored to your upcoming exam dates, daily hours, and peak cognitive rhythms.',
      targetRoute: '/app/planner',
      icon: Sparkles,
      highlights: [
        'Personalized daily study sessions with break times',
        'Convert generated schedules into real tasks & calendar blocks',
        'Spaced repetition and active recall suggestions'
      ]
    },
    {
      title: 'Integrated Exam & Deadlines Calendar',
      desc: 'Visualize upcoming midterms, lab evaluations, and project milestones in unified month, week, and day views.',
      targetRoute: '/app/calendar',
      icon: Calendar,
      highlights: [
        'Color-coded event categories (Exams, Assignments, Study Sessions)',
        'Click-to-add tasks directly for any calendar date',
        'Detailed assessment rooms and weightage badges'
      ]
    },
    {
      title: 'Notes & Educational File Management',
      desc: 'Rich lecture notes with persistent PDF, PPTX, DOCX, and image file attachments stored safely in your browser via IndexedDB.',
      targetRoute: '/app/notes',
      icon: FileText,
      highlights: [
        'Persistent file uploads backed by IndexedDB',
        'Fast in-browser file preview and download options',
        'Pin important notes and star favorite revision sheets'
      ]
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Add Your Subjects & Syllabus',
      description: 'Enter your semester courses, breakdown each syllabus topic, and set your target weekly focus hours.'
    },
    {
      number: '02',
      title: 'Generate or Schedule Your Focus Routine',
      description: 'Use the AI Study Planner or create custom coursework tasks, then start focused Pomodoro sessions.'
    },
    {
      number: '03',
      title: 'Track Streaks & Master Your Exams',
      description: 'Upload your lecture resources, review progress analytics, unlock achievements, and ace your assessments.'
    }
  ];

  const faqs = [
    {
      q: 'How does Smart Study Planner store my coursework and uploaded files?',
      a: 'Smart Study Planner runs client-side and stores your tasks, subjects, calendar events, and notes in localStorage. Real uploaded files (PDFs, PPTXs, DOCXs, and images) and profile photos are securely stored directly in your browser using native IndexedDB, so they remain fully intact across page refreshes and sessions.'
    },
    {
      q: 'Can multiple students use this on the same computer?',
      a: 'Yes! Smart Study Planner features full account isolation. Every registered student gets their own isolated workspace and unique user ID. Switching accounts or creating a new profile gives you a completely separate, clean dashboard without cross-account data leakage.'
    },
    {
      q: 'How does the AI Study Plan Generator work?',
      a: 'Our smart algorithm analyzes your exam deadlines, available daily study hours, preferred peak study times (morning, afternoon, evening, or night), and subject syllabus loads to formulate an optimal weekly timetable. You can even convert the generated plan into real calendar events and tasks with one click!'
    },
    {
      q: 'Can I upload lecture slides and past exam papers?',
      a: 'Yes. The Notes & Resources section allows you to upload PDFs, PPT/PPTX slide decks, Word documents, text files, and images. Each file has options to preview, rename, download, or associate with specific study notes.'
    },
    {
      q: 'Does it support Dark Mode?',
      a: 'Yes! Smart Study Planner features complete Light Mode and Dark Mode support with an instant toggle in the header and appearance settings.'
    }
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreFeature = (feature: typeof features[0]) => {
    if (currentUser) {
      navigate(feature.targetRoute);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(feature.targetRoute)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FD] dark:bg-slate-950 text-[#1E1B4B] dark:text-slate-100 flex flex-col selection:bg-purple-100 selection:text-purple-900 transition-colors duration-200">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-[#E5E7F0] dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark with icon */}
          <NavLink to="/" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <GraduationCap className="w-5 h-5 transition-transform group-hover:scale-105" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-[#1E1B4B] dark:text-white">
              Smart Study Planner
            </span>
          </NavLink>

          {/* Zone 2: Navigation links: Features, How It Works, and FAQ */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a
              href="#features"
              onClick={(e) => scrollToSection(e, 'features')}
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors whitespace-nowrap cursor-pointer"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors whitespace-nowrap cursor-pointer"
            >
              How It Works
            </a>
            <a
              href="#faq"
              onClick={(e) => scrollToSection(e, 'faq')}
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors whitespace-nowrap cursor-pointer"
            >
              FAQ
            </a>
          </nav>

          {/* Zone 3: Sign In & Start Planning Free */}
          <div className="flex items-center gap-3 shrink-0">
            <NavLink
              to="/login"
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors whitespace-nowrap"
            >
              Sign In
            </NavLink>
            <NavLink
              to="/register"
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              Start Planning Free
            </NavLink>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28">
        {/* Soft pastel background shapes */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-6 space-y-6 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/70 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Plan Smart. Study Better. Achieve More.</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1E1B4B] dark:text-white leading-[1.12] text-balance">
                Study Smarter.{' '}
                <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 dark:from-purple-400 dark:via-indigo-400 dark:to-purple-200 bg-clip-text text-transparent">
                  Achieve More.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl text-balance">
                Your all-in-one student workspace to manage assignments, break down syllabi, focus with Pomodoro intervals, upload study files, and conquer exams.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <NavLink
                  to="/register"
                  className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span>Start Planning Free</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </NavLink>

                <button
                  type="button"
                  onClick={() => {
                    enterDemoMode();
                    navigate('/app');
                  }}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm transition-all cursor-pointer"
                >
                  Open Live Demo
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6 pt-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Account Isolation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>IndexedDB File Storage</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Works 100% Offline</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Hero Workspace Preview & Floating Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-6 relative"
            >
              <div className="relative rounded-3xl bg-white dark:bg-slate-900 p-3 shadow-2xl border border-purple-100/80 dark:border-slate-800 overflow-hidden">
                <img
                  src={heroWorkspaceImage}
                  alt="Student study workspace setup"
                  referrerPolicy="no-referrer"
                  className="w-full h-72 sm:h-80 object-cover rounded-2xl"
                />

                {/* Floating Card 1: Study Streak */}
                <div className="absolute top-6 left-6 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800 flex items-center justify-center text-amber-500">
                    <Flame className="w-5 h-5 fill-amber-500" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Daily Streak</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">7 Days Active 🔥</span>
                  </div>
                </div>

                {/* Floating Card 2: Study Hours */}
                <div className="absolute bottom-6 left-6 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">This Week Focus</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">28.5 Hours Logged</span>
                  </div>
                </div>

                {/* Floating Card 3: Upcoming Exam */}
                <div className="absolute top-16 right-6 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 max-w-[210px]">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800 flex items-center justify-center text-rose-500 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">In 3 Days</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">DSA Midterm Exam</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Feature Cards Section */}
      <section id="features" className="py-20 md:py-28 max-w-7xl mx-auto px-6 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200/60 dark:border-purple-800">
            Comprehensive Toolkit
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] dark:text-white">
            Engineered for Modern College Life
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Everything you need to organize courses, manage assignments, build deep focus, and store educational files in one harmonious workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#E5E7F0] dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{f.desc}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleExploreFeature(f)}
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Explore feature</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#F1F3FB] dark:bg-slate-900/60 border-y border-[#E5E7F0] dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-800">
              Effortless Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] dark:text-white">
              Master Your Semester in Three Steps
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              A structured routine that eliminates last-minute cramming and academic anxiety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((st, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-[#E5E7F0] dark:border-slate-800 shadow-sm space-y-4 relative">
                <span className="text-3xl font-extrabold text-purple-600/30 dark:text-purple-400/30 font-mono">{st.number}</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{st.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{st.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQs Section */}
      <section id="faq" className="py-20 bg-white dark:bg-slate-950 border-t border-[#E5E7F0] dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Got Questions?</span>
            <h2 className="text-3xl font-extrabold text-[#1E1B4B] dark:text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      activeFaq === idx ? 'rotate-180 text-purple-600 dark:text-purple-400' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Final Call to Action */}
      <section className="py-20 bg-gradient-to-br from-purple-700 via-indigo-700 to-purple-900 text-white relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-purple-200 text-xs font-bold border border-white/20">
            <GraduationCap className="w-4 h-4" />
            <span>Plan Smart. Study Better. Achieve More.</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Start Planning Better Today.
          </h2>

          <p className="text-base text-purple-100 max-w-xl mx-auto leading-relaxed">
            Elevate your academic semester with intelligent planning, deep work timers, and organized study files.
          </p>

          <div className="pt-2">
            <NavLink
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-purple-900 bg-white hover:bg-purple-50 shadow-xl transition-all cursor-pointer"
            >
              <span>Launch Smart Study Planner Free</span>
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-[#E5E7F0] dark:border-slate-800 py-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">Smart Study Planner</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-purple-600 dark:hover:text-purple-400">Features</a>
            <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="hover:text-purple-600 dark:hover:text-purple-400">How It Works</a>
            <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="hover:text-purple-600 dark:hover:text-purple-400">FAQ</a>
            <NavLink to="/app" className="hover:text-purple-600 dark:hover:text-purple-400">Dashboard</NavLink>
            <NavLink to="/login" className="hover:text-purple-600 dark:hover:text-purple-400">Sign In</NavLink>
          </div>

          <p>© {new Date().getFullYear()} Smart Study Planner. All rights reserved.</p>
        </div>
      </footer>



    </div>
  );
};

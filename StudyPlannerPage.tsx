import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  Brain,
  Coffee,
  RotateCcw,
  Save,
  CalendarPlus,
  Trash2,
  ListChecks,
  Bookmark
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GeneratedStudyPlan } from '../types';

export const StudyPlannerPage: React.FC = () => {
  const {
    subjects,
    currentUser,
    saveStudyPlan,
    studyPlans,
    deleteStudyPlan,
    convertPlanToTasksAndEvents,
    showToast
  } = useApp();

  // Inputs
  const [goal, setGoal] = useState('Score 95%+ in Data Structures & DBMS Midterms');
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(() =>
    subjects.slice(0, 3).map((s) => s.id)
  );
  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'intensive'>(
    'intermediate'
  );
  const [preferredTime, setPreferredTime] = useState<'morning' | 'afternoon' | 'evening' | 'night'>(
    'morning'
  );

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedStudyPlan | null>(null);

  const generationSteps = [
    'Analyzing target exam timeline and syllabus volume...',
    'Distributing cognitive load across active courses...',
    'Scheduling spaced repetition intervals and active recall drills...',
    'Synthesizing personalized daily focus schedules...'
  ];

  const handleToggleSubject = (subId: string) => {
    if (selectedSubjects.includes(subId)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((id) => id !== subId));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, subId]);
    }
  };

  const handleGeneratePlan = () => {
    if (selectedSubjects.length === 0) {
      showToast('Subject Required', 'Please select at least one subject.', 'warning');
      return;
    }

    setIsGenerating(true);
    setGenerationStep(0);

    const interval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev >= generationSteps.length - 1) {
          clearInterval(interval);
          finishPlanGeneration();
          return prev;
        }
        return prev + 1;
      });
    }, 500);
  };

  const finishPlanGeneration = () => {
    const chosenSubjects = subjects.filter((s) => selectedSubjects.includes(s.id));
    const subNames = chosenSubjects.map((s) => s.name);

    const timeOffsets =
      preferredTime === 'morning'
        ? ['08:30 AM', '10:00 AM', '11:30 AM', '02:00 PM']
        : preferredTime === 'afternoon'
        ? ['01:30 PM', '03:00 PM', '04:30 PM', '06:30 PM']
        : preferredTime === 'evening'
        ? ['05:30 PM', '07:00 PM', '08:30 PM', '10:00 PM']
        : ['08:00 PM', '09:30 PM', '11:00 PM', '12:30 AM'];

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const weeklySchedule = daysOfWeek.map((day, dIdx) => {
      const primarySub = chosenSubjects[dIdx % chosenSubjects.length]?.name || subNames[0] || 'Core Subject';
      const secondarySub = chosenSubjects[(dIdx + 1) % chosenSubjects.length]?.name || subNames[0] || 'Core Subject';

      return {
        day,
        sessions: [
          {
            time: timeOffsets[0],
            subject: primarySub,
            topic: `Core Theory & Algorithmic Foundations (Block ${dIdx + 1})`,
            durationMinutes: 50,
            type: 'deep_work' as const
          },
          {
            time: timeOffsets[1],
            subject: primarySub,
            topic: 'Active Recall, Problem Sets & Code Drill',
            durationMinutes: 45,
            type: 'practice' as const
          },
          {
            time: timeOffsets[2],
            subject: 'Cognitive Recovery',
            topic: 'Hydration, light walk, eye relaxation',
            durationMinutes: 15,
            type: 'break' as const
          },
          {
            time: timeOffsets[3],
            subject: secondarySub,
            topic: 'Spaced Repetition & Flashcard Synthesis',
            durationMinutes: 45,
            type: 'revision' as const
          }
        ]
      };
    });

    const newPlan: GeneratedStudyPlan = {
      id: 'plan-' + Date.now(),
      userId: currentUser?.id || 'demo-user',
      goal,
      examDate,
      selectedSubjects,
      hoursPerDay,
      difficulty,
      preferredTime,
      createdAt: new Date().toISOString().split('T')[0],
      weeklySchedule,
      revisionTips: [
        'Utilize Feynman Technique: Explain tough algorithms out loud to test depth of understanding.',
        'Apply 3-2-1 Spaced Interval: Review new formulas after 3 hours, 2 days, and 1 week.',
        'Active Recall over Passive Rereading: Solve past paper questions before reading solutions.'
      ],
      priorityChecklist: [
        `Complete all unsolved exercises in ${subNames[0] || 'Core Subject'}`,
        'Build one-page formula cheatsheets for midterms',
        'Review edge cases and logarithmic complexities',
        'Simulate a timed mock exam 48 hours prior to official date'
      ]
    };

    setGeneratedPlan(newPlan);
    setIsGenerating(false);
    showToast('AI Plan Ready! 🎓', 'Your balanced weekly timetable has been generated.', 'success');
  };

  const handleSaveToActive = () => {
    if (!generatedPlan) return;
    saveStudyPlan(generatedPlan);
  };

  const handleConvertToSchedule = (plan: GeneratedStudyPlan) => {
    convertPlanToTasksAndEvents(plan);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Smart Study Assistant</span>
            </span>
            <span className="text-xs text-slate-400">· Automated Timetable Synthesizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] dark:text-slate-100 tracking-tight">
            AI Study Plan Generator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Formulate an optimized revision timetable, then convert it directly into real tasks and calendar blocks.
          </p>
        </div>
      </div>

      {/* 2. Interactive Parameters Builder */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Goal & Subjects */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Primary Academic Goal or Target Exam *
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Master Operating Systems & Database Midterms with Grade A"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800"
              />
            </div>

            {/* Subjects Multi-select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Select Target Subjects ({selectedSubjects.length} chosen)
              </label>
              <div className="flex flex-wrap gap-2">
                {subjects.map((sub) => {
                  const isSelected = selectedSubjects.includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleToggleSubject(sub.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border cursor-pointer ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: sub.color }}
                      />
                      <span>{sub.name}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Exam Date & Hours */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Target Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                <span>Daily Study Hours</span>
                <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                  {hoursPerDay} hours/day
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={8}
                step={0.5}
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Intensity & Time */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Syllabus Intensity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'beginner', label: 'Moderate' },
                  { id: 'intermediate', label: 'Balanced' },
                  { id: 'intensive', label: 'Sprint Mode' }
                ] as const
              ).map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setDifficulty(lvl.id)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    difficulty === lvl.id
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Cognitive Peak Period
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['morning', 'afternoon', 'evening', 'night'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPreferredTime(t)}
                  className={`py-2 text-xs font-bold rounded-xl border capitalize transition-all ${
                    preferredTime === t
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Synthesizing Schedule...' : 'Generate My Study Plan'}</span>
          </button>
        </div>
      </div>

      {/* 3. Loading Step Visualizer */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-purple-100 dark:border-purple-900/50 shadow-sm text-center space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {generationSteps[generationStep]}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Balancing cognitive endurance curves & spaced retrieval intervals...
            </p>
          </div>
          <div className="w-64 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((generationStep + 1) / generationSteps.length) * 100}%` }}
            />
          </div>
        </motion.div>
      )}

      {/* 4. Generated Plan View */}
      {generatedPlan && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Plan Banner */}
          <div className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-purple-100 border border-white/20">
                Personalized Timetable Active
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold">{generatedPlan.goal}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-purple-200">
                <span>Target: {generatedPlan.examDate}</span>
                <span>·</span>
                <span>{generatedPlan.hoursPerDay} hrs daily focus</span>
                <span>·</span>
                <span className="capitalize">{generatedPlan.preferredTime} peak rhythm</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => handleConvertToSchedule(generatedPlan)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-md shadow-emerald-900/30 cursor-pointer"
                title="Populate your Tasks and Calendar from this plan"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Convert to Tasks & Calendar</span>
              </button>

              <button
                onClick={handleSaveToActive}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-purple-900 hover:bg-purple-50 transition-colors shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Plan</span>
              </button>

              <button
                onClick={handleGeneratePlan}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Regenerate</span>
              </button>
            </div>
          </div>

          {/* Weekly Schedule Days */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Weekly Study Sessions Breakdown
                </h3>
              </div>
              <span className="text-xs text-slate-400">Monday through Sunday</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {generatedPlan.weeklySchedule.map((dayPlan, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-700">
                    <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                      {dayPlan.day}
                    </span>
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                      {hoursPerDay}h Allocated
                    </span>
                  </div>

                  <div className="space-y-2">
                    {dayPlan.sessions.map((ses, sIdx) => (
                      <div
                        key={sIdx}
                        className={`p-2.5 rounded-xl border text-xs space-y-0.5 ${
                          ses.type === 'break'
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : ses.type === 'deep_work'
                            ? 'bg-purple-50/60 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-800 text-purple-900 dark:text-purple-200'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            {ses.time}
                          </span>
                          <span className="text-[10px] font-semibold">{ses.durationMinutes}m</span>
                        </div>
                        <p className="font-bold text-xs truncate">{ses.subject}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{ses.topic}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revision Strategies & Priority Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Cognitive & Spaced Repetition Rules
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {generatedPlan.revisionTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400 mt-1.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <ListChecks className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Pre-Exam Action Checklist
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {generatedPlan.priorityChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Saved Study Plans List */}
      {studyPlans.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Bookmark className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Saved Study Plans ({studyPlans.length})
            </h3>
          </div>

          <div className="space-y-3">
            {studyPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {plan.goal}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Target Exam: {plan.examDate} · {plan.hoursPerDay}h daily · Created {plan.createdAt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleConvertToSchedule(plan)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Convert to Schedule</span>
                  </button>
                  <button
                    onClick={() => deleteStudyPlan(plan.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Remove plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

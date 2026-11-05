import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Award, Flame, CheckCircle2, Zap, Sparkles, Timer, Target, Compass, Moon, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AchievementUnlockedModal: React.FC = () => {
  const { unlockedAchievementModal, setUnlockedAchievementModal } = useApp();

  if (!unlockedAchievementModal) return null;

  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'Flame':
        return <Flame className="w-10 h-10 text-amber-500" />;
      case 'Zap':
        return <Zap className="w-10 h-10 text-purple-600" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-10 h-10 text-emerald-500" />;
      case 'Sparkles':
        return <Sparkles className="w-10 h-10 text-indigo-500" />;
      case 'Timer':
        return <Timer className="w-10 h-10 text-rose-500" />;
      case 'Target':
        return <Target className="w-10 h-10 text-blue-500" />;
      case 'Compass':
        return <Compass className="w-10 h-10 text-teal-500" />;
      case 'Moon':
        return <Moon className="w-10 h-10 text-indigo-400" />;
      default:
        return <Award className="w-10 h-10 text-purple-600" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-purple-100 p-6 text-center relative overflow-hidden"
        >
          {/* Background pastel aura */}
          <div className="absolute -top-12 -left-12 w-36 h-36 bg-purple-200/50 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />

          <button
            onClick={() => setUnlockedAchievementModal(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-100 to-amber-100 border border-purple-200/60 shadow-inner mb-4">
            {renderIcon(unlockedAchievementModal.icon)}
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/60 mb-2">
            Achievement Unlocked!
          </span>

          <h3 className="text-xl font-bold text-slate-900 mb-1">{unlockedAchievementModal.title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            {unlockedAchievementModal.description}
          </p>

          <button
            onClick={() => setUnlockedAchievementModal(null)}
            className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
          >
            Claim & Keep Studying
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

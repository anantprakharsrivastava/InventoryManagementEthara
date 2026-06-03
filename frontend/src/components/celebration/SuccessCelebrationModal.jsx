import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, X } from 'lucide-react';

export default function SuccessCelebrationModal({ isOpen, title, message, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-3xl p-8 text-center"
            style={{
              background: 'rgba(12, 12, 22, 0.88)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 107, 74, 0.4)',
              boxShadow:
                '0 0 80px rgba(255, 107, 74, 0.3), 0 0 40px rgba(45, 212, 191, 0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,107,74,0.45) 0%, transparent 50%, rgba(45,212,191,0.35) 100%)',
              }}
            />

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors pointer-events-auto"
            >
              <X className="h-4 w-4" />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 400 }}
              className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full"
              style={{
                background: 'linear-gradient(135deg, #ff6b4a, #ffc857)',
                boxShadow: '0 0 40px rgba(255, 107, 74, 0.55)',
              }}
            >
              <CheckCircle2 className="h-10 w-10 text-white" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-1 rounded-full border border-dashed border-amber-400/50"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="relative"
            >
              <div className="mb-2 flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-400" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">
                  Success
                </span>
                <Sparkles className="h-4 w-4 text-amber-300" />
              </div>
              <h2
                className="text-2xl font-bold text-white mb-2"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                {title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
            </motion.div>

            <motion.div
              className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #ff6b4a, #ffc857, #2dd4bf)' }}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4, ease: 'linear' }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

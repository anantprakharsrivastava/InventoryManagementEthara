import { createContext, useContext, useState, useCallback, useRef } from 'react';
import Confetti from 'react-confetti';
import toast from 'react-hot-toast';
import { useWindowSize } from '../hooks/useWindowSize';
import { playSuccessSound } from '../utils/playSuccessSound';
import SuccessCelebrationModal from '../components/celebration/SuccessCelebrationModal';

export const CELEBRATION_TYPES = {
  PROJECT_CREATED: 'project_created',
  TASK_CREATED: 'task_created',
  TASK_COMPLETED: 'task_completed',
  SIGNUP_SUCCESS: 'signup_success',
};

const PRESETS = {
  [CELEBRATION_TYPES.PROJECT_CREATED]: {
    title: 'Project Launched!',
    message: 'Your new mission is live. Time to build something epic.',
    toast: 'Project created successfully!',
  },
  [CELEBRATION_TYPES.TASK_CREATED]: {
    title: 'Task Deployed!',
    message: 'Added to the board. Your crew can see it now.',
    toast: 'Task created successfully!',
  },
  [CELEBRATION_TYPES.TASK_COMPLETED]: {
    title: 'Task Crushed!',
    message: 'Another win on the board. Momentum unlocked.',
    toast: 'Task marked as completed!',
  },
  [CELEBRATION_TYPES.SIGNUP_SUCCESS]: {
    title: 'Welcome to Ethara!',
    message: 'Your command center is ready. Let the work begin.',
    toast: 'Account created successfully!',
  },
};

const CONFETTI_COLORS = ['#8b5cf6', '#06b6d4', '#a78bfa', '#22d3ee', '#c4b5fd', '#ffffff'];

const CelebrationContext = createContext(null);

export function CelebrationProvider({ children }) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [modal, setModal] = useState(null);
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const celebrate = useCallback((type, overrides = {}) => {
    const preset = PRESETS[type] || PRESETS[CELEBRATION_TYPES.TASK_CREATED];
    const title = overrides.title || preset.title;
    const message = overrides.message || preset.message;
    const toastMsg = overrides.toast || preset.toast;

    clearTimers();

    setShowConfetti(true);
    setModal({ title, message });
    playSuccessSound();
    toast.success(toastMsg, { duration: 3500 });

    timersRef.current.push(
      setTimeout(() => setShowConfetti(false), 4500),
      setTimeout(() => setModal(null), 4000)
    );
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  return (
    <CelebrationContext.Provider value={{ celebrate, CELEBRATION_TYPES }}>
      {children}

      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={420}
          gravity={0.22}
          initialVelocityY={18}
          colors={CONFETTI_COLORS}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 99, pointerEvents: 'none' }}
        />
      )}

      <SuccessCelebrationModal
        isOpen={!!modal}
        title={modal?.title}
        message={modal?.message}
        onClose={closeModal}
      />
    </CelebrationContext.Provider>
  );
}

export function useCelebration() {
  const ctx = useContext(CelebrationContext);
  if (!ctx) {
    throw new Error('useCelebration must be used within CelebrationProvider');
  }
  return ctx;
}

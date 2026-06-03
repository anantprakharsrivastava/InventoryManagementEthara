import { createContext, useContext, useState, useCallback, useRef } from 'react';
import Confetti from 'react-confetti';
import toast from 'react-hot-toast';
import { useWindowSize } from '../hooks/useWindowSize';
import { playSuccessSound } from '../utils/playSuccessSound';
import SuccessCelebrationModal from '../components/celebration/SuccessCelebrationModal';

export const CELEBRATION_TYPES = {
  PRODUCT_CREATED: 'product_created',
  CUSTOMER_CREATED: 'customer_created',
  ORDER_PLACED: 'order_placed',
  SIGNUP_SUCCESS: 'signup_success',
};

const PRESETS = {
  [CELEBRATION_TYPES.PRODUCT_CREATED]: {
    title: 'Product Locked In!',
    message: 'New SKU added to the vault. Inventory pulse updated.',
    toast: 'Product created successfully!',
  },
  [CELEBRATION_TYPES.CUSTOMER_CREATED]: {
    title: 'Customer Onboarded!',
    message: 'A new contact joins your registry. Ready for orders.',
    toast: 'Customer added successfully!',
  },
  [CELEBRATION_TYPES.ORDER_PLACED]: {
    title: 'Order Fired!',
    message: 'Stock deducted. Total calculated. Fulfillment in motion.',
    toast: 'Order placed successfully!',
  },
  [CELEBRATION_TYPES.SIGNUP_SUCCESS]: {
    title: 'Welcome to Ethara Vault!',
    message: 'Your inventory command deck is ready.',
    toast: 'Signed in successfully!',
  },
};

const CONFETTI_COLORS = ['#ff6b4a', '#2dd4bf', '#ffc857', '#a78bfa', '#ff8f6b', '#ffffff'];

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
    const preset = PRESETS[type] || PRESETS[CELEBRATION_TYPES.PRODUCT_CREATED];
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
          numberOfPieces={480}
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

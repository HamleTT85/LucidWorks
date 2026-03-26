import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../i18n/useTranslation';

const COOKIE_KEY = 'lucidworks-cookies';

export default function CookieBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      // Show after 1 second
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_KEY, 'declined');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6
                     md:max-w-md z-50 bg-[#1a1a2e] border border-white/10 rounded-xl
                     p-5 shadow-2xl backdrop-blur-xl"
        >
          <h3 className="text-[#e8e4df] font-heading font-semibold text-sm mb-2">
            {t('cookie.title')}
          </h3>
          <p className="text-[#b0aaa2] text-sm mb-4 leading-relaxed">
            {t('cookie.text')}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDecline}
              className="flex-1 px-4 py-2 text-sm border border-white/10 text-[#b0aaa2]
                       rounded-lg hover:border-white/20 transition-all duration-300"
            >
              {t('cookie.decline')}
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 px-4 py-2 text-sm bg-[#c8a45c] text-[#0a0a1a] font-medium
                       rounded-lg hover:bg-[#d4b876] transition-all duration-300"
            >
              {t('cookie.accept')}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

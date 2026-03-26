import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Referenz } from '../../lib/types';
import { formatDate, getVimeoEmbedUrl, getYouTubeEmbedUrl } from '../../lib/utils';
import { useTranslation } from '../../i18n/useTranslation';

interface Props {
  referenz: Referenz | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export default function Lightbox({ referenz, onClose, onPrev, onNext, hasPrev, hasNext }: Props) {
  const { t, lang } = useTranslation();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    },
    [onClose, onPrev, onNext, hasPrev, hasNext]
  );

  useEffect(() => {
    if (referenz) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [referenz, handleKeyDown]);

  const renderVideo = (ref: Referenz) => {
    if (!ref.video_url) return null;

    if (ref.video_type === 'mp4') {
      return (
        <video
          src={ref.video_url}
          controls
          className="w-full rounded-lg mt-4"
          preload="metadata"
        />
      );
    }

    if (ref.video_type === 'vimeo') {
      const id = ref.video_url.match(/(\d+)/)?.[1];
      if (!id) return null;
      return (
        <div className="aspect-video mt-4 rounded-lg overflow-hidden">
          <iframe
            src={getVimeoEmbedUrl(id)}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={ref.titel}
          />
        </div>
      );
    }

    if (ref.video_type === 'youtube') {
      const id = ref.video_url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
      if (!id) return null;
      return (
        <div className="aspect-video mt-4 rounded-lg overflow-hidden">
          <iframe
            src={getYouTubeEmbedUrl(id)}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            title={ref.titel}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      {referenz && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-bg-primary/95 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto
                       bg-bg-card rounded-2xl border border-white/5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-bg-primary/60
                         backdrop-blur-sm border border-white/10 flex items-center justify-center
                         hover:bg-bg-primary hover:border-accent-gold/40 transition-all duration-300"
              aria-label={t('portfolio.close')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-primary">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Image */}
            <div className="aspect-video w-full overflow-hidden rounded-t-2xl">
              <img
                src={referenz.thumbnail_url}
                alt={referenz.titel}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              <span className="inline-block px-3 py-1 bg-accent-gold/10 text-accent-gold text-xs font-medium
                             rounded-full border border-accent-gold/20 mb-3">
                {referenz.kategorie}
              </span>

              <h2 className="font-heading font-bold text-2xl md:text-3xl text-text-primary mb-2">
                {referenz.titel}
              </h2>

              <p className="text-text-secondary mb-4">
                {referenz.kunde}
                {referenz.datum && ` — ${formatDate(referenz.datum, lang)}`}
              </p>

              {referenz.beschreibung && (
                <p className="text-text-secondary/80 leading-relaxed mb-6">
                  {referenz.beschreibung}
                </p>
              )}

              {/* Video */}
              {renderVideo(referenz)}

              {/* External Link */}
              {referenz.externer_link && (
                <a
                  href={referenz.externer_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary mt-6 inline-flex"
                >
                  {t('portfolio.externalLink')}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              )}
            </div>

            {/* Navigation arrows */}
            {hasPrev && (
              <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                           bg-bg-primary/60 backdrop-blur-sm border border-white/10
                           flex items-center justify-center hover:border-accent-gold/40 transition-all duration-300"
                aria-label={t('portfolio.previous')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-primary">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            )}
            {hasNext && (
              <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                           bg-bg-primary/60 backdrop-blur-sm border border-white/10
                           flex items-center justify-center hover:border-accent-gold/40 transition-all duration-300"
                aria-label={t('portfolio.next')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-primary">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

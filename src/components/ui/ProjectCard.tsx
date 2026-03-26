import type { Referenz } from '../../lib/types';
import { formatDate } from '../../lib/utils';
import { useTranslation } from '../../i18n/useTranslation';

interface Props {
  referenz: Referenz;
  onClick: () => void;
  index: number;
}

export default function ProjectCard({ referenz, onClick, index }: Props) {
  const { lang } = useTranslation();

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-xl overflow-hidden bg-bg-card border border-white/5
                 card-hover relative"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden">
        <img
          src={referenz.thumbnail_url}
          alt={referenz.titel}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-bg-primary/20 to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300
                        flex flex-col justify-end p-5">
          <span className="inline-block px-3 py-1 bg-accent-gold/20 text-accent-gold text-xs font-medium rounded-full
                          border border-accent-gold/30 w-fit mb-2">
            {referenz.kategorie}
          </span>
          <h3 className="text-text-primary font-heading font-semibold text-lg leading-tight">
            {referenz.titel}
          </h3>
          <p className="text-text-secondary text-sm mt-1">
            {referenz.kunde}
            {referenz.datum && ` — ${formatDate(referenz.datum, lang)}`}
          </p>
        </div>
      </div>

      {/* Video indicator */}
      {referenz.video_url && (
        <div className="absolute top-3 right-3 w-8 h-8 bg-bg-primary/70 backdrop-blur-sm rounded-full
                        flex items-center justify-center border border-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-accent-gold ml-0.5">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
      )}
    </div>
  );
}

import { KATEGORIEN, type Kategorie } from '../../lib/types';
import { useTranslation } from '../../i18n/useTranslation';

interface Props {
  active: string;
  onFilter: (cat: string) => void;
}

export default function FilterBar({ active, onFilter }: Props) {
  const { t } = useTranslation();
  const allLabel = t('portfolio.filterAll');

  return (
    <div className="flex flex-wrap gap-2 mb-10">
      <button
        onClick={() => onFilter('all')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          active === 'all'
            ? 'bg-accent-gold text-bg-primary'
            : 'border border-white/10 text-text-secondary hover:border-accent-gold/40 hover:text-text-primary'
        }`}
      >
        {allLabel}
      </button>
      {KATEGORIEN.map((cat) => (
        <button
          key={cat}
          onClick={() => onFilter(cat)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            active === cat
              ? 'bg-accent-gold text-bg-primary'
              : 'border border-white/10 text-text-secondary hover:border-accent-gold/40 hover:text-text-primary'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

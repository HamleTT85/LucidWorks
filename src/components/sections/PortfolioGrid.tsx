import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import type { Referenz } from '../../lib/types';
import { useTranslation } from '../../i18n/useTranslation';
import FilterBar from '../ui/FilterBar';
import ProjectCard from '../ui/ProjectCard';
import Lightbox from '../ui/Lightbox';

// Demo data for when Supabase is not configured
const DEMO_DATA: Referenz[] = [
  {
    id: '1',
    titel: 'Noonoouri x Dior Campaign',
    kunde: 'Dior / Joerg Zuber Studio',
    kategorie: 'AI Content',
    datum: '2025-06-01',
    beschreibung: 'AI-powered content creation for virtual influencer noonoouri in collaboration with Dior. Transforming traditional 3D pipelines into cutting-edge AI workflows.',
    thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=960&h=540&fit=crop',
    video_url: null,
    video_type: null,
    externer_link: null,
    sichtbar: true,
    sort_order: 10,
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-01T00:00:00Z',
  },
  {
    id: '2',
    titel: 'Adobe "Release Me" Music Video',
    kunde: 'Adobe / noonoouri',
    kategorie: 'VFX',
    datum: '2025-03-01',
    beschreibung: 'Official music video for noonoouri created with Adobe Firefly. Adobe collaboration project showcasing AI-driven visual effects production.',
    thumbnail_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=960&h=540&fit=crop',
    video_url: 'https://vimeo.com/1168782812',
    video_type: 'vimeo',
    externer_link: 'https://www.adobe.com',
    sichtbar: true,
    sort_order: 9,
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2025-03-01T00:00:00Z',
  },
  {
    id: '3',
    titel: 'Porsche Cayman Roadshow Middle East',
    kunde: 'Porsche',
    kategorie: 'Projection Mapping',
    datum: '2023-09-01',
    beschreibung: '3D Video Mapping on curved stage across 6 countries in the Middle East for the Porsche Cayman launch roadshow.',
    thumbnail_url: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=960&h=540&fit=crop',
    video_url: null,
    video_type: null,
    externer_link: null,
    sichtbar: true,
    sort_order: 8,
    created_at: '2023-09-01T00:00:00Z',
    updated_at: '2023-09-01T00:00:00Z',
  },
  {
    id: '4',
    titel: 'Intel Ultrabook 3D Tour',
    kunde: 'Intel',
    kategorie: 'Projection Mapping',
    datum: '2022-05-01',
    beschreibung: 'Projection mapping on the Karlskirche in Vienna and additional cities as part of the Intel Ultrabook launch tour.',
    thumbnail_url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=960&h=540&fit=crop',
    video_url: null,
    video_type: null,
    externer_link: null,
    sichtbar: true,
    sort_order: 7,
    created_at: '2022-05-01T00:00:00Z',
    updated_at: '2022-05-01T00:00:00Z',
  },
  {
    id: '5',
    titel: 'BMW Brand Film 2024',
    kunde: 'BMW',
    kategorie: '3D Animation',
    datum: '2024-02-01',
    beschreibung: '3D animation and compositing for BMW brand campaign. Photorealistic vehicle renders and dynamic environments.',
    thumbnail_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=960&h=540&fit=crop',
    video_url: null,
    video_type: null,
    externer_link: null,
    sichtbar: true,
    sort_order: 6,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: '6',
    titel: 'SIXT Commercial VFX',
    kunde: 'SIXT',
    kategorie: 'Motion Design',
    datum: '2024-08-01',
    beschreibung: 'Motion design and visual effects for SIXT commercial campaign. Dynamic typography and branded motion graphics.',
    thumbnail_url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=960&h=540&fit=crop',
    video_url: null,
    video_type: null,
    externer_link: null,
    sichtbar: true,
    sort_order: 5,
    created_at: '2024-08-01T00:00:00Z',
    updated_at: '2024-08-01T00:00:00Z',
  },
];

export default function PortfolioGrid() {
  const { t } = useTranslation();
  const [referenzen, setReferenzen] = useState<Referenz[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferenzen();
  }, []);

  async function loadReferenzen() {
    try {
      const { data, error } = await supabase
        .from('referenzen')
        .select('*')
        .eq('sichtbar', true)
        .order('sort_order', { ascending: false })
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        // Use demo data if Supabase is not configured or empty
        setReferenzen(DEMO_DATA);
      } else {
        setReferenzen(data);
      }
    } catch {
      // Fallback to demo data
      setReferenzen(DEMO_DATA);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return referenzen;
    return referenzen.filter((r) => r.kategorie === activeFilter);
  }, [referenzen, activeFilter]);

  const selectedReferenz = selectedIndex !== null ? filtered[selectedIndex] : null;

  return (
    <section id="portfolio" className="py-20 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="text-[#c8a45c] uppercase tracking-[0.2em] text-sm font-medium mb-6 block">
          {t('portfolio.label')}
        </span>
        <h2 className="font-heading text-[clamp(1.8rem,4vw,3.5rem)] font-bold tracking-tight mb-4 text-[#e8e4df]">
          {t('portfolio.title')}
        </h2>

        {/* Filters */}
        <FilterBar active={activeFilter} onFilter={setActiveFilter} />

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-video rounded-xl bg-[#1a1a2e] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-[#b0aaa2] text-center py-20">{t('portfolio.noResults')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((ref, i) => (
              <ProjectCard
                key={ref.id}
                referenz={ref}
                onClick={() => setSelectedIndex(i)}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        referenz={selectedReferenz}
        onClose={() => setSelectedIndex(null)}
        onPrev={() => setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))}
        onNext={() =>
          setSelectedIndex((prev) =>
            prev !== null && prev < filtered.length - 1 ? prev + 1 : prev
          )
        }
        hasPrev={selectedIndex !== null && selectedIndex > 0}
        hasNext={selectedIndex !== null && selectedIndex < filtered.length - 1}
      />
    </section>
  );
}

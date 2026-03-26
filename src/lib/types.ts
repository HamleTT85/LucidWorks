export interface Referenz {
  id: string;
  titel: string;
  kunde: string;
  kategorie: Kategorie;
  datum: string | null;
  beschreibung: string | null;
  thumbnail_url: string;
  video_url: string | null;
  video_type: 'mp4' | 'vimeo' | 'youtube' | null;
  externer_link: string | null;
  sichtbar: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type Kategorie =
  | 'VFX'
  | '3D Animation'
  | 'AI Content'
  | 'Motion Design'
  | 'Projection Mapping'
  | 'Sonstige';

export const KATEGORIEN: Kategorie[] = [
  'VFX',
  '3D Animation',
  'AI Content',
  'Motion Design',
  'Projection Mapping',
  'Sonstige',
];

export interface AdminSession {
  authenticated: boolean;
  expiresAt: number;
}

# LucidWorks — Portfolio Website

Premium portfolio website for Pascal Heilig (Senior VFX Artist & AI Creative Technologist).

**Live:** [www.lucidworks.de](https://www.lucidworks.de)

## Tech Stack

- **Astro 4** (Static Site Generator)
- **React 18** (Interactive Islands)
- **Tailwind CSS 3** (Styling)
- **GSAP + Framer Motion** (Animations)
- **Supabase** (Database + Storage)
- **TypeScript**

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file and configure
cp .env.example .env

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
PUBLIC_ADMIN_PASSWORD=your-secure-password
PUBLIC_SITE_URL=https://www.lucidworks.de
```

## Supabase Setup

Create the following table in your Supabase project:

```sql
CREATE TABLE referenzen (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titel VARCHAR(200) NOT NULL,
  kunde VARCHAR(200) NOT NULL,
  kategorie VARCHAR(50) NOT NULL CHECK (kategorie IN (
    'VFX', '3D Animation', 'AI Content', 'Motion Design', 'Projection Mapping', 'Sonstige'
  )),
  datum DATE,
  beschreibung TEXT,
  thumbnail_url TEXT NOT NULL,
  video_url TEXT,
  video_type VARCHAR(20) CHECK (video_type IN ('mp4', 'vimeo', 'youtube')),
  externer_link TEXT,
  sichtbar BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referenzen_kategorie ON referenzen(kategorie);
CREATE INDEX idx_referenzen_sichtbar ON referenzen(sichtbar);
CREATE INDEX idx_referenzen_sort ON referenzen(sort_order DESC, created_at DESC);
```

Create two Storage Buckets:
- `portfolio-thumbnails` (public)
- `portfolio-videos` (public)

## FTP Deployment

1. Run `npm run build`
2. Upload the entire `dist/` folder contents to your web root via FTP
3. Done!

## Project Structure

```
src/
  components/
    admin/        # Admin panel (login, dashboard, upload form)
    layout/       # Header, Footer, Cookie Banner
    sections/     # Hero, Showreel, Portfolio, About, Clients, Contact
    ui/           # Reusable UI components
  i18n/           # EN/DE translations
  layouts/        # Base HTML layout
  lib/            # Supabase client, types, utils
  pages/          # Astro pages (routes)
  styles/         # Global CSS + Tailwind
```

## Admin Panel

Access: `/admin-x7k9m2p4` (not linked in navigation)
Password: Set via `PUBLIC_ADMIN_PASSWORD` env variable

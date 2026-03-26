import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { KATEGORIEN, type Referenz, type Kategorie } from '../../lib/types';
import { isValidVideoUrl, parseVideoUrl } from '../../lib/utils';
import FileUploader from './FileUploader';

interface Props {
  editItem?: Referenz | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function ReferenceForm({ editItem, onSave, onCancel }: Props) {
  const [titel, setTitel] = useState(editItem?.titel || '');
  const [kunde, setKunde] = useState(editItem?.kunde || '');
  const [kategorie, setKategorie] = useState<Kategorie>(editItem?.kategorie || 'VFX');
  const [datum, setDatum] = useState(editItem?.datum || '');
  const [beschreibung, setBeschreibung] = useState(editItem?.beschreibung || '');
  const [videoOption, setVideoOption] = useState<'mp4' | 'link'>(
    editItem?.video_type === 'mp4' ? 'mp4' : 'link'
  );
  const [videoUrl, setVideoUrl] = useState(editItem?.video_url || '');
  const [externerLink, setExternerLink] = useState(editItem?.externer_link || '');
  const [sichtbar, setSichtbar] = useState(editItem?.sichtbar ?? true);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      let thumbnailUrl = editItem?.thumbnail_url || '';
      let finalVideoUrl = editItem?.video_url || '';
      let videoType = editItem?.video_type || null;

      // Upload thumbnail
      if (thumbnailFile) {
        const ext = thumbnailFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('portfolio-thumbnails')
          .upload(fileName, thumbnailFile, { contentType: thumbnailFile.type });

        if (uploadError) throw new Error(`Thumbnail upload failed: ${uploadError.message}`);

        const { data: urlData } = supabase.storage
          .from('portfolio-thumbnails')
          .getPublicUrl(fileName);
        thumbnailUrl = urlData.publicUrl;
      }

      if (!thumbnailUrl && !editItem) {
        throw new Error('Thumbnail is required');
      }

      // Upload video if MP4
      if (videoOption === 'mp4' && videoFile) {
        const ext = videoFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('portfolio-videos')
          .upload(fileName, videoFile, { contentType: videoFile.type });

        if (uploadError) throw new Error(`Video upload failed: ${uploadError.message}`);

        const { data: urlData } = supabase.storage
          .from('portfolio-videos')
          .getPublicUrl(fileName);
        finalVideoUrl = urlData.publicUrl;
        videoType = 'mp4';
      } else if (videoOption === 'link' && videoUrl) {
        if (!isValidVideoUrl(videoUrl)) {
          throw new Error('Invalid Vimeo/YouTube URL');
        }
        const parsed = parseVideoUrl(videoUrl);
        finalVideoUrl = videoUrl;
        videoType = parsed?.type || null;
      } else if (!videoUrl && !videoFile) {
        finalVideoUrl = '';
        videoType = null;
      }

      const record = {
        titel,
        kunde,
        kategorie,
        datum: datum || null,
        beschreibung: beschreibung || null,
        thumbnail_url: thumbnailUrl,
        video_url: finalVideoUrl || null,
        video_type: videoType,
        externer_link: externerLink || null,
        sichtbar,
      };

      if (editItem) {
        const { error: dbError } = await supabase
          .from('referenzen')
          .update({ ...record, updated_at: new Date().toISOString() })
          .eq('id', editItem.id);
        if (dbError) throw new Error(dbError.message);
      } else {
        const { error: dbError } = await supabase.from('referenzen').insert(record);
        if (dbError) throw new Error(dbError.message);
      }

      onSave();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-[#e8e4df]">
            {editItem ? 'Referenz bearbeiten' : 'Neue Referenz hinzufügen'}
          </h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center
                     hover:bg-white/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#b0aaa2]">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[#b0aaa2] text-sm mb-2">Titel *</label>
            <input
              type="text"
              required
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0a0a1a] border border-white/10 rounded-lg
                       text-[#e8e4df] focus:outline-none focus:border-[#c8a45c]/50 transition-colors"
              placeholder="z.B. Noonoouri x Dior Campaign"
            />
          </div>

          {/* Client */}
          <div>
            <label className="block text-[#b0aaa2] text-sm mb-2">Kunde/Projekt *</label>
            <input
              type="text"
              required
              value={kunde}
              onChange={(e) => setKunde(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0a0a1a] border border-white/10 rounded-lg
                       text-[#e8e4df] focus:outline-none focus:border-[#c8a45c]/50 transition-colors"
              placeholder="z.B. Dior / Joerg Zuber Studio"
            />
          </div>

          {/* Category + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#b0aaa2] text-sm mb-2">Kategorie *</label>
              <select
                value={kategorie}
                onChange={(e) => setKategorie(e.target.value as Kategorie)}
                className="w-full px-4 py-2.5 bg-[#0a0a1a] border border-white/10 rounded-lg
                         text-[#e8e4df] focus:outline-none focus:border-[#c8a45c]/50 transition-colors"
              >
                {KATEGORIEN.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#b0aaa2] text-sm mb-2">Datum</label>
              <input
                type="month"
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0a1a] border border-white/10 rounded-lg
                         text-[#e8e4df] focus:outline-none focus:border-[#c8a45c]/50 transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[#b0aaa2] text-sm mb-2">Beschreibung</label>
            <textarea
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-[#0a0a1a] border border-white/10 rounded-lg
                       text-[#e8e4df] focus:outline-none focus:border-[#c8a45c]/50 transition-colors resize-none"
              placeholder="2-3 Sätze zum Projekt..."
            />
          </div>

          {/* Thumbnail Upload */}
          <FileUploader
            accept="image/jpeg,image/png,image/webp"
            maxSize={5}
            label="Thumbnail / Still *"
            hint="Empfohlen: 1920x1080 (16:9), Max: 5MB, JPG/PNG/WebP"
            onFile={setThumbnailFile}
            preview={editItem?.thumbnail_url}
          />

          {/* Video */}
          <div>
            <label className="block text-[#b0aaa2] text-sm mb-2">Video (optional)</label>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="video-option"
                  value="mp4"
                  checked={videoOption === 'mp4'}
                  onChange={() => setVideoOption('mp4')}
                  className="accent-[#c8a45c]"
                />
                <span className="text-[#e8e4df] text-sm">MP4 Upload</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="video-option"
                  value="link"
                  checked={videoOption === 'link'}
                  onChange={() => setVideoOption('link')}
                  className="accent-[#c8a45c]"
                />
                <span className="text-[#e8e4df] text-sm">Externer Link</span>
              </label>
            </div>

            {videoOption === 'mp4' ? (
              <FileUploader
                accept="video/mp4"
                maxSize={500}
                label=""
                hint="Max: 500MB, MP4"
                onFile={setVideoFile}
              />
            ) : (
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0a1a] border border-white/10 rounded-lg
                         text-[#e8e4df] focus:outline-none focus:border-[#c8a45c]/50 transition-colors"
                placeholder="https://vimeo.com/... oder youtube.com/..."
              />
            )}
          </div>

          {/* External Link */}
          <div>
            <label className="block text-[#b0aaa2] text-sm mb-2">Externer Link (optional)</label>
            <input
              type="url"
              value={externerLink}
              onChange={(e) => setExternerLink(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0a0a1a] border border-white/10 rounded-lg
                       text-[#e8e4df] focus:outline-none focus:border-[#c8a45c]/50 transition-colors"
              placeholder="https://..."
            />
          </div>

          {/* Visibility */}
          <div className="flex items-center gap-4">
            <label className="text-[#b0aaa2] text-sm">Sichtbarkeit:</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                checked={sichtbar}
                onChange={() => setSichtbar(true)}
                className="accent-[#c8a45c]"
              />
              <span className="text-[#e8e4df] text-sm">Öffentlich</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                checked={!sichtbar}
                onChange={() => setSichtbar(false)}
                className="accent-[#c8a45c]"
              />
              <span className="text-[#e8e4df] text-sm">Entwurf</span>
            </label>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-[#0a0a1a] rounded-full h-2">
              <div
                className="bg-[#c8a45c] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 border border-white/10 text-[#b0aaa2] rounded-lg
                       hover:border-white/20 transition-colors text-sm"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={saving || !titel || !kunde}
              className="px-5 py-2.5 bg-[#c8a45c] text-[#0a0a1a] font-semibold rounded-lg
                       hover:bg-[#d4b876] transition-colors disabled:opacity-50 text-sm"
            >
              {saving ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

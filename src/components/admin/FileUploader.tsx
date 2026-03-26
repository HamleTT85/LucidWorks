import { useState, useRef, useCallback } from 'react';

interface Props {
  accept: string;
  maxSize: number; // in MB
  label: string;
  hint: string;
  onFile: (file: File) => void;
  preview?: string | null;
}

export default function FileUploader({ accept, maxSize, label, hint, onFile, preview }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError('');
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSize) {
        setError(`File too large. Max: ${maxSize}MB`);
        return;
      }

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }

      onFile(file);
    },
    [maxSize, onFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <label className="block text-[#b0aaa2] text-sm mb-2">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                   transition-all duration-300 ${
                     dragOver
                       ? 'border-[#c8a45c] bg-[#c8a45c]/5'
                       : 'border-white/10 hover:border-white/20 bg-[#0a0a1a]'
                   }`}
      >
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-40 mx-auto rounded-lg object-contain"
            />
            <p className="text-[#b0aaa2] text-xs mt-2">Click to replace</p>
          </div>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#b0aaa2] mx-auto mb-2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-[#b0aaa2] text-sm">
              Drag & Drop or <span className="text-[#c8a45c]">click to browse</span>
            </p>
            <p className="text-[#b0aaa2]/60 text-xs mt-1">{hint}</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

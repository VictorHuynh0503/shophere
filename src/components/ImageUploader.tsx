import { useState, useRef, DragEvent } from 'react'
import { supabase } from '../lib/supabase'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export default function ImageUploader({ images, onChange, maxImages = 8 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File): Promise<string | null> {
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage
      .from('shop-images')
      .upload(filename, file, { upsert: true })

    if (error) {
      // Fallback: convert to base64 for demo if storage not configured
      return new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
    }

    const { data } = supabase.storage.from('shop-images').getPublicUrl(filename)
    return data.publicUrl
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return
    const remaining = maxImages - images.length
    if (remaining <= 0) return

    setUploading(true)
    const newUrls: string[] = []

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const url = await uploadFile(files[i])
      if (url) newUrls.push(url)
    }

    onChange([...images, ...newUrls])
    setUploading(false)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="upload-icon">{uploading ? '⏳' : '🖼️'}</div>
        <div className="upload-text">
          {uploading ? 'Uploading...' : <><strong>Click to upload</strong> or drag & drop</>}
        </div>
        <div className="upload-sub">JPG, PNG, WEBP up to 10MB • Max {maxImages} photos</div>
      </div>

      {/* Camera capture for mobile */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
        >
          📁 Browse Files
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
        >
          📷 Take Photo
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />

      {images.length > 0 && (
        <div className="image-previews">
          {images.map((url, i) => (
            <div key={i} className="image-preview-item">
              <img src={url} alt={`Preview ${i + 1}`} />
              <button className="image-preview-remove" onClick={() => removeImage(i)} type="button">×</button>
              {i === 0 && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,.6)', color: 'white', fontSize: 9, textAlign: 'center', padding: '2px 0', fontWeight: 700 }}>
                  MAIN
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

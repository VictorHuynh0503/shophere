import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { ToastContainer, toast } from '../components/Toast'
import ImageUploader from '../components/ImageUploader'
import { supabase } from '../lib/supabase'

export default function CreateShopPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)

  const [form, setForm] = useState({
    slug: '',
    name: '',
    description: '',
    owner_email: '',
  })
  const [logoImages, setLogoImages] = useState<string[]>([])
  const [bannerImages, setBannerImages] = useState<string[]>([])

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function sanitizeSlug(val: string) {
    return val.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 30)
  }

  async function checkSlug(slug: string) {
    if (slug.length < 3) { setSlugAvailable(null); return }
    setCheckingSlug(true)
    const { data } = await supabase.from('shops').select('id').eq('slug', slug).single()
    setSlugAvailable(!data)
    setCheckingSlug(false)
  }

  async function handleSubmit() {
    if (!form.slug || !form.name || !form.owner_email) {
      toast('Please fill in all required fields', 'error'); return
    }
    if (!slugAvailable) { toast('Please choose an available shop URL', 'error'); return }

    setLoading(true)
    const { data, error } = await supabase.from('shops').insert({
      slug: form.slug,
      name: form.name,
      description: form.description,
      owner_email: form.owner_email,
      logo_url: logoImages[0] || null,
      banner_url: bannerImages[0] || null,
    }).select().single()

    if (error) {
      toast(error.message || 'Failed to create shop', 'error')
      setLoading(false)
      return
    }

    toast('🎉 Shop created successfully!', 'success')
    setTimeout(() => navigate(`/shop/${data.slug}`), 800)
  }

  const shopUrl = `${window.location.origin}/shop/${form.slug || 'your-shop-name'}`

  return (
    <>
      <Nav />
      <ToastContainer />

      <div className="page-container" style={{ maxWidth: 640, paddingTop: 40, paddingBottom: 80 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="section-title">OPEN YOUR SHOP</h1>
          <p style={{ color: 'var(--mid)', fontSize: 15 }}>Set up your store in 2 minutes</p>
        </div>

        {/* Steps */}
        <div className="steps" style={{ marginBottom: 36 }}>
          <div className={`step ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}>
            <div className="step-num">{step > 1 ? '✓' : '1'}</div>
            <span className="step-label">Shop URL</span>
          </div>
          <div className="step-divider" />
          <div className={`step ${step >= 2 ? (step > 2 ? 'done' : 'active') : ''}`}>
            <div className="step-num">{step > 2 ? '✓' : '2'}</div>
            <span className="step-label">Details</span>
          </div>
          <div className="step-divider" />
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-num">3</div>
            <span className="step-label">Branding</span>
          </div>
        </div>

        <div className="card" style={{ padding: 28 }}>

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <h2 style={{ fontWeight: 700, marginBottom: 6, fontSize: 18 }}>Choose Your Shop URL</h2>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>This will be your permanent shop address. Choose wisely!</p>

              <div className="form-group">
                <label className="form-label">Shop URL Slug *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  <span style={{ background: '#f5f5f5', border: '1.5px solid var(--border)', borderRight: 'none', padding: '12px 14px', borderRadius: '4px 0 0 4px', fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                    /shop/
                  </span>
                  <input
                    className="form-input"
                    style={{ borderRadius: '0 4px 4px 0' }}
                    placeholder="my-amazing-shop"
                    value={form.slug}
                    onChange={e => {
                      const slug = sanitizeSlug(e.target.value)
                      set('slug', slug)
                      setSlugAvailable(null)
                    }}
                    onBlur={() => checkSlug(form.slug)}
                  />
                </div>
                {checkingSlug && <span className="form-hint">Checking availability…</span>}
                {slugAvailable === true && <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>✓ Available!</span>}
                {slugAvailable === false && <span className="form-error">✕ Already taken. Try another.</span>}
                <span className="form-hint">Only lowercase letters, numbers, and hyphens. Min 3 characters.</span>
              </div>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Your shop will be at:</p>
                <div className="url-preview">
                  {window.location.origin}/shop/<span>{form.slug || 'your-shop-name'}</span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-full"
                disabled={form.slug.length < 3 || !slugAvailable || checkingSlug}
                onClick={() => setStep(2)}
              >
                Continue →
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <h2 style={{ fontWeight: 700, marginBottom: 6, fontSize: 18 }}>Shop Details</h2>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>Tell customers about your shop</p>

              <div className="form-group">
                <label className="form-label">Shop Name *</label>
                <input className="form-input" placeholder="My Amazing Shop" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Tell customers what you sell, your style, what makes you special..." value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
              </div>

              <div className="form-group">
                <label className="form-label">Your Email *</label>
                <input className="form-input" type="email" placeholder="you@example.com" value={form.owner_email} onChange={e => set('owner_email', e.target.value)} />
                <span className="form-hint">Used to manage your shop (not shown publicly)</span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 1 }} disabled={!form.name || !form.owner_email} onClick={() => setStep(3)}>
                  Continue →
                </button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <h2 style={{ fontWeight: 700, marginBottom: 6, fontSize: 18 }}>Branding (Optional)</h2>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>Add a logo and banner to make your shop stand out</p>

              <div className="form-group">
                <label className="form-label">Shop Logo</label>
                <ImageUploader images={logoImages} onChange={setLogoImages} maxImages={1} />
              </div>

              <div className="form-group">
                <label className="form-label">Banner Image</label>
                <ImageUploader images={bannerImages} onChange={setBannerImages} maxImages={1} />
              </div>

              <div className="divider" />

              <div style={{ background: 'var(--red-soft)', border: '1px solid #fecdd3', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: 'var(--dark)', fontWeight: 600 }}>🎉 Ready to launch:</p>
                <p style={{ fontSize: 13, color: 'var(--mid)', marginTop: 4 }}><strong>{form.name}</strong></p>
                <div className="url-preview" style={{ marginTop: 8 }}>
                  {window.location.origin}/shop/<span>{form.slug}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating Shop…' : '🚀 Launch My Shop'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

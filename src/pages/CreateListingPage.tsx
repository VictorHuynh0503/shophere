import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Nav from '../components/Nav'
import { ToastContainer, toast } from '../components/Toast'
import ImageUploader from '../components/ImageUploader'
import { supabase, Shop } from '../lib/supabase'

const CATEGORIES = ['Fashion', 'Shoes', 'Beauty', 'Home & Living', 'Electronics', 'Bags', 'Jewelry', 'Sports', 'Food', 'Art', 'Kids', 'Other']

export default function CreateListingPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [shop, setShop] = useState<Shop | null>(null)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    category: 'Fashion',
    in_stock: true,
  })

  useEffect(() => {
    if (!slug) return
    async function fetchShop() {
      try {
        const result = await supabase.from('shops').select('*').eq('slug', slug).single()
        const data = result.data as Shop | null
        setShop(data)
      } catch (error) {
        console.error('Error fetching shop:', error)
      }
    }
    fetchShop()
  }, [slug])

  function set(key: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    if (!form.title || !form.price) {
      toast('Title and price are required', 'error'); return
    }
    if (!shop) { toast('Shop not found', 'error'); return }

    setLoading(true)
    const { error } = await supabase.from('listings').insert({
      shop_id: shop.id,
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      category: form.category,
      in_stock: form.in_stock,
      images,
    })

    if (error) {
      toast(error.message || 'Failed to create listing', 'error')
      setLoading(false)
      return
    }

    toast('✓ Listing created!', 'success')
    setTimeout(() => navigate(`/shop/${slug}`), 700)
  }

  const discount = form.price && form.original_price && parseFloat(form.original_price) > parseFloat(form.price)
    ? Math.round((1 - parseFloat(form.price) / parseFloat(form.original_price)) * 100) : null

  return (
    <>
      <Nav shopSlug={slug} />
      <ToastContainer />

      <div className="page-container" style={{ maxWidth: 700, paddingTop: 40, paddingBottom: 80 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <Link to={`/shop/${slug}`} className="btn btn-ghost btn-sm">← Back</Link>
          <div>
            <h1 className="section-title" style={{ marginBottom: 0 }}>NEW LISTING</h1>
            {shop && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Adding to <strong>{shop.name}</strong></p>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* IMAGES */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Product Photos</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>Add up to 8 photos. First photo is the main display image.</p>
            <ImageUploader images={images} onChange={setImages} maxImages={8} />
          </div>

          {/* BASIC INFO */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Product Details</h3>

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" placeholder="e.g. Floral Summer Dress - Blue" value={form.title} onChange={e => set('title', e.target.value)} maxLength={120} />
              <span className="form-hint">{form.title.length}/120 characters</span>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows={6}
                placeholder="Describe your product in detail:&#10;• Material and fabric&#10;• Size guide&#10;• Colors available&#10;• Care instructions&#10;• What makes it special"
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* PRICING */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Pricing</h3>

            <div className="grid-2">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sale Price *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--mid)', fontWeight: 700 }}>$</span>
                  <input
                    className="form-input"
                    style={{ paddingLeft: 28 }}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.price}
                    onChange={e => set('price', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Original Price <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--mid)', fontWeight: 700 }}>$</span>
                  <input
                    className="form-input"
                    style={{ paddingLeft: 28 }}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.original_price}
                    onChange={e => set('original_price', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {discount && (
              <div style={{ marginTop: 12, padding: '8px 14px', background: 'var(--red-soft)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, color: 'var(--red)', fontSize: 14 }}>-{discount}% OFF</span>
                <span style={{ fontSize: 13, color: 'var(--mid)' }}>discount badge will show on product</span>
              </div>
            )}

            <div className="divider" />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>In Stock</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>Toggle off to show as sold out</p>
              </div>
              <button
                type="button"
                onClick={() => set('in_stock', !form.in_stock)}
                style={{
                  width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                  background: form.in_stock ? 'var(--success)' : '#ddd',
                  position: 'relative', transition: 'background .2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: 3, left: form.in_stock ? 25 : 3,
                  width: 20, height: 20, borderRadius: '50%', background: 'white',
                  transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)'
                }} />
              </button>
            </div>
          </div>

          {/* PREVIEW */}
          {(form.title || form.price) && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Preview</h3>
              <div style={{ maxWidth: 200 }}>
                <div className="card product-card" style={{ cursor: 'default' }}>
                  <div className="product-card-image">
                    {images[0] ? <img src={images[0]} alt="preview" /> : <div className="no-image">🖼️</div>}
                    {discount && <span className="product-card-badge">-{discount}%</span>}
                  </div>
                  <div className="product-card-info">
                    <p className="product-card-title">{form.title || 'Product Title'}</p>
                    <div className="product-card-price">
                      <span className="price-current">${form.price || '0.00'}</span>
                      {form.original_price && <span className="price-original">${form.original_price}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBMIT */}
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to={`/shop/${slug}`} className="btn btn-outline">Cancel</Link>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading || !form.title || !form.price}>
              {loading ? 'Publishing…' : '🚀 Publish Listing'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

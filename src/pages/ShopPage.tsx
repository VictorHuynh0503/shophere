import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Nav from '../components/Nav'
import { ToastContainer, toast } from '../components/Toast'
import { supabase, Shop, Listing } from '../lib/supabase'
import { formatVND } from '../lib/currency'

export default function ShopPage() {
  const { slug } = useParams<{ slug: string }>()
  const [shop, setShop] = useState<Shop | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    async function load() {
      try {
        const { data: shopData, error: shopError } = await supabase.from('shops').select('*').eq('slug', slug).single()
        if (shopError || !shopData) { setNotFound(true); setLoading(false); return }
        setShop((shopData as unknown as Shop) || null)

        const { data: listData, error: listError } = await supabase.from('listings').select('*').eq('shop_id', (shopData as any).id).order('created_at', { ascending: false })
        setListings((listError ? [] : (listData as unknown as Listing[]) || []))
      } catch (error) {
        console.error('Error loading shop:', error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  async function deleteListing(id: string) {
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (error) { toast('Failed to delete', 'error'); return }
    setListings(prev => prev.filter(l => l.id !== id))
    setDeleteConfirm(null)
    setSelectedListing(null)
    toast('Listing deleted', 'success')
  }

  function shareShop() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: shop?.name, url })
    } else {
      navigator.clipboard.writeText(url)
      toast('Shop link copied!', 'success')
    }
  }

  if (loading) return (
    <><Nav shopSlug={slug} /><div className="loading-center"><div className="spinner" /><p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading shop…</p></div></>
  )

  if (notFound) return (
    <>
      <Nav />
      <div className="empty-state" style={{ paddingTop: 100 }}>
        <div className="empty-icon">🔍</div>
        <h2 className="empty-title">Marketplace not found</h2>
        <p className="empty-sub">The marketplace <strong>/{slug}</strong> doesn't exist yet.</p>
        <Link to="/create-shop" className="btn btn-primary">Create This Marketplace</Link>
      </div>
    </>
  )

  const discount = (listing: Listing) => listing.original_price
    ? Math.round((1 - listing.price / listing.original_price) * 100) : null

  return (
    <>
      <Nav shopSlug={slug} />
      <ToastContainer />

      {/* SHOP HEADER */}
      <div className="shop-header">
        <div className="shop-banner">
          {shop?.banner_url && <img src={shop.banner_url} alt="Banner" />}
          <div className="shop-banner-overlay" />
        </div>
        <div className="shop-info">
          <div className="shop-logo">
            {shop?.logo_url ? <img src={shop.logo_url} alt="Logo" /> : shop?.name[0].toUpperCase()}
          </div>
          <div className="shop-meta">
            <h1 className="shop-name">{shop?.name}</h1>
            {shop?.description && <p className="shop-desc">{shop.description}</p>}
            <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="badge badge-gray">� {listings.length} products</span>
              {shop?.contact_phone && (
                <a href={`tel:${shop.contact_phone}`} className="badge badge-gray" style={{ cursor: 'pointer', textDecoration: 'none' }}>
                  📞 {shop.contact_phone}
                </a>
              )}
              {shop?.contact_zalo && (
                <a href={shop.contact_zalo} target="_blank" rel="noopener noreferrer" className="badge badge-gray" style={{ cursor: 'pointer', textDecoration: 'none' }}>
                  💬 Zalo
                </a>
              )}
              {shop?.owner_email && (
                <a href={`mailto:${shop.owner_email}`} className="badge badge-gray" style={{ cursor: 'pointer', textDecoration: 'none' }}>
                  ✉️ Email
                </a>
              )}
            </div>
          </div>
          <div className="shop-actions">
            <button className="btn btn-outline btn-sm" onClick={shareShop} style={{ color: 'white', borderColor: 'rgba(255,255,255,.2)' }}>
              🔗 Share
            </button>
            <Link to={`/shop/${slug}/new-listing`} className="btn btn-primary btn-sm">
              + Add Listing
            </Link>
          </div>
        </div>
      </div>

      {/* LISTINGS */}
      <div className="page-container page-section">
        {listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3 className="empty-title">No products yet</h3>
            <p className="empty-sub">Start adding products to your marketplace!</p>
            <Link to={`/shop/${slug}/new-listing`} className="btn btn-primary">+ Create First Product</Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 className="section-title" style={{ marginBottom: 0 }}>ALL PRODUCTS</h2>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>{listings.length} items for sale</p>
              </div>
              <Link to={`/shop/${slug}/new-listing`} className="btn btn-primary btn-sm">+ New Product</Link>
            </div>

            <div className="product-grid">
              {listings.map((listing: Listing) => {
                const listingImg = listing.images as string[] | undefined
                return (
                <div key={listing.id} className="card product-card" onClick={() => setSelectedListing(listing)}>
                  <div className="product-card-image">
                    {listingImg?.[0]
                      ? <img src={listingImg[0]} alt={listing.title} />
                      : <div className="no-image">🖼️</div>
                    }
                    {discount(listing) && <span className="product-card-badge">-{discount(listing)}%</span>}
                    {!listing.in_stock && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'white', fontWeight: 700, fontSize: 13, background: 'rgba(0,0,0,.7)', padding: '4px 12px', borderRadius: 4 }}>SOLD OUT</span>
                      </div>
                    )}
                  </div>
                  <div className="product-card-info">
                    <p className="product-card-title">{listing.title}</p>
                    <div className="product-card-price">
                      <span className="price-current">{formatVND(listing.price)}</span>
                      {listing.original_price && <span className="price-original">{formatVND(listing.original_price)}</span>}
                    </div>
                    {listing.category && <span className="badge badge-gray" style={{ marginTop: 6, fontSize: 10 }}>{listing.category}</span>}
                  </div>
                </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* LISTING DETAIL MODAL */}
      {selectedListing && (
        <div className="modal-overlay" onClick={() => setSelectedListing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedListing.title}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedListing(null)} style={{ fontSize: 20 }}>×</button>
            </div>
            <div className="modal-body">
              {selectedListing.images?.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' }}>
                  {(selectedListing.images as string[]).map((img: string, i: number) => (
                    <img key={i} src={img} alt="" style={{ height: 200, width: 'auto', borderRadius: 8, flexShrink: 0 }} />
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--red)' }}>{formatVND(selectedListing.price)}</span>
                {selectedListing.original_price && (
                  <span style={{ fontSize: 16, color: 'var(--muted)', textDecoration: 'line-through' }}>{formatVND(selectedListing.original_price)}</span>
                )}
                <span className={`badge ${selectedListing.in_stock ? 'badge-green' : 'badge-gray'}`}>
                  {selectedListing.in_stock ? '✓ In Stock' : 'Sold Out'}
                </span>
              </div>

              {selectedListing.category && <div className="badge badge-red" style={{ marginBottom: 12 }}>{selectedListing.category}</div>}

              {selectedListing.description && (
                <p style={{ fontSize: 14, color: 'var(--mid)', lineHeight: 1.7, marginBottom: 20, whiteSpace: 'pre-wrap' }}>{selectedListing.description}</p>
              )}

              <div className="divider" />
              <div style={{ display: 'flex', gap: 8 }}>
                {deleteConfirm === selectedListing.id ? (
                  <>
                    <span style={{ fontSize: 13, color: 'var(--mid)', flex: 1, alignSelf: 'center' }}>Are you sure?</span>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteListing(selectedListing.id)}>Delete</button>
                    <button className="btn btn-outline btn-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                  </>
                ) : (
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(selectedListing.id)}>🗑 Delete Listing</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

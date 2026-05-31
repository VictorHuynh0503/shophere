import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import { ToastContainer } from '../components/Toast'
import { supabase, Shop } from '../lib/supabase'

const CATEGORIES = ['👗 Fashion', '👟 Shoes', '💄 Beauty', '🏠 Home', '📱 Tech', '🎒 Bags', '💍 Jewelry', '🏃 Sports']

export default function HomePage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('shops').select('*').order('created_at', { ascending: false }).limit(12)
      .then(({ data }: { data: Shop[] | null }) => { setShops(data || []); setLoading(false) })
  }, [])

  return (
    <>
      <Nav />
      <ToastContainer />

      {/* HERO */}
      <section className="hero">
        <p className="hero-eyebrow">✦ Your Fashion Marketplace ✦</p>
        <h1 className="hero-title">SELL ANYTHING<br /><span>ANYWHERE</span></h1>
        <p className="hero-sub">Create your personal shop in 60 seconds. Upload products, share your unique link, start selling.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/create-shop" className="btn btn-primary btn-lg">
            🛍️ Start Selling Free
          </Link>
          <a href="#shops" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,.2)' }}>
            Explore Shops
          </a>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ background: 'white', padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="page-container">
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} className="btn btn-outline btn-sm" style={{ whiteSpace: 'nowrap' }}>{cat}</button>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="page-section" style={{ background: 'white' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 className="section-title">HOW IT WORKS</h2>
            <p className="section-sub">Three simple steps to your own shop</p>
          </div>
          <div className="grid-3">
            {[
              { step: '01', icon: '🏪', title: 'Create Your Shop', desc: 'Pick a unique URL slug like yourshop.com/shop/mystore — it\'s your permanent address.' },
              { step: '02', icon: '📦', title: 'Add Your Listings', desc: 'Upload photos, set prices, write descriptions. Works perfectly on phone camera too.' },
              { step: '03', icon: '🚀', title: 'Share & Sell', desc: 'Share your link anywhere — social media, WhatsApp, Instagram. Start selling instantly.' },
            ].map(item => (
              <div key={item.step} className="card" style={{ padding: 28 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{item.icon}</div>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 48, color: 'var(--red)', opacity: .15, position: 'absolute', top: 16, right: 20 }}>{item.step}</div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--mid)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOPS */}
      <section id="shops" className="page-section">
        <div className="page-container">
          <h2 className="section-title">SHOPS ON SHOPSPHERE</h2>
          <p className="section-sub">Discover sellers from around the world</p>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : shops.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏪</div>
              <h3 className="empty-title">No shops yet!</h3>
              <p className="empty-sub">Be the first seller on ShopSphere.</p>
              <Link to="/create-shop" className="btn btn-primary">Create First Shop</Link>
            </div>
          ) : (
            <div className="product-grid">
              {shops.map(shop => (
                <Link to={`/shop/${shop.slug}`} key={shop.id} className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div style={{ height: 120, background: 'linear-gradient(135deg, #1a1a1a 0%, #2d0a0d 100%)', position: 'relative', overflow: 'hidden' }}>
                    {shop.banner_url && <img src={shop.banner_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .5 }} />}
                    <div style={{ position: 'absolute', bottom: -20, left: 16, width: 48, height: 48, borderRadius: '50%', background: 'var(--red)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: 22, color: 'white', overflow: 'hidden' }}>
                      {shop.logo_url ? <img src={shop.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : shop.name[0].toUpperCase()}
                    </div>
                  </div>
                  <div style={{ padding: '28px 16px 16px' }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{shop.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shop.description || 'Welcome to my shop!'}</div>
                    <div style={{ marginTop: 10, fontSize: 11, color: 'var(--red)', fontWeight: 600 }}>View Shop →</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--black)', color: '#888', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: 'var(--red)', letterSpacing: 3, marginBottom: 12 }}>SHOPSPHERE</div>
        <p style={{ fontSize: 13 }}>Your personal fashion marketplace. Free forever.</p>
      </footer>
    </>
  )
}

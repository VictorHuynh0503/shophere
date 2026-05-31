import { Link } from 'react-router-dom'

export default function Nav({ shopSlug }: { shopSlug?: string }) {
  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">SHOPSPHERE</Link>
      <div className="nav-links">
        {shopSlug && (
          <Link to={`/shop/${shopSlug}`} className="nav-link">← My Shop</Link>
        )}
        <Link to="/" className="nav-link">Explore</Link>
        <Link to="/create-shop" className="nav-link primary">Open a Shop</Link>
      </div>
    </nav>
  )
}

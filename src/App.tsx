import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CreateShopPage from './pages/CreateShopPage'
import ShopPage from './pages/ShopPage'
import CreateListingPage from './pages/CreateListingPage'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create-shop" element={<CreateShopPage />} />
        <Route path="/shop/:slug" element={<ShopPage />} />
        <Route path="/shop/:slug/new-listing" element={<CreateListingPage />} />
      </Routes>
    </BrowserRouter>
  )
}

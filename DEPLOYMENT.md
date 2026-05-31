# ShopSphere Deployment Guide

## Overview
This guide explains how to deploy ShopSphere to Vercel with automatic URL handling and environment configuration.

---

## Prerequisites

- GitHub account with your repository pushed
- Vercel account (free at [vercel.com](https://vercel.com))
- Supabase project with credentials
- Node.js and npm installed locally

---

## Local Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd shopsphere
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from:
1. Go to [supabase.com](https://supabase.com)
2. Open your project → Settings → API
3. Copy **Project URL** and **Anon Key**

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:5174](http://localhost:5174)

---

## Deployment to Vercel

### Step 1: Prepare Your Repository

```bash
# Ensure everything is committed
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in or create an account
3. Click **Add New** → **Project**
4. Click **Import Git Repository**
5. Select your GitHub repository
6. Vercel will auto-detect settings (Vite project)

### Step 3: Configure Environment Variables

**On Vercel Dashboard:**

1. Click **Settings** → **Environment Variables**
2. Add these variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_SUPABASE_URL` | `https://your-project-id.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your anon key | Production, Preview, Development |

3. Click **Save**

### Step 4: Deploy

1. Click **Deploy** button
2. Wait for build to complete (usually 2-3 minutes)
3. Once deployed, you'll get a URL like: `https://shopsphere.vercel.app`

---

## URL Configuration

### Automatic Production URL Replacement ✅

Your app automatically uses the correct domain in production:

```typescript
// In CreateShopPage.tsx and throughout the app
const shopUrl = `${window.location.origin}/shop/${form.slug}`
```

| Environment | URL Generated |
|-------------|---------------|
| **Local** | `http://localhost:5174/shop/testshop` |
| **Vercel** | `https://shopsphere.vercel.app/shop/testshop` |

**No code changes needed!** The app detects the domain at runtime.

---

## Vercel Configuration Details

### vercel.json
Your project includes `vercel.json` with optimized settings:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/(js|css|img|fonts)/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**What this does:**
- ✅ Handles SPA routing correctly
- ✅ No-cache for HTML (always fresh)
- ✅ Long cache for static assets (better performance)

---

## Security Checklist

- ✅ `.env` is in `.gitignore` (secrets not committed)
- ✅ `.env.example` shows what variables are needed
- ✅ Supabase Anon Key is safe for frontend use
- ✅ Environment variables stored securely in Vercel

---

## Testing After Deployment

1. **Visit your Vercel URL**: `https://your-app.vercel.app`
2. **Create a shop**: Test the "Start Selling Free" button
3. **Upload images**: Test camera/file upload (works on mobile too!)
4. **Verify URLs**: Check that shop links use your production domain
5. **Test linking**: Share a shop URL and verify it loads correctly

---

## Post-Deployment Options

### Custom Domain (Optional)

1. On Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records (Vercel provides instructions)
4. App automatically works on new domain!

### Subdomain

For example: `shop.yourdomain.com`
- Same process as custom domain
- Vercel handles SSL automatically

---

## Troubleshooting

### Issue: "Failed to fetch" in Production

**Solution:**
1. Check Vercel environment variables are set correctly
2. Verify Supabase credentials are correct
3. Ensure Supabase RLS policies allow your operations
4. Check browser console for exact error

### Issue: Images not uploading

**Solution:**
1. Verify Supabase storage bucket exists and is public
2. Check RLS policies allow image uploads
3. Ensure bucket name matches in `supabase.ts`

### Issue: Styling issues after deploy

**Solution:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)
3. Check CSS is loading (Network tab in DevTools)

---

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_SUPABASE_URL` | Supabase database URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Frontend API key | `eyJhbGc...` |

**VITE prefix is important!** Vite only exposes variables that start with `VITE_` to the frontend.

---

## File Structure

```
shopsphere/
├── src/
│   ├── components/
│   │   └── ImageUploader.tsx      # Handles phone camera + file upload
│   ├── pages/
│   │   ├── CreateShopPage.tsx     # Shop creation form
│   │   ├── CreateListingPage.tsx  # Product listing form
│   │   └── ShopPage.tsx           # Shop display
│   ├── lib/
│   │   └── supabase.ts            # Supabase client (uses env vars)
│   └── main.tsx
├── .env                            # Local secrets (in .gitignore)
├── .env.example                    # Template for env vars
├── vercel.json                     # Vercel deployment config
├── vite.config.ts                  # Vite build config
└── package.json
```

---

## Quick Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Type check
npx tsc --noEmit
```

---

## Support

For issues or questions:
1. Check Supabase docs: [supabase.com/docs](https://supabase.com/docs)
2. Check Vercel docs: [vercel.com/docs](https://vercel.com/docs)
3. Check Vite docs: [vitejs.dev](https://vitejs.dev)

---

## Additional Features Enabled

### Mobile Optimizations
- ✅ Phone camera capture for images
- ✅ Responsive design for all screen sizes
- ✅ Touch-friendly buttons and inputs

### Image Upload Features
- ✅ Drag & drop support
- ✅ File browser
- ✅ Camera capture
- ✅ Fallback to base64 if storage unavailable

### SPA Routing
- ✅ React Router v6
- ✅ Client-side navigation
- ✅ SEO-friendly structure

---

**Last Updated:** May 31, 2026
**Framework:** Vite + React + TypeScript
**Deployment:** Vercel

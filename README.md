# 🌿 Regen Earth Lanka Foundation

> A cinematic, fully animated website for the Regen Earth Lanka Foundation — building regenerative agriculture and empowering rural communities across Sri Lanka.

**🔗 Live site:** [regen-earth-lanka.web.app](https://regen-earth-lanka.web.app)  
**📁 Repo:** [github.com/isodharas/Regen-Earth-Lanka](https://github.com/isodharas/Regen-Earth-Lanka)

---

## ✨ What's inside

- Full-page smooth scroll experience powered by **Lenis**
- **Three.js** particle field in the hero (2000 WebGL points)
- **GSAP ScrollTrigger** animated counters + parallax
- **Framer Motion** — section reveals, pillar overlays, hover effects
- Interactive pillar circles with fullscreen story overlays
- Cinematic Impact section with parallax background
- Fully **responsive** — mobile hamburger menu + stacked layouts
- Deployed on **Firebase Hosting** with SSL

---

## 🛠 Tech Stack

| Tool | Purpose |
|---|---|
| React 18 + Vite | Frontend framework & build tool |
| Tailwind CSS v4 | Utility styling |
| Framer Motion | Animations & transitions |
| GSAP + ScrollTrigger | Scroll-based animations & counters |
| Three.js + R3F | WebGL particle field in hero |
| Lenis | Smooth scroll |
| Firebase Hosting | Deployment & SSL |

---

## 🚀 Run locally

```bash
# Clone the repo
git clone https://github.com/isodharas/Regen-Earth-Lanka.git
cd Regen-Earth-Lanka

# Install dependencies
npm install --legacy-peer-deps

# Start dev server
npm run dev
```

Open [localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Deploy

```bash
# Build for production
npm run build

# Deploy to Firebase
firebase deploy
```

> Make sure you're logged into Firebase CLI: `firebase login`

---

## 📁 Project structure

```
Regen-Earth-Lanka/
├── src/
│   ├── pages/
│   │   └── Home.jsx        # All sections live here
│   ├── App.jsx             # Lenis smooth scroll wrapper
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles + Tailwind
├── public/
├── firebase.json           # Firebase hosting config
├── vite.config.js          # Vite + Tailwind + dedup fix
└── package.json
```

---

## 🌍 Sections

1. **Hero** — Full bleed parallax + Three.js particles + GSAP loading screen
2. **Ticker** — Scrolling marquee
3. **Stats** — Animated counters
4. **About** — Image parallax + floating stat card
5. **Pillars** — 4 interactive circle bubbles with fullscreen overlays
6. **Impact** — Cinematic dark section with big number stats
7. **Partners** — 3D tilt cards with photo reveals
8. **Leadership** — Glowing avatar cards
9. **Get Involved** — Full-height photo cards with hover reveals
10. **Contact** — Split layout with animated email links
11. **Footer**

---

## 🔧 Notes

- Animation packages installed with `--legacy-peer-deps` due to React 18 peer dep conflicts
- `vite.config.js` uses `resolve.dedupe` to fix React duplicate instance error from `@react-three/fiber`
- Tailwind v4 uses `@import "tailwindcss"` — not the old `@tailwind` directives
- Google Fonts import must come **before** `@import "tailwindcss"` in `index.css`

---

Built with 💚 for the earth.

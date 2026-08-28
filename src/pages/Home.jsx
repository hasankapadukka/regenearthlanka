import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect, Suspense } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import anushkaImage from '../assets/leadership/anushka.jpg'
import lakshmiImage from '../assets/leadership/lakshmi.jpg'
import hasankaImage from '../assets/leadership/hasanka.jpg'
import dananjayaImage from '../assets/leadership/dananjaya.jpg'
import chandrakanthiImage from '../assets/leadership/chandrakanthi.jpg'
import bespiceLogo from '../assets/partner/bespice_logo.png'
import livNatureLogo from '../assets/partner/livnature.png'
import thurulkLogo from '../assets/partner/thurulk_logo.png'
import ztLogo from '../assets/partner/zt_logo-1.webp'

gsap.registerPlugin(ScrollTrigger)

/*
  SCRIPT FONT — Dancing Script from Google Fonts
  Used for handwritten overlay text (like the GenocideEdu design).
  We inject a <link> tag into the document head once on load.
  The font is only used decoratively — never for body text.
*/
const scriptFontLink = document.createElement('link')
scriptFontLink.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&display=swap'
scriptFontLink.rel  = 'stylesheet'
if (!document.querySelector('[href*="Dancing+Script"]')) document.head.appendChild(scriptFontLink)

const SCRIPT = "'Dancing Script', cursive"  // handwritten font shorthand

const C = {
  soil:  '#2c1a0e', bark: '#4a2e1a', clay: '#7a4a28',
  sand:  '#c4a882', straw: '#e8d9bc', cream: '#f5f0e8',
  sage:  '#4a6e38', moss: '#35522a', leaf: '#6a9e4a',
}

const IMG = {
  logo:'../src/assets/regen_earth_lanka_foundation_logo.png',
  heroPerson: 'https://images.unsplash.com/photo-1680711155007-1bb8e70d4a9f?q=80&w=1065&auto=format&fit=crop',
  about:      'https://plus.unsplash.com/premium_photo-1769868306356-9b5fa1945450?q=80&w=986&auto=format&fit=crop',
  aboutWide:  'https://images.unsplash.com/photo-1581976684536-eb40b61ee175?q=80&w=2070&auto=format&fit=crop',
  forest:     'https://images.unsplash.com/photo-1674567926019-b0388b4de9e1?q=80&w=1674&auto=format&fit=crop',
  farming:    'https://images.unsplash.com/photo-1682177612238-45c661997aee?q=80&w=985&auto=format&fit=crop',
  community:  'https://images.unsplash.com/photo-1642518939037-4652638c17a7?q=80&w=2070&auto=format&fit=crop',
  circular:   'https://images.unsplash.com/photo-1595509244677-1bfdbaa0dfce?q=80&w=987&auto=format&fit=crop',
  landscape:  'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1800&q=80&fit=crop',
}

/*
  useIsMobile — returns true when viewport width < 768px.
  We check window.innerWidth on first render, then listen to
  resize events so the layout updates live when you rotate
  the phone or resize the browser window.
*/
function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

function Container({ children, style = {} }) {
  const isMobile = useIsMobile()
  return (
    <div style={{ width: '100%', maxWidth: 1140, marginLeft: 'auto', marginRight: 'auto', paddingLeft: isMobile ? 20 : 40, paddingRight: isMobile ? 20 : 40, boxSizing: 'border-box', ...style }}>
      {children}
    </div>
  )
}

function Label({ text, light = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <div style={{ width: 28, height: 1, background: light ? C.sand : C.clay, flexShrink: 0 }} />
      <span style={{ color: light ? C.sand : C.clay, fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 500 }}>{text}</span>
    </div>
  )
}

/* ── THREE.JS PARTICLES ─────────────────────────────────
   2000 random points rendered in WebGL via Three.js.
   useFrame rotates them every tick for a living feel.
   Sits inside a <Canvas> in the hero, z-index 2.
──────────────────────────────────────────────────────── */
function ParticleField() {
  const ref = useRef()
  const positions = new Float32Array(2000 * 3)
  for (let i = 0; i < 2000; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 6
    positions[i * 3 + 1] = (Math.random() - 0.5) * 6
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3
  }
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.04
      ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.02) * 0.08
    }
  })
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#c4a882" size={0.004} sizeAttenuation depthWrite={false} opacity={0.45} />
    </Points>
  )
}

/* ── LOADING SCREEN ─────────────────────────────────────
   GSAP timeline:
   1. Logo scales + fades in (back.out easing = springy)
   2. Text slides up
   3. Progress bar fills (scaleX 0→1)
   4. Whole loader fades out → onComplete() called
   → Home page fades in
──────────────────────────────────────────────────────── */
function LoadingScreen({ onComplete }) {
  const loaderRef  = useRef()
  const logoRef    = useRef()
  const textRef    = useRef()
  const barRef     = useRef()

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => gsap.to(loaderRef.current, {
        opacity: 0, duration: 0.6, ease: 'power2.inOut', onComplete,
      })
    })
    tl.fromTo(logoRef.current,
      { opacity: 0, scale: 0.6, rotation: -15 },
      { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' }
    )
    .fromTo(textRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.3'
    )
    .fromTo(barRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.2, ease: 'power2.inOut', transformOrigin: 'left' },
      '+=0.1'
    )
    .to({}, { duration: 0.3 })
  }, [])

  return (
    <div ref={loaderRef} style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: '#080301',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24,
    }}>
      <div ref={logoRef} style={{ opacity: 0 }}>
        {/* <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="35" fill="none" stroke={C.moss} strokeWidth="1.5" />
          <circle cx="36" cy="36" r="35" fill={C.moss} opacity="0.15" />
          <path d="M36 14C29 22 22 28 25 38C28 46 36 50 36 50C36 50 44 46 47 38C50 28 43 22 36 14Z" fill={C.leaf} />
          <line x1="36" y1="24" x2="36" y2="50" stroke={C.cream} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="36" y1="35" x2="44" y2="30" stroke={C.cream} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <line x1="36" y1="40" x2="28" y2="36" stroke={C.cream} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        </svg> */}
      </div>
      <div ref={textRef} style={{ opacity: 0, textAlign: 'center' }}>
        <img src={IMG.logo} alt="Regen Earth Lanka Foundation" style={{ width: 160, height: 'auto', display: 'block', margin: '0 auto' }} />
        {/* <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 22, color: C.cream, letterSpacing: '3px', textTransform: 'uppercase' }}>Regen Earth Lanka</div>
        <div style={{ fontSize: 10, color: C.sand, letterSpacing: '4px', textTransform: 'uppercase', marginTop: 6, opacity: 0.7 }}>Foundation</div> */}
      </div>
      <div style={{ width: 160, height: 1, background: 'rgba(196,168,130,0.15)', marginTop: 8 }}>
        <div ref={barRef} style={{ height: '100%', background: C.sand, transformOrigin: 'left', transform: 'scaleX(0)' }} />
      </div>
    </div>
  )
}

/* ── ANIMATED COUNTER ───────────────────────────────────
   GSAP ScrollTrigger fires when stat enters viewport.
   Animates a dummy object {val: 0} to {val: target}.
   onUpdate reads val and sets React state → re-renders.
──────────────────────────────────────────────────────── */
function AnimatedCounter({ target }) {
  const [display, setDisplay] = useState('0')
  const ref = useRef()
  const numericTarget = parseFloat(target.replace(/[^0-9.]/g, ''))
  const hasPlusSign   = target.includes('+')

  useGSAP(() => {
    const obj = { val: 0 }
    gsap.to(obj, {
      val: numericTarget,
      duration: 2.2,
      ease: 'power2.out',
      scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true },
      onUpdate() {
        const v = Math.floor(obj.val)
        setDisplay(v >= 1000 ? v.toLocaleString() : String(v))
      },
    })
  }, { scope: ref })

  return <span ref={ref}>{display}{hasPlusSign ? '+' : ''}</span>
}

/* ── NAVBAR ─────────────────────────────────────────────── */
/* ── NAVBAR ──────────────────────────────────────────────────
   Mobile: shows logo + hamburger icon only.
   Hamburger opens a fullscreen dark menu that slides down.
   Desktop: shows logo + nav links + Partner CTA.
   scrolled state adds a frosted glass background once
   the user has scrolled past 60px.
────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const navLinks = [
    { label: 'Mission',  href: 'mission'  },
    { label: 'Our Work', href: 'our-work' },
    { label: 'Impact',   href: 'impact'   },
    { label: 'Partners', href: 'partners' },
    { label: 'Contact',  href: 'contact'  },
  ]

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const navColor = scrolled || menuOpen ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,1)'

  return (
    <>
      <motion.nav
        initial={{ y: -110 }} animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 3.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 110,
          background: scrolled || menuOpen ? 'rgba(255,255,255,1)' : 'transparent',
          color: navColor,
          backdropFilter: scrolled || menuOpen ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(196,168,130,0.08)' : 'none',
          transition: 'background 0.4s',
          display: 'flex', alignItems: 'center',
        }}
      >
        <Container style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 5 }}>
            <img src={IMG.logo} alt="Regen Earth Lanka Foundation" style={{ width: 100, height: 100, display: 'block' }} />
            {/* <svg width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="16" fill={C.moss} />
              <path d="M16 7C13 11 10 14 12 19C14 23 16 25 16 25C16 25 18 23 20 19C22 14 19 11 16 7Z" fill={C.leaf} />
              <line x1="16" y1="12" x2="16" y2="25" stroke={C.cream} strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: C.cream, lineHeight: 1.1, letterSpacing: '1px' }}>Regen Earth Lanka</div>
              <div style={{ fontSize: 8, color: C.sand, letterSpacing: '2.5px', textTransform: 'uppercase' }}>Foundation</div>
            </div> */}
          </div>

          {/* Desktop nav */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              {navLinks.map(l => (
                <a key={l.label} href={`#${l.href}`}
                  onClick={e => { e.preventDefault(); scrollTo(l.href) }}
                  style={{ color: navColor, fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = C.straw}
                  onMouseLeave={e => e.target.style.color = navColor}
                >{l.label}</a>
              ))}
              <motion.a href="#contact"
                onClick={e => { e.preventDefault(); scrollTo('contact') }}
                whileHover={{ background: C.sand, color: C.soil }}
                style={{ border: '1.5px solid rgba(196,168,130,0.4)', color: navColor, padding: '8px 22px', fontSize: 11, textDecoration: 'none', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', transition: 'background 0.2s, color 0.2s', display: 'block', borderRadius: 999 }}
              >Partner</motion.a>
            </div>
          )}

          {/* Mobile hamburger button */}
          {isMobile && (
            <button onClick={() => setMenuOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', flexDirection: 'column', gap: 5 }}
            >
              {/* 3 lines that animate to X */}
              <motion.div animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }} style={{ width: 24, height: 2, background: navColor, borderRadius: 2, transition: 'background 0.2s' }} />
              <motion.div animate={{ opacity: menuOpen ? 0 : 1 }} style={{ width: 24, height: 2, background: navColor, borderRadius: 2 }} />
              <motion.div animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }} style={{ width: 24, height: 2, background: navColor, borderRadius: 2 }} />
            </button>
          )}
        </Container>
      </motion.nav>

      {/* Mobile fullscreen menu — slides down from top */}
      <AnimatePresence>
        {isMobile && menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed', top: 110, left: 0, right: 0, zIndex: 199,
              background: 'rgba(8,3,1,0.98)', backdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(196,168,130,0.1)',
              padding: '32px 24px 40px', display: 'flex', flexDirection: 'column', gap: 4,
            }}
          >
            {navLinks.map((l, i) => (
              <motion.button key={l.label}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => scrollTo(l.href)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 32, fontWeight: 800, color: C.cream,
                  textTransform: 'uppercase', textAlign: 'left',
                  padding: '10px 0', letterSpacing: '-0.5px',
                  borderBottom: '1px solid rgba(245,240,232,0.06)',
                }}
              >{l.label}</motion.button>
            ))}
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              onClick={() => scrollTo('contact')}
              style={{
                marginTop: 24, background: C.sage, border: 'none', cursor: 'pointer',
                color: C.cream, padding: '14px', fontSize: 11, fontWeight: 700,
                letterSpacing: '2px', textTransform: 'uppercase', borderRadius: 999,
              }}
            >Partner With Us →</motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ── HERO ───────────────────────────────────────────────── */
function Hero() {
  const isMobile = useIsMobile()
  const ref = useRef()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const bgY   = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])

  return (
    <section ref={ref} style={{ height: '100vh', minHeight: 700, position: 'relative', overflow: 'hidden', background: '#080301' }}>

      {/* Three.js particle field */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, opacity: 0.55 }}>
        <Canvas camera={{ position: [0, 0, 1.5], fov: 75 }}>
          <Suspense fallback={null}>
            <ParticleField />
          </Suspense>
        </Canvas>
      </div>

      {/* Full bleed duotone photo — parallax */}
      <motion.div style={{ position: 'absolute', inset: 0, zIndex: 1, y: bgY }}>
        <div style={{
          position: 'absolute', top: '-15%', left: 0, right: 0, bottom: '-15%',
          backgroundImage: `url(${IMG.heroPerson})`,
          backgroundSize: 'cover', backgroundPosition: 'center 20%',
          filter: 'grayscale(100%) contrast(1.15) brightness(0.6)',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(44,26,14,0.55)', mixBlendMode: 'multiply' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(74,110,56,0.2)', mixBlendMode: 'screen' }} />
      </motion.div>

      {/* Gradient overlays */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 3, background: 'linear-gradient(to top, rgba(8,3,1,0.98) 0%, rgba(8,3,1,0.75) 22%, rgba(8,3,1,0.25) 55%, transparent 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 3, background: 'linear-gradient(to right, rgba(8,3,1,0.55) 0%, transparent 60%)' }} />

      {/* TEXT */}
      <motion.div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, zIndex: 4, y: textY }}>
        <Container style={{ paddingBottom: isMobile ? 40 : 64 }}>
          <div > {/* style={{ maxWidth: 600 }} */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 3.4 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}
            >
              <div style={{ width: 32, height: 1, background: C.sand }} />
              <span style={{ color: C.sand, fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase' }}>Environmental Regeneration · Sri Lanka</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 3.55, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(52px, 7vw, 100px)', fontWeight: 800, lineHeight: 0.95, color: C.cream, margin: 0, textTransform: 'uppercase', letterSpacing: '-1px', position: 'relative' }}
            >
              Regenerating<br />
              <span style={{ color: C.leaf, fontStyle: 'italic' }}>Land & Lives</span><br />
              Across Sri Lanka.
              {/* Handwritten script overlay — inspired by GenocideEdu design */}
              <motion.span
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 4.3 }}
                style={{
                  position: 'absolute', bottom: '-18px', right: '-20px',
                  fontFamily: SCRIPT, fontSize: 'clamp(28px, 3.5vw, 48px)',
                  fontWeight: 600, color: C.leaf, opacity: 0.55,
                  pointerEvents: 'none', whiteSpace: 'nowrap',
                  transform: 'rotate(-4deg)',
                }}
              >for the earth.</motion.span>
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 4.0, ease: 'easeOut' }}
              style={{ width: 48, height: 1, background: C.sand, margin: '24px 0', transformOrigin: 'left' }}
            />

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 4.1 }}
              style={{ display: 'flex', alignItems: 'flex-end', gap: 36, flexWrap: 'wrap' }}
            >
              <p style={{ color: 'rgba(245,240,232,0.52)', fontSize: 15, lineHeight: 1.8, maxWidth: 380, margin: 0, fontWeight: 300 }}>
                A foundation advancing environmental restoration, rural empowerment, and sustainable export development across Sri Lanka.
              </p>
              <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                <motion.a href="#our-work"
                  whileHover={{ scale: 1.03, boxShadow: '0 8px 28px rgba(74,110,56,0.5)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{ background: C.sage, color: C.cream, padding: '13px 32px', fontSize: 11, textDecoration: 'none', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block', borderRadius: 999 }}
                >Explore</motion.a>
                <motion.a href="#contact"
                  whileHover={{ background: 'rgba(245,240,232,0.08)' }}
                  style={{ border: '1.5px solid rgba(245,240,232,0.3)', color: C.cream, padding: '13px 32px', fontSize: 11, textDecoration: 'none', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block', transition: 'background 0.2s', borderRadius: 999 }}
                >Partner With Us</motion.a>
              </div>
            </motion.div>
          </div>
        </Container>
      </motion.div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', right: 40, bottom: 64, zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <motion.div
          animate={{ height: [24, 48, 24] }} transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          style={{ width: 1, background: `linear-gradient(to bottom, transparent, ${C.sand}, transparent)` }}
        />
        <span style={{ color: 'rgba(196,168,130,0.4)', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', writingMode: 'vertical-rl' }}>scroll</span>
      </div>
    </section>
  )
}

/* ── TICKER ─────────────────────────────────────────────── */
function Ticker() {
  const items = ['Environmental Regeneration', 'Economic Empowerment', 'Social Inclusion', 'Circular Systems', 'Regenerative Agriculture', 'Rural Livelihoods', 'Sustainable Sri Lanka']
  const all = [...items, ...items]
  return (
    <div style={{ background: C.moss, padding: '12px 0', overflow: 'hidden' }}>
      <motion.div
        animate={{ x: ['0%', '-50%'] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'flex', whiteSpace: 'nowrap', width: 'max-content' }}
      >
        {all.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', paddingRight: 36 }}>
            <span style={{ color: C.straw, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500 }}>{item}</span>
            <span style={{ color: C.sand, opacity: 0.35, fontSize: 14, marginLeft: 36 }}>·</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

/* ── STATS ──────────────────────────────────────────────── */
function Stats() {
  const isMobile = useIsMobile()
  const stats = [
    { n: '4',     label: 'Strategic Pillars' },
    { n: '25+',   label: 'Partner Organizations' },
    { n: '1000+', label: 'Farming Families' },
    { n: '2024',  label: 'Year Established' },
  ]
  return (
    <section style={{ background: C.cream }}>
      <Container>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', borderBottom: `1px solid ${C.straw}` }}>
          {stats.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
              style={{ padding: '52px 0', paddingLeft: i > 0 ? 36 : 0, borderRight: i < 3 ? `1px solid ${C.straw}` : 'none' }}
            >
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 58, fontWeight: 800, color: C.soil, lineHeight: 1 }}>
                <AnimatedCounter target={s.n} />
              </div>
              <div style={{ color: C.clay, fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, marginTop: 8 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ── ABOUT ──────────────────────────────────────────────── */
function About() {
  const isMobile = useIsMobile()
  const sectionRef = useRef()
  useGSAP(() => {
    gsap.fromTo('.about-img-inner',
      { scale: 1.12 },
      { scale: 1, ease: 'none', scrollTrigger: { trigger: '.about-img-inner', start: 'top bottom', end: 'bottom top', scrub: true } }
    )
  }, { scope: sectionRef })

  return (
    <section id="mission" ref={sectionRef} style={{ background: C.cream, padding: '100px 0', overflow: 'hidden' }}>
      <Container>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 32 : 64, alignItems: 'start' }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9 }}
            style={{ position: 'relative', paddingBottom: 28, paddingRight: 28 }}
          >
            <div style={{ height: 500, borderRadius: 3, overflow: 'hidden' }}>
              <div className="about-img-inner" style={{ width: '100%', height: '112%', marginTop: '-6%' }}>
                <img src={IMG.aboutWide} alt="Farmer" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 170, height: 170, borderRadius: 3, overflow: 'hidden', border: `4px solid ${C.cream}`, boxShadow: '0 8px 28px rgba(0,0,0,0.15)' }}>
              <img src={IMG.about} alt="Soil" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: 0.3 }}
              style={{ position: 'absolute', top: 36, right: -4, background: C.moss, padding: '16px 20px', boxShadow: '0 6px 24px rgba(0,0,0,0.2)' }}
            >
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800, color: C.leaf, lineHeight: 1 }}>16+</div>
              <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.65)', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: 3 }}>Active Programs</div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.15 }}
            style={{ paddingTop: 28 }}
          >
            <Label text="Who We Are" />
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px, 3.5vw, 52px)', fontWeight: 800, color: C.soil, lineHeight: 1.05, marginBottom: 24, textTransform: 'uppercase' }}>
              Where Ecology Meets <em style={{ color: C.sage, fontStyle: 'italic' }}>Community.</em>
            </h2>
            <p style={{ color: '#6b5a48', fontSize: 15, lineHeight: 1.9, marginBottom: 16 }}>
              Regen Earth Lanka Foundation works at the intersection of environmental restoration, rural economic empowerment, and ethical export development.
            </p>
            <p style={{ color: '#6b5a48', fontSize: 15, lineHeight: 1.9, marginBottom: 32 }}>
              We build regenerative agricultural systems, strengthen farmer livelihoods, empower women and youth, and promote circular production models that support local resilience and global markets.
            </p>
            <div style={{ borderTop: `1px solid ${C.straw}`, paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Vision',  text: 'A regenerative, climate-resilient Sri Lanka where rural communities thrive through sustainable agriculture and ethical global trade.' },
                { label: 'Mission', text: 'Restore ecosystems, empower communities, and create low-carbon export value chains through innovation and collaboration.' },
              ].map((v, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.15 }}
                  style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}
                >
                  <span style={{ background: C.soil, color: C.straw, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', padding: '4px 10px', flexShrink: 0, marginTop: 3 }}>{v.label}</span>
                  <p style={{ color: '#6b5a48', fontSize: 13, lineHeight: 1.75, margin: 0 }}>{v.text}</p>
                </motion.div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{href:'#our-work',label:'Our Programs',filled:true},{href:'#impact',label:'View Impact',filled:false}].map((btn,i)=>(
                <motion.a key={i} href={btn.href}
                  whileHover={{ y: -2, boxShadow: btn.filled ? '0 8px 24px rgba(44,26,14,0.3)' : 'none' }}
                  style={{ background: btn.filled ? C.soil : 'transparent', border: btn.filled ? 'none' : `1.5px solid ${C.soil}`, color: btn.filled ? C.cream : C.soil, padding: '12px 28px', textDecoration: 'none', fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block', borderRadius: 999 }}
                >{btn.label}</motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}

/* ── PILLAR FULLSCREEN OVERLAY ──────────────────────────────
   When you click a circle, this overlay appears over the
   entire screen. It uses AnimatePresence so it smoothly
   fades+scales in and out.

   How the animation works:
   - Backdrop: fades from opacity 0 → 1
   - Content panel: slides up from y:60 + scales from 0.95 → 1
   - Close button (×) in top-right corner
   - Press Escape key also closes it
   - body scroll is locked while overlay is open
──────────────────────────────────────────────────────────── */
function PillarOverlay({ pillar, onClose }) {
  // Lock background scroll while overlay is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const stories = {
    '01': {
      headline: 'Healing the Land,\nOne Acre at a Time.',
      body: 'Sri Lanka\'s soils have been degraded by decades of chemical-intensive farming. Regen Earth Lanka works directly with farming communities to restore soil biodiversity, reintroduce native agroforestry systems, and build water-resilient landscapes that thrive for generations.',
      facts: ['40% of Sri Lanka\'s agricultural land is degraded', 'Regenerative practices increase yields by 20–40%', 'Agroforestry sequesters carbon while feeding families'],
      cta: 'Join the Restoration'
    },
    '02': {
      headline: 'Fair Value for\nEvery Harvest.',
      body: 'Rural farmers often receive a fraction of the true value of their produce. We connect smallholders directly to ethical export markets, provide financial literacy training, and build cooperative models that ensure every family earns a living wage from the land.',
      facts: ['Average farmer income increases 3× with fair trade access', 'Direct export partnerships bypass 4 layers of middlemen', 'Women-led cooperatives show 60% higher retention rates'],
      cta: 'Support Fair Trade'
    },
    '03': {
      headline: 'Communities That\nLead Their Own Future.',
      body: 'True sustainability starts with the people. We run youth leadership programs, women\'s enterprise incubators, and community governance training — ensuring that regeneration is community-led, not imposed from outside.',
      facts: ['500+ women trained in enterprise development', '12 active youth leadership chapters island-wide', 'Marginalized communities lead 70% of our programs'],
      cta: 'Get Involved'
    },
    '04': {
      headline: 'Closing the Loop\non Waste.',
      body: 'We help agricultural communities transition to circular production models — turning crop waste into biochar, replacing plastic packaging with natural alternatives, and building low-carbon supply chains that are both profitable and regenerative.',
      facts: ['80% of agricultural waste can become productive input', 'Circular packaging reduces export costs by 15%', 'Biochar production creates carbon credits for farmers'],
      cta: 'Learn About Circular'
    },
  }

  const story = stories[pillar.n]

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(8,3,1,0.92)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      {/* Panel — stop clicks from closing when clicking inside */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#2d1c10', maxWidth: 860, width: '100%',
          maxHeight: '88vh', overflowY: 'auto',
          position: 'relative', borderRadius: 4,
          boxShadow: '0 40px 120px rgba(0,0,0,0.8)',
        }}
      >
        {/* Hero image strip */}
        <div style={{ height: 280, position: 'relative', overflow: 'hidden' }}>
          <img src={pillar.img} alt={pillar.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              filter: 'brightness(0.85) saturate(1.1)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #2d1c10 0%, transparent 55%)' }} />

          {/* Script overlay on image — just like GenocideEdu */}
          <div style={{ position: 'absolute', bottom: 24, left: 36, right: 80 }}>
            <div style={{ fontFamily: SCRIPT, fontSize: 42, color: C.cream, opacity: 0.85, transform: 'rotate(-2deg)', lineHeight: 1.2, textShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>
              {pillar.script}
            </div>
          </div>

          {/* Pillar number watermark */}
          <div style={{ position: 'absolute', top: 24, left: 36, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: pillar.accent, letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700 }}>
            Pillar {pillar.n}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '40px 44px 52px' }}>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, color: C.cream, lineHeight: 1.05, textTransform: 'uppercase', marginBottom: 24, whiteSpace: 'pre-line' }}>
            {story.headline}
          </h2>

          <p style={{ color: 'rgba(245,240,232,0.85)', fontSize: 15, lineHeight: 1.9, marginBottom: 36 }}>
            {story.body}
          </p>

          {/* Key facts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40, borderLeft: `3px solid ${pillar.accent}`, paddingLeft: 20 }}>
            {story.facts.map((fact, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                style={{ color: 'rgba(245,240,232,0.92)', fontSize: 14, lineHeight: 1.6 }}
              >
                {fact}
              </motion.div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <motion.a href="#contact"
              onClick={onClose}
              whileHover={{ scale: 1.03, boxShadow: `0 8px 24px rgba(74,110,56,0.4)` }}
              style={{ background: C.sage, color: C.cream, padding: '13px 32px', fontSize: 11, textDecoration: 'none', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', borderRadius: 999 }}
            >{story.cta}</motion.a>
            <button onClick={onClose}
              style={{ background: 'transparent', border: '1.5px solid rgba(245,240,232,0.15)', color: 'rgba(245,240,232,0.5)', padding: '13px 28px', fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', borderRadius: 999, cursor: 'pointer' }}
            >Close</button>
          </div>
        </div>

        {/* × close button top right */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(245,240,232,0.1)', border: 'none',
          color: C.cream, fontSize: 20, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.target.style.background = 'rgba(245,240,232,0.2)'}
          onMouseLeave={e => e.target.style.background = 'rgba(245,240,232,0.1)'}
        >×</button>
      </motion.div>
    </motion.div>
  )
}

/* ── PILLARS — Circle bubbles that fly in from sides ────────
   Animation breakdown:
   - Circles 1 & 3 fly in from the LEFT  (x: -120)
   - Circles 2 & 4 fly in from the RIGHT (x: +120)
   - Each staggered 0.15s apart
   - On hover: circle pulses + border glows
   - On click: opens PillarOverlay fullscreen story
   - whileInView fires when circle enters the viewport
──────────────────────────────────────────────────────────── */
function Pillars() {
  const isMobile = useIsMobile()
  const [activePillar, setActivePillar] = useState(null)

  const pillars = [
    { n:'01', title:'Environmental\nRegeneration', script:'Restore.', img:IMG.forest,    accent:C.leaf,    items:['Regenerative agriculture','Soil health','Agroforestry','Water stewardship'] },
    { n:'02', title:'Economic\nEmpowerment',       script:'Grow.',    img:IMG.farming,   accent:'#b8922a', items:['Fair pricing','Farmer income','Value addition','Export chains'] },
    { n:'03', title:'Social\nInclusion',           script:'Unite.',   img:IMG.community, accent:C.sand,    items:['Women enterprises','Youth engagement','Training'] },
    { n:'04', title:'Circular\nSystems',           script:'Sustain.', img:IMG.circular,  accent:C.straw,   items:['Waste-to-value','Sustainable packaging','Clean energy'] },
  ]

  return (
    <section id="our-work" style={{ background: C.soil, padding: '96px 0', overflow: 'hidden' }}>
      {/* Fullscreen overlay — AnimatePresence handles mount/unmount animation */}
      <AnimatePresence>
        {activePillar && (
          <PillarOverlay pillar={activePillar} onClose={() => setActivePillar(null)} />
        )}
      </AnimatePresence>

      <Container>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap', marginBottom: 72 }}>
            <div>
              <Label text="Strategic Framework" light />
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px, 3.5vw, 52px)', fontWeight: 800, color: C.cream, lineHeight: 1.05, maxWidth: 420, textTransform: 'uppercase', margin: 0 }}>
                Four Pillars of{' '}
                <em style={{ fontFamily: SCRIPT, color: C.leaf, textTransform: 'none', fontSize: '0.85em', fontWeight: 600 }}>Lasting Impact</em>
              </h2>
            </div>
            <p style={{ color: 'rgba(245,240,232,0.38)', fontSize: 14, lineHeight: 1.8, maxWidth: 260, margin: 0 }}>
              Tap any circle to explore the full story behind each pillar.
            </p>
          </div>
        </motion.div>

        {/* Circle bubbles — fly in from alternating sides */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 16 : 24 }}>
          {pillars.map((p, i) => {
            const fromX = i % 2 === 0 ? -120 : 120

            return (
              <motion.div key={i}
                initial={{ opacity: 0, x: fromX, scale: 0.8 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.15, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
              >
                {/* Wrapper for floating bob animation */}
                {/*
                  animate={{ y: [0, -12, 0] }} = bobs up 12px then back down
                  Each circle has a different duration so they move out of sync
                  — makes it feel organic, not robotic
                */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 2.8 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ position: 'relative', cursor: 'pointer' }}
                  onClick={() => setActivePillar(p)}
                >
                  {/*
                    PULSING GLOW RING:
                    This is an absolutely positioned div BEHIND the circle.
                    It scales from 1→1.35 and fades out on repeat.
                    Gives the "breathing" glow effect.
                    Each circle has a different delay so they pulse at different times.
                  */}
                  <motion.div
                    animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.55, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute', inset: -8,
                      borderRadius: '50%',
                      border: `2px solid ${p.accent}`,
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Second outer ring — slower pulse, bigger */}
                  <motion.div
                    animate={{ scale: [1, 1.55, 1], opacity: [0.25, 0, 0.25] }}
                    transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.55 + 0.4, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute', inset: -8,
                      borderRadius: '50%',
                      border: `1.5px solid ${p.accent}`,
                      pointerEvents: 'none',
                    }}
                  />

                  {/* THE CIRCLE */}
                  <motion.div
                    whileHover={{ scale: 1.13 }}
                    whileTap={{ scale: 0.93 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{
                      width: isMobile ? 150 : 220, height: isMobile ? 150 : 220, borderRadius: '50%',
                      overflow: 'hidden', position: 'relative',
                      border: `2.5px solid ${p.accent}66`,
                      flexShrink: 0,
                    }}
                  >
                    <div style={{
                      position: 'absolute', inset: 0,
                      backgroundImage: `url(${p.img})`,
                      backgroundSize: 'cover', backgroundPosition: 'center',
                    }}/>

                    {/* Overlay darkens on hover via parent hover */}
                    <motion.div
                      whileHover={{ opacity: 0.2 }}
                      style={{ position: 'absolute', inset: 0, background: 'rgba(14,5,1,0.42)', transition: 'opacity 0.3s' }}
                    />

                    {/* Script word — always visible */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span style={{
                        fontFamily: SCRIPT, fontSize: 38, fontWeight: 700,
                        color: C.cream, textShadow: '0 2px 16px rgba(0,0,0,0.8)',
                        transform: 'rotate(-8deg)', display: 'block',
                      }}>{p.script}</span>

                      {/*
                        "Tap to explore" is ALWAYS visible now — not hidden.
                        Uses a small pill badge style so it reads as a CTA button.
                        This is the key UX fix — makes clickability obvious.
                      */}
                      <div style={{
                        background: 'rgba(255,255,255,0.18)',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        borderRadius: 999,
                        padding: '4px 14px',
                        fontSize: 10, color: C.cream,
                        letterSpacing: '1.5px', textTransform: 'uppercase',
                        fontWeight: 600, fontFamily: 'Inter, sans-serif',
                      }}>Explore →</div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Text below */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: p.accent, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Pillar {p.n}</div>
                  <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 800, color: C.cream, marginBottom: 10, lineHeight: 1.2, whiteSpace: 'pre-line', textTransform: 'uppercase' }}>{p.title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {p.items.map((item, j) => (
                      <div key={j} style={{ color: 'rgba(245,240,232,0.45)', fontSize: 12 }}>{item}</div>
                    ))}
                  </div>

                  {/* Clickable text link below — second affordance */}
                  <motion.button
                    onClick={() => setActivePillar(p)}
                    whileHover={{ color: p.accent, x: 4 }}
                    style={{
                      background: 'none', border: 'none',
                      color: 'rgba(245,240,232,0.3)', fontSize: 11,
                      letterSpacing: '1.5px', textTransform: 'uppercase',
                      cursor: 'pointer', marginTop: 10, fontFamily: 'Inter, sans-serif',
                      transition: 'color 0.2s',
                    }}
                  >Read more →</motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

/* ── IMPACT ─────────────────────────────────────────────────
   STRUCTURE:
   1. Full bleed parallax landscape photo background
   2. Big stat counters row — 4 huge animated numbers
   3. Metric cards — fly in from bottom with stagger
   4. Full-width cinematic quote block with script accent
   
   WHY it feels more dramatic:
   - Parallax bg moves at 0.4× scroll speed (useTransform)
   - Numbers count up from 0 when section enters viewport
   - Cards have glow border on hover, not just lift
   - Quote is HUGE — nearly full width, commanding
──────────────────────────────────────────────────────────── */
function Impact() {
  const isMobile = useIsMobile()
  const sectionRef = useRef()
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  // Parallax: bg moves slower than scroll → depth effect
  const bgY = useTransform(scrollYProgress, [0, 1], ['-15%', '15%'])

  const bigStats = [
    { n: '40+',  label: 'Programs Active',      accent: C.leaf   },
    { n: '1000+',label: 'Farming Families',      accent: C.sand   },
    { n: '25+',  label: 'Partner Orgs',          accent: '#b8922a'},
    { n: '2024', label: 'Year Founded',          accent: C.straw  },
  ]

  const metrics = [
    {
      area: 'Environmental', icon: '🌿', accent: C.leaf,
      items: ['Hectares of degraded land restored', 'Soil biodiversity significantly improved', 'Carbon emissions meaningfully reduced'],
    },
    {
      area: 'Economic', icon: '📈', accent: '#b8922a',
      items: ['Farmer household income grown', 'Export revenue channels expanded', 'New international markets accessed'],
    },
    {
      area: 'Social', icon: '🤝', accent: C.sand,
      items: ['Women-led enterprises launched', 'Youth leaders trained island-wide', 'Marginalised communities empowered'],
    },
    {
      area: 'Circular', icon: '♻️', accent: C.straw,
      items: ['Agricultural waste converted to value', 'Sustainable packaging adopted', 'Low-carbon logistics implemented'],
    },
  ]

  return (
    <section id="impact" ref={sectionRef} style={{ position: 'relative', overflow: 'hidden' }}>

      {/* ── Parallax background ── */}
      <motion.div style={{ position: 'absolute', inset: '-20%', y: bgY, zIndex: 0 }}>
        <div style={{
          width: '100%', height: '100%',
          backgroundImage: `url(${IMG.landscape})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.18) saturate(0.6)',
        }} />
      </motion.div>
      {/* Gradient overlays for depth */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, rgba(8,3,1,0.6) 0%, rgba(8,3,1,0.3) 40%, rgba(8,3,1,0.8) 100%)' }} />

      {/* ── Content ── */}
      <div style={{ position: 'relative', zIndex: 2, padding: isMobile ? '64px 0' : '112px 0' }}>
        <Container>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: 72 }}
          >
            <Label text="Monitoring & Evaluation" light />
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(40px, 6vw, 88px)',
              fontWeight: 900, color: C.cream,
              lineHeight: 0.95, textTransform: 'uppercase',
              letterSpacing: '-2px', margin: '0 0 20px',
            }}>
              Our Impact<br />
              <span style={{ color: C.leaf, fontStyle: 'italic' }}>By the Numbers</span>
            </h2>
            <p style={{ color: 'rgba(245,240,232,0.4)', fontSize: 15, maxWidth: 480, margin: '0 auto', lineHeight: 1.8 }}>
              Transparent, measurable regeneration across every dimension we work in.
            </p>
          </motion.div>

          {/* ── BIG STAT COUNTERS ── 
              Each stat is a huge animated number.
              AnimatedCounter counts from 0 → target when it enters viewport.
              The glow colour matches each pillar's accent colour.
          ── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 2, marginBottom: 80 }}>
            {bigStats.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.7 }}
                whileHover={{ background: 'rgba(245,240,232,0.06)' }}
                style={{
                  padding: '40px 24px', textAlign: 'center',
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(12px)',
                  borderBottom: `3px solid ${s.accent}`,
                  transition: 'background 0.3s',
                }}
              >
                {/* Giant number */}
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 'clamp(48px, 5vw, 76px)',
                  fontWeight: 900, lineHeight: 1,
                  color: s.accent,
                  textShadow: `0 0 40px ${s.accent}55`,
                  marginBottom: 10,
                }}>
                  <AnimatedCounter target={s.n} />
                </div>
                <div style={{ color: 'rgba(245,240,232,0.5)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── METRIC CARDS — fly up with stagger ── */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(1, 1fr)' : 'repeat(4, 1fr)', gap: 12, marginBottom: 96 }}>
            {metrics.map((m, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 56 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.13, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{
                  y: -8,
                  boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px ${m.accent}44`,
                  background: 'rgba(245,240,232,0.07)',
                }}
                style={{
                  background: 'rgba(245,240,232,0.04)',
                  backdropFilter: 'blur(16px)',
                  border: `1px solid rgba(245,240,232,0.06)`,
                  borderTop: `3px solid ${m.accent}88`,
                  padding: '32px 24px',
                  transition: 'all 0.4s ease',
                  cursor: 'default',
                }}
              >
                {/* Icon + area name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <span style={{ fontSize: 22 }}>{m.icon}</span>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 16, fontWeight: 800,
                    color: m.accent, textTransform: 'uppercase', letterSpacing: '1px',
                  }}>{m.area}</div>
                </div>

                {/* Items */}
                {m.items.map((item, j) => (
                  <motion.div key={j}
                    initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.13 + j * 0.08 }}
                    style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.accent, flexShrink: 0, marginTop: 5 }} />
                    <div style={{ color: 'rgba(245,240,232,0.6)', fontSize: 13, lineHeight: 1.6 }}>{item}</div>
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </div>

          {/* ── CINEMATIC QUOTE BLOCK ──
              Full width, giant text, script accent.
              The quote itself uses Barlow Condensed italic — 
              big and commanding. The script line below adds soul.
          ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              borderTop: '1px solid rgba(196,168,130,0.12)',
              borderBottom: '1px solid rgba(196,168,130,0.12)',
              padding: '64px 0',
              textAlign: 'center', position: 'relative',
            }}
          >
            {/* Giant decorative quote mark */}
            <div style={{
              fontFamily: 'Georgia, serif', fontSize: 200,
              color: C.leaf, opacity: 0.06, lineHeight: 1,
              position: 'absolute', top: -20, left: '50%',
              transform: 'translateX(-50%)',
              userSelect: 'none', pointerEvents: 'none',
            }}>"</div>

            <motion.p
              initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 }}
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 'clamp(24px, 3.5vw, 48px)',
                fontWeight: 800, color: C.cream,
                lineHeight: 1.2, fontStyle: 'italic',
                maxWidth: 860, margin: '0 auto 24px',
                textTransform: 'uppercase', letterSpacing: '-0.5px',
                position: 'relative', zIndex: 2,
              }}
            >
              Every regenerated acre is a promise kept —<br />
              <span style={{ color: C.leaf }}>to the land, the farmer, and the future.</span>
            </motion.p>

            {/* Script accent */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }}
              style={{ fontFamily: SCRIPT, fontSize: 32, color: C.leaf, opacity: 0.8, marginBottom: 16, transform: 'rotate(-1.5deg)', display: 'inline-block' }}
            >for the earth, always.</motion.div>

            <div style={{ color: 'rgba(245,240,232,0.3)', fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase' }}>
              — Regen Earth Lanka Foundation
            </div>
          </motion.div>

        </Container>
      </div>
    </section>
  )
}


/* ── PARTNERS ───────────────────────────────────────────────
   Cards slide in from alternating angles.
   On hover: card tilts with rotateY (3D flip feel),
   background image fades in behind content.
   The header uses a huge background word "PARTNER" as watermark.
──────────────────────────────────────────────────────────── */
function Partners() {
  const isMobile = useIsMobile()
  const types = [
    { n:'01', title:'Corporate CSR',        desc:'Structured CSR programs aligned with environmental sustainability and rural empowerment goals.', img: IMG.farming,   accent: C.leaf   },
    { n:'02', title:'Export & Trade',       desc:'Partner with climate-resilient, ethically sourced Sri Lankan supply chains for global markets.',  img: IMG.forest,    accent: '#b8922a' },
    { n:'03', title:'Research Institutions',desc:'Collaborate on innovation, climate research, and sustainable agriculture with our field teams.',   img: IMG.community, accent: C.sand   },
    { n:'04', title:'Donors & Agencies',    desc:'Support scalable regeneration and livelihood programs across rural communities island-wide.',      img: IMG.circular,  accent: C.straw  },
  ]
  const partner_logos = [
    { n:'01', name:'Bespice', href:bespiceLogo },
    { n:'02', name:'Liv Nature', href:livNatureLogo },
    { n:'03', name:'Thurulk', href:thurulkLogo },
    { n:'04', name:'ZT', href:ztLogo },
  ]
  const logoSliderRef = useRef()

  const scrollLogos = (direction) => {
    logoSliderRef.current?.scrollBy({ left: direction * logoSliderRef.current.clientWidth, behavior: 'smooth' })
  }
  return (
    <section id="partners" style={{ background: '#0e0906', padding: isMobile ? '64px 0' : '112px 0', overflow: 'hidden', position: 'relative' }}>
      {/* Giant watermark word */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(120px,18vw,260px)', fontWeight: 900, color: 'rgba(196,168,130,0.025)', textTransform: 'uppercase', letterSpacing: '-8px', userSelect: 'none', whiteSpace: 'nowrap', pointerEvents: 'none' }}>PARTNER</div>

      <Container>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 24 : 56, marginBottom: isMobile ? 40 : 72, alignItems: 'end' }}>
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <Label text="Collaborate" light />
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 4vw, 64px)', fontWeight: 900, color: C.cream, lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-1px', margin: 0 }}>
              Partner With<br />
              <span style={{ fontFamily: SCRIPT, color: C.leaf, textTransform: 'none', fontSize: '0.7em', fontWeight: 600, letterSpacing: 0 }}>Regen Earth Lanka</span>
            </h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}>
            <p style={{ color: 'rgba(245,240,232,0.45)', fontSize: 15, lineHeight: 1.9, marginBottom: 28 }}>
              We work with corporations, researchers, trade partners, and development agencies to create systemic, lasting change across Sri Lanka's rural communities.
            </p>
            <motion.a href="#contact"
              onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }}
              whileHover={{ scale: 1.04, boxShadow: `0 12px 36px rgba(74,110,56,0.5)` }}
              whileTap={{ scale: 0.97 }}
              style={{ background: C.sage, color: C.cream, padding: '14px 36px', textDecoration: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', display: 'inline-block', borderRadius: 999 }}
            >Start a Conversation →</motion.a>
          </motion.div>
        </div>

        {/* Cards — each flies in from a different direction */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 12 }}>
          {types.map((t, i) => {
            const dirs = [{ x:-60,y:0 }, { x:0,y:60 }, { x:0,y:-60 }, { x:60,y:0 }]
            return (
              <motion.div key={i}
                initial={{ opacity: 0, ...dirs[i] }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.8, ease: [0.16,1,0.3,1] }}
                whileHover={{ y: -10, rotateX: 2, rotateY: i < 2 ? 3 : -3 }}
                style={{ position: 'relative', overflow: 'hidden', minHeight: 280, cursor: 'default', transformStyle: 'preserve-3d' }}
              >
                {/* Background photo that reveals on hover */}
                <motion.div
                  initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}
                  style={{ position: 'absolute', inset: 0, backgroundImage: `url(${t.img})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.25) saturate(0.5)', transition: 'opacity 0.5s' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.bark} 0%, rgba(44,26,14,0.85) 100%)` }} />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 2, padding: '32px 28px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                      <div style={{ color: t.accent, fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>{t.n}</div>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${t.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.accent, opacity: 0.7 }} />
                      </div>
                    </div>
                    <div style={{ width: 24, height: 2, background: t.accent, marginBottom: 16, opacity: 0.7 }} />
                    <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: C.cream, marginBottom: 12, lineHeight: 1.1, textTransform: 'uppercase' }}>{t.title}</h3>
                    <p style={{ color: 'rgba(245,240,232,0.5)', fontSize: 13, lineHeight: 1.75 }}>{t.desc}</p>
                  </div>
                  <motion.div whileHover={{ x: 4 }} style={{ color: t.accent, fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600, marginTop: 20, transition: 'transform 0.2s' }}>
                    Learn more →
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Partner logo slider */}
        <div style={{ marginTop: isMobile ? 56 : 80 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 20 }}>
            <div>
              <Label text="Our partners" light />
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800, color: C.cream, lineHeight: 1, textTransform: 'uppercase', margin: 0 }}>
                Growing together
              </h3>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => scrollLogos(-1)} aria-label="Previous partner logos"
                style={{ width: 40, height: 40, border: '1px solid rgba(245,240,232,0.2)', background: 'transparent', color: C.cream, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
              >←</button>
              <button type="button" onClick={() => scrollLogos(1)} aria-label="Next partner logos"
                style={{ width: 40, height: 40, border: '1px solid rgba(245,240,232,0.2)', background: 'transparent', color: C.cream, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
              >→</button>
            </div>
          </div>
          <div ref={logoSliderRef} style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', paddingBottom: 4 }}>
            {partner_logos.map(logo => (
              <div key={logo.n} style={{ flex: isMobile ? '0 0 calc((100% - 12px) / 2)' : '0 0 calc((100% - 36px) / 4)', minWidth: isMobile ? 150 : 0, height: isMobile ? 120 : 150, background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', scrollSnapAlign: 'start', padding: isMobile ? 18 : 24 }}>
                <img src={logo.href} alt={`${logo.name} logo`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

/* ── LEADERSHIP ─────────────────────────────────────────────
   Each card has:
   - A large gradient circle avatar that glows on hover
   - Name + role text slides up on hover
   - Card border lights up in leaf green on hover
   - Cards stagger in from bottom
──────────────────────────────────────────────────────────── */
function Leadership() {
  const isMobile = useIsMobile()
  const team = [
    { name:'Anushka Vidanapathirana', role:'President',                          image: anushkaImage,       color: C.leaf   },
    { name:'Lakshmi Jayasinghe',      role:'Secretary General / Exec. Director', image: lakshmiImage,       color: C.sand   },
    { name:'Hasanka Padukka',         role:'Vice President',                     image: hasankaImage,       color: '#b8922a'},
    { name:'Ravees Dananjaya',        role:'Treasurer',                          image: dananjayaImage,     color: C.straw  },
    { name:'L.T Chandrakanthi',       role:'Assistant Secretary',                image: chandrakanthiImage, color: C.sage   },
  ]
  const values = ['Integrity','Transparency','Sustainability','Inclusion','Innovation','Community-First']

  return (
    <section style={{ background: C.soil, padding: isMobile ? '64px 0' : '112px 0', overflow: 'hidden' }}>
      <Container>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '5fr 7fr', gap: isMobile ? 20 : 64, alignItems: 'end', marginBottom: isMobile ? 36 : 72 }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Label text="Governance" light />
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 900, color: C.cream, lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-1px', margin: 0 }}>
              Board &<br />
              <em style={{ fontFamily: SCRIPT, color: C.sand, textTransform: 'none', fontSize: '0.75em', fontWeight: 600, letterSpacing: 0 }}>Executive Team</em>
            </h2>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            style={{ color: 'rgba(245,240,232,0.38)', fontSize: 14, lineHeight: 1.9, margin: 0, paddingBottom: 6 }}
          >
            Our leadership brings together deep expertise in environmental science, sustainable agriculture, rural development, and international trade to guide Sri Lanka's regenerative future.
          </motion.p>
        </div>

        {/* Team cards */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: 10 }}>
          {team.map((m, idx) => (
            <motion.div key={idx}
              initial={{ opacity: 0, y: 48 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: idx * 0.1, duration: 0.7, ease: [0.16,1,0.3,1] }}
              whileHover={{ y: -12, boxShadow: `0 24px 60px rgba(0,0,0,0.4), 0 0 0 1.5px ${m.color}55` }}
              style={{
                background: 'rgba(245,240,232,0.04)',
                border: '1px solid rgba(245,240,232,0.06)',
                padding: '32px 20px 28px',
                textAlign: 'center',
                transition: 'all 0.4s ease',
                cursor: 'default', position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Glow blob behind avatar */}
              <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', width: 80, height: 80, borderRadius: '50%', background: m.color, opacity: 0.08, filter: 'blur(20px)', pointerEvents: 'none' }} />

              {/* Portrait */}
              <motion.div
                whileHover={{ scale: 1.12 }}
                style={{
                  width: '100%', height: 180, borderRadius: 2,
                  background: `linear-gradient(135deg, ${m.color}88, ${m.color}33)`,
                  border: `2px solid ${m.color}55`,
                  display: 'block',
                  margin: '0 auto 18px',
                  boxShadow: `0 0 24px ${m.color}33`,
                  transition: 'transform 0.3s', overflow: 'hidden',
                }}
              >
                <img src={m.image} alt={`${m.name}, ${m.role}`} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
              </motion.div>

              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: C.cream, fontSize: 14, lineHeight: 1.3, marginBottom: 6 }}>{m.name}</div>
              <div style={{ color: m.color, fontSize: 11, letterSpacing: '1px', lineHeight: 1.4, textTransform: 'uppercase', fontWeight: 600 }}>{m.role}</div>
            </motion.div>
          ))}
        </div>

        {/* Values row — pill tags that glow on hover */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
          style={{ marginTop: 56, paddingTop: 40, borderTop: '1px solid rgba(196,168,130,0.08)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}
        >
          <span style={{ color: 'rgba(245,240,232,0.2)', fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', marginRight: 6 }}>Our Values</span>
          {values.map((v, i) => (
            <motion.span key={i}
              whileHover={{ background: `${C.leaf}22`, color: C.leaf, borderColor: `${C.leaf}55`, scale: 1.05 }}
              style={{ border: '1px solid rgba(196,168,130,0.12)', color: 'rgba(245,240,232,0.4)', padding: '6px 18px', fontSize: 11, borderRadius: 999, cursor: 'default', transition: 'all 0.2s', fontWeight: 500 }}
            >{v}</motion.span>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}

/* ── GET INVOLVED ────────────────────────────────────────────
   Full-height cards with photo backgrounds.
   On hover: photo fully reveals, text slides up, CTA appears.
   Uses CSS transition on the overlay opacity for smoothness.
   Bottom of each card has a "Join →" CTA that appears on hover.
──────────────────────────────────────────────────────────── */
function GetInvolved() {
  const isMobile = useIsMobile()
  const [hovered, setHovered] = useState(null)

  const cards = [
    { n:'01', title:'Volunteer',          desc:'Join our on-ground teams and contribute your skills to regeneration projects across Sri Lanka.', img: IMG.community, accent: C.leaf,    cta: 'Get Involved' },
    { n:'02', title:'Community Programs', desc:'Participate in local regenerative agriculture, soil health, and sustainable farming programs.',    img: IMG.farming,   accent: '#b8922a', cta: 'Learn More'   },
    { n:'03', title:'Youth Leadership',   desc:"Young change-makers shaping the future of Sri Lanka's environmental sustainability.",              img: IMG.forest,    accent: C.sand,    cta: 'Apply Now'    },
    { n:'04', title:'Donate',             desc:'Support rural regeneration and help farming families build more resilient, sustainable futures.',   img: IMG.circular,  accent: C.straw,   cta: 'Donate Now',  href: '#donate' },
  ]

  return (
    <section id="get-involved" style={{ background: C.bark, padding: '0' }}>
      {/* Header */}
      <div style={{ padding: '96px 0 72px', background: C.bark }}>
        <Container>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: isMobile ? 16 : 56, alignItems: 'end' }}>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Label text="Take Action" light />
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(40px, 5vw, 72px)', fontWeight: 900, color: C.cream, lineHeight: 0.9, textTransform: 'uppercase', letterSpacing: '-1px', margin: 0 }}>
                Get<br />
                <span style={{ fontFamily: SCRIPT, color: C.leaf, textTransform: 'none', fontSize: '0.65em', fontWeight: 600, letterSpacing: 0 }}>Involved.</span>
              </h2>
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              style={{ color: 'rgba(245,240,232,0.4)', fontSize: 15, lineHeight: 1.9, margin: 0 }}
            >
              There are many ways to contribute to Sri Lanka's regenerative future — from hands-on field volunteering to strategic partnerships and financial support.
            </motion.p>
          </div>
        </Container>
      </div>

      {/* Full-width photo cards — no container, edge to edge */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', width: '100%' }}>
        {cards.map((c, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.7 }}
            onHoverStart={() => setHovered(i)}
            onHoverEnd={() => setHovered(null)}
            style={{ position: 'relative', height: 420, overflow: 'hidden', cursor: 'pointer' }}
          >
            {/* Photo */}
            <motion.div
              animate={{ scale: hovered === i ? 1.08 : 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ position: 'absolute', inset: 0, backgroundImage: `url(${c.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />

            {/* Dark overlay — lighter when hovered */}
            <motion.div
              animate={{ opacity: hovered === i ? 0.5 : 0.75 }}
              transition={{ duration: 0.4 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(8,3,1,0.8)' }}
            />

            {/* Coloured gradient from bottom */}
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${c.accent}33 0%, transparent 60%)` }} />

            {/* Content */}
            <motion.div
              animate={{ y: hovered === i ? -8 : 0 }}
              transition={{ duration: 0.4 }}
              style={{ position: 'relative', zIndex: 2, height: '100%', padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
            >
              <div style={{ color: c.accent, fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>{c.n}</div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: C.cream, marginBottom: 10, lineHeight: 1.1, textTransform: 'uppercase' }}>{c.title}</h3>
              <p style={{ color: 'rgba(245,240,232,0.6)', fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>{c.desc}</p>

              {/* CTA — slides up and glows on hover */}
              <motion.a href={c.href || '#contact'}
                onClick={e => { e.preventDefault(); document.getElementById((c.href || '#contact').slice(1))?.scrollIntoView({ behavior: 'smooth' }) }}
                animate={{ opacity: hovered === i ? 1 : 0.3, y: hovered === i ? 0 : 8 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'inline-block', background: c.accent, color: C.soil, padding: '10px 24px', fontSize: 11, textDecoration: 'none', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', borderRadius: 999, width: 'fit-content' }}
              >{c.cta} →</motion.a>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ── DONATE ─────────────────────────────────────────────────
   Bank transfer details with a quick copy action for the account number.
──────────────────────────────────────────────────────────── */
function Donate() {
  const isMobile = useIsMobile()
  const [copied, setCopied] = useState(false)
  const accountNumber = '0140 14009787 120'

  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const details = [
    { label: 'Account Name', value: 'Regen Earth Lanka Foundation' },
    { label: 'Bank', value: 'Seylan Bank' },
    { label: 'Branch', value: 'Dehiwala' },
  ]

  return (
    <section id="donate" style={{ background: C.cream, padding: '96px 0', position: 'relative', overflow: 'hidden' }}>
      <Container>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 40 : 64, alignItems: 'center' }}>
          <div>
            <Label text="Make an impact" />
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(42px, 5vw, 76px)', fontWeight: 900, color: C.soil, lineHeight: 0.9, textTransform: 'uppercase', marginBottom: 24 }}>
              Donate now.<br />
              <span style={{ fontFamily: SCRIPT, color: C.leaf, textTransform: 'none', fontSize: '0.72em', fontWeight: 600 }}>Grow a future.</span>
            </h2>
            <p style={{ color: 'rgba(44,26,14,0.65)', fontSize: 15, lineHeight: 1.9, maxWidth: 460, margin: 0 }}>
              Your contribution helps us restore ecosystems, strengthen rural livelihoods, and build a more resilient future for Sri Lanka.
            </p>
          </div>

          <div style={{ background: C.soil, padding: '36px 32px', color: C.cream }}>
            <div style={{ color: C.sand, fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: 24 }}>Bank transfer details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {details.map(detail => (
                <div key={detail.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, borderBottom: '1px solid rgba(245,240,232,0.12)', paddingBottom: 14 }}>
                  <span style={{ color: 'rgba(245,240,232,0.45)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.2px' }}>{detail.label}</span>
                  <strong style={{ color: C.cream, fontSize: 14, textAlign: 'right', fontWeight: 500 }}>{detail.value}</strong>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
                <span style={{ color: 'rgba(245,240,232,0.45)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.2px' }}>Account Number</span>
                <button type="button" onClick={copyAccountNumber} aria-label="Copy account number"
                  style={{ border: 'none', background: 'none', color: C.sand, cursor: 'pointer', fontSize: 15, fontWeight: 600, letterSpacing: '1px', padding: 0 }}
                >{copied ? 'Copied' : accountNumber}</button>
              </div>
            </div>
            <div style={{ marginTop: 28, color: 'rgba(245,240,232,0.4)', fontSize: 12, lineHeight: 1.7 }}>
              Please include your name as the transfer reference and contact us if you need a donation acknowledgment.
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

/* ── CONTACT ─────────────────────────────────────────────────
   Two-column layout:
   LEFT: Dark soil bg, big headline, animated contact details
         that slide in one by one
   RIGHT: Frosted glass card with email links + CTA button
   
   New addition: animated "typing" underline on each email
   when hovered. Emails slide right on hover.
──────────────────────────────────────────────────────────── */
function Contact() {
  const isMobile = useIsMobile()
  const contacts = [
    { label:'Contact', value:'071 921 2024', href:'tel:+94719212024' },
    { label:'Email', value:'regenearthlankafoundation@gmail.com', href:'mailto:regenearthlankafoundation@gmail.com' },
    { label:'BR Number', value:'GA 00363513', href:null },
    { label:'Address', value:'No. 327/B/12, Idigahadeniya, Pannipitiya', href:null },
    { label:'WhatsApp', value:'071 921 2024', href:'https://wa.me/94719212024' },
  ]

  return (
    <section id="contact" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Full bleed dark background with subtle texture */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${IMG.landscape})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.08) saturate(0.3)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,3,1,0.85)' }} />

      <div style={{ position: 'relative', zIndex: 2, padding: '112px 0' }}>
        <Container>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 40 : 80 }}>

            {/* LEFT */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
              <Label text="Get in Touch" light />
              <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 4vw, 64px)', fontWeight: 900, color: C.cream, lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-1.5px', marginBottom: 48 }}>
                Let's Build A{' '}<br />
                <span style={{ fontFamily: SCRIPT, color: C.leaf, textTransform: 'none', fontSize: '0.8em', fontWeight: 600, letterSpacing: 0 }}>Greener Future</span> 
                Together.
                {/* Script sign-off */}
              <motion.div
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.7 }}
                style={{ marginTop: 40, fontFamily: SCRIPT, fontSize: 28, color: C.leaf, opacity: 0.6, transform: 'rotate(-2deg)', display: 'inline-block' }}
              >for the earth.</motion.div>
              </h2>



              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {contacts.map((item, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.09 }}
                    style={{ display: 'flex', gap: 60, padding: '16px 0', borderBottom: '1px solid rgba(245,240,232,0.05)' }}
                  >
                    <div style={{ color: 'rgba(196,168,130,0.3)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', width: 75, flexShrink: 0, paddingTop: 3 }}>{item.label}</div>
                    {item.href ? (
                      <motion.a href={item.href}
                        whileHover={{ x: 6, color: C.sand }}
                        style={{ color: 'rgba(245,240,232,0.55)', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                      >{item.value}</motion.a>
                    ) : (
                      <div style={{ color: 'rgba(245,240,232,0.55)', fontSize: 14 }}>{item.value}</div>
                    )}
                  </motion.div>
                ))}
              </div>

              
            </motion.div>

            {/* RIGHT — Glass card */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: 20 }} whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.15 }}
              style={{
                background: 'rgba(245,240,232,0.04)',
                border: '1px solid rgba(245,240,232,0.08)',
                backdropFilter: 'blur(24px)',
                padding: '52px 44px',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Subtle accent glow top-right */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: C.leaf, opacity: 0.06, filter: 'blur(40px)', pointerEvents: 'none' }} />

              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800, color: C.cream, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                Ready to Partner?
              </h3>
              <p style={{ color: 'rgba(245,240,232,0.38)', fontSize: 14, lineHeight: 1.8, marginBottom: 36 }}>
                Whether you are a business, researcher, donor, or community leader — there is a place for you in our regenerative movement.
              </p>

              {/* Email links with hover slide */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28 }}>
                {[
                  { email:'regenearthlankafoundation@gmail.com',    label:'General Enquiries' },
                  { email:'info@regenearthlanka.org',    label:'General Enquiries' }
                ].map((e, i) => (
                  <motion.a key={i} href={`mailto:${e.email}`}
                    whileHover={{ x: 6, background: 'rgba(106,158,74,0.1)', borderColor: `${C.leaf}44` }}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'rgba(245,240,232,0.04)',
                      border: '1px solid rgba(245,240,232,0.07)',
                      padding: '14px 18px', textDecoration: 'none',
                      transition: 'all 0.25s',
                    }}
                  >
                    <div>
                      <div style={{ color: 'rgba(245,240,232,0.35)', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 3 }}>{e.label}</div>
                      <div style={{ color: C.sand, fontSize: 13 }}>{e.email}</div>
                    </div>
                    <span style={{ color: C.leaf, fontSize: 16, opacity: 0.6 }}>→</span>
                  </motion.a>
                ))}
              </div>

              <motion.a href="mailto:regenearthlankafoundation@gmail.com"
                whileHover={{ scale: 1.02, boxShadow: `0 12px 36px rgba(74,110,56,0.5)` }}
                whileTap={{ scale: 0.97 }}
                style={{ display: 'block', textAlign: 'center', background: `linear-gradient(135deg, ${C.sage}, ${C.moss})`, color: C.cream, padding: '16px', textDecoration: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', borderRadius: 999, transition: 'box-shadow 0.3s' }}
              >Send a Message →</motion.a>
            </motion.div>
          </div>
        </Container>
      </div>
    </section>
  )
}

/* ── FOOTER ─────────────────────────────────────────────── */
function Footer() {
  const isMobile = useIsMobile()
  return (
    <footer style={{ background: '#080301', borderTop: '1px solid rgba(196,168,130,0.06)', padding: '36px 0' }}>
      <Container style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexWrap: 'wrap', gap: 18 }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, color: C.cream, marginBottom: 3, letterSpacing: '1px', textTransform: 'uppercase' }}>Regen Earth Lanka Foundation</div>
          <div style={{ color: 'rgba(245,240,232,0.24)', fontSize: 11 }}>Building Regenerative Agriculture. Empowering Rural Communities.</div>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {['Privacy Policy','Terms of Use','Governance','Annual Reports'].map((l,i) => (
            <a key={i} href="#" style={{ color: 'rgba(245,240,232,0.2)', fontSize: 11, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e=>e.target.style.color=C.sand}
              onMouseLeave={e=>e.target.style.color='rgba(245,240,232,0.2)'}
            >{l}</a>
          ))}
        </div>
        <div style={{ color: 'rgba(245,240,232,0.16)', fontSize: 11 }}>© 2024 Regen Earth Lanka Foundation</div>
      </Container>
    </footer>
  )
}

/* ── ROOT ───────────────────────────────────────────────── */
export default function Home() {
  const [loading, setLoading] = useState(true)
  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      <div style={{ fontFamily: "'Inter', sans-serif", width: '100%', overflowX: 'hidden', opacity: loading ? 0 : 1, transition: 'opacity 0.6s' }}>
        <Navbar />
        <Hero />
        <Ticker />
        <Stats />
        <About />
        <Pillars />
        <Impact />
        <Partners />
        <Leadership />
        <GetInvolved />
        <Donate />
        <Contact />
        <Footer />
      </div>
    </>
  )
}

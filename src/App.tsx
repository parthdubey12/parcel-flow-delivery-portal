import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import Lenis from 'lenis'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import { useUiStore } from './store'

const DeliveryHubScene = lazy(() => import('./ThreeScenes').then((module) => ({ default: module.DeliveryHubScene })))
const DeliveryNetworkScene = lazy(() => import('./ThreeScenes').then((module) => ({ default: module.DeliveryNetworkScene })))

const navigation = [
  { label: 'Home', path: '/' },
  { label: 'Send a parcel', path: '/pipeline' },
  { label: 'Track parcel', path: '/#track' },
  { label: 'For business', path: '/cores' },
  { label: 'Help', path: '/results' },
  { label: 'How delivery works', path: '/architecture' },
  { label: 'Computer architecture', path: '/technology' },
]

const journeySteps = [
  { id: '01', title: 'Collected', detail: 'Your parcel is safely in our hands.' },
  { id: '02', title: 'Sorted', detail: 'We find the best way to get it moving.' },
  { id: '03', title: 'On the way', detail: 'It is travelling through the local network.' },
  { id: '04', title: 'Delivered', detail: 'A little something has arrived for you.' },
]

const deliveryHighlights = [
  { title: 'A pickup that fits', desc: 'Start with a doorstep collection, so there is one less errand in your day.' },
  { title: 'A considered route', desc: 'Each parcel is sorted toward a suitable route through the local delivery network.' },
  { title: 'Handled with care', desc: 'A dedicated parcel flow helps keep the handoffs clear from collection to arrival.' },
  { title: 'Know where it is', desc: 'Use the tracking experience to follow the journey as it moves between stops.' },
]

const deliveryOptions = [
  { title: 'Everyday', eyebrow: 'A little more time, a little less to spend', description: 'A considered choice for parcels that do not need to rush. We route it carefully and keep its journey easy to follow.' },
  { title: 'Express', eyebrow: 'When it needs to be there sooner', description: 'A faster-priority journey for the things you would rather not wait to send. Availability depends on the destination.' },
  { title: 'Business', eyebrow: 'For the parcels your business sends', description: 'A simple starting point for regular pickups and multiple parcels, with room to grow as your needs change.' },
]

const businessServices = [
  { label: 'Regular pickups', title: 'Less time at the counter', detail: 'Arrange a collection rhythm that works for the way your team packs and sends.' },
  { label: 'Many parcels', title: 'One clear handoff', detail: 'Bring multiple outgoing parcels together into a calmer, more organised dispatch.' },
  { label: 'Growing teams', title: 'Room to scale', detail: 'A connected network concept designed to extend from one hub to many.' },
]

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SiteShell />
    </BrowserRouter>
  )
}

function SiteShell() {
  const location = useLocation()
  const { loaderVisible, reducedMotion, setReducedMotion, setLoaderVisible } = useUiStore()
  const trackRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncReducedMotion = () => setReducedMotion(mediaQuery.matches)
    syncReducedMotion()

    const listener = () => syncReducedMotion()
    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [setReducedMotion])

  useEffect(() => {
    if (reducedMotion) return undefined

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      lerp: 0.08,
    })
    let rafId = 0
    let active = true

    const raf = (time: number) => {
      if (!active) return
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)
    return () => {
      active = false
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [reducedMotion])

  useEffect(() => {
    if (reducedMotion) {
      return undefined
    }

    const ctx = gsap.context(() => {
      gsap.from('.reveal', {
        opacity: 0,
        y: 28,
        duration: 1.2,
        ease: 'power3.out',
        stagger: 0.08,
      })
    }, trackRef)

    return () => ctx.revert()
  }, [location.pathname, reducedMotion])

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaderVisible(false), 1100)
    return () => window.clearTimeout(timer)
  }, [setLoaderVisible])

  return (
    <div className="site-shell" ref={trackRef}>
      {loaderVisible && (
        <div className="site-loader" aria-live="polite">
          <div className="loader-belt">
            <div className="loader-parcel" />
          </div>
          <span>Preparing your delivery</span>
        </div>
      )}

      <header className="site-header">
        <NavLink to="/" className="brand-wrap" aria-label="Parcel / Flow home">
          <div className="brand-mark" aria-hidden="true">
            <span className="brand-core">↗</span>
          </div>
          <div className="brand-copy">
            <strong>Parcel / Flow</strong>
            <span>Thoughtful delivery, powered by design</span>
          </div>
        </NavLink>

        <nav className="site-nav" aria-label="Primary navigation">
          {navigation.map(({ label, path }) => (
            <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="page-wrap"
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/cores" element={<CoresPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/technology" element={<TechnologyPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <p className="eyebrow">Delivered with intention</p>
            <h3>Good things are on their way.</h3>
          </div>
          <div>
            <p className="eyebrow">Need a hand?</p>
            <p>Visit Help for answers about collections, delivery options, and tracking.</p>
          </div>
          <div>
            <p className="eyebrow">On the move</p>
            <p><NavLink to="/pipeline">Plan a delivery</NavLink> · <NavLink to="/#track">Track a parcel</NavLink> · <NavLink to="/technology">Project technology</NavLink></p>
          </div>
        </div>
        <details className="project-credit">
          <summary>About this delivery concept</summary>
          <p>Parcel / Flow is a B.Tech CSE project by Group 65 at NIET Greater Noida for CCSE0304, Computer Architecture &amp; Parallel Processing, guided by Ms. Pooja Kumari and aligned with UN Sustainable Development Goal 9. Tracking and service interactions on this site are demonstrations, not live bookings or carrier updates.</p>
        </details>
      </footer>
    </div>
  )
}

function HomePage() {
  const [trackingCode, setTrackingCode] = useState('')
  const [trackingResult, setTrackingResult] = useState(false)
  const [selectedParcel, setSelectedParcel] = useState<number | null>(null)
  const reducedMotion = useUiStore((state) => state.reducedMotion)

  const trackParcel = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (trackingCode.trim()) setTrackingResult(true)
  }

  return (
    <main className="home-page">
      <section className="section hero-section reveal" id="track">
        <div className="hero-copy">
          <p className="eyebrow"><span className="live-dot" /> Parcel / Flow delivery portal</p>
          <h1>Delivery made a little simpler.</h1>
          <p className="lede">
            Track a parcel, explore delivery options, or find the right next step. Everything you need is in one place.
          </p>
          <form className="tracking-form" onSubmit={trackParcel}>
            <label htmlFor="tracking-code">Track your parcel</label>
            <div className="tracking-input-row">
              <input
                id="tracking-code"
                value={trackingCode}
                onChange={(event) => {
                  setTrackingCode(event.target.value)
                  setTrackingResult(false)
                }}
                placeholder="e.g. PF-2048-65"
                required
                aria-describedby="tracking-help"
              />
              <button className="primary-button" type="submit">Track parcel <span aria-hidden="true">↗</span></button>
            </div>
            {trackingResult && (
              <p className="tracking-result" role="status">
                <span className="live-dot" /> Sample update for {trackingCode.trim().toUpperCase()}: sorted at your local delivery hub. Live tracking is not connected.
              </p>
            )}
            <span className="tracking-help" id="tracking-help">Try a sample reference. This demo is not connected to a carrier.</span>
          </form>
        </div>

        <div className="hero-visual delivery-visual" aria-label="Interactive three-dimensional parcel travelling through a delivery hub">
          <div className="visual-caption"><span>ON ITS WAY</span><span>01 / 04</span></div>
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          {reducedMotion ? (
            <div className="parcel-fallback" aria-hidden="true"><span>PF</span></div>
          ) : (
            <DeferredScene className="delivery-canvas" placeholder={<div className="parcel-fallback" aria-hidden="true"><span>PF</span></div>}>
              <DeliveryHubScene onParcelSelect={setSelectedParcel} />
            </DeferredScene>
          )}
          <div className="visual-note" aria-live="polite">
            <span className="live-dot" />
            {selectedParcel === null ? 'DRAG TO EXPLORE · TAP A PARCEL' : `SAMPLE PARCEL PF-${2048 + selectedParcel} SELECTED`}
          </div>
        </div>
      </section>

      <section className="section portal-actions reveal" aria-labelledby="portal-actions-heading">
        <div className="section-heading">
          <p className="eyebrow">Your delivery, in one place</p>
          <h2 id="portal-actions-heading">What would you like to do?</h2>
        </div>
        <div className="portal-action-grid">
          <NavLink to="/#track" className="portal-action-card">
            <span className="portal-action-icon" aria-hidden="true">⌕</span>
            <span className="portal-action-copy"><strong>Track a parcel</strong><small>See the latest journey status</small></span>
            <span className="portal-action-arrow" aria-hidden="true">↗</span>
          </NavLink>
          <NavLink to="/pipeline" className="portal-action-card">
            <span className="portal-action-icon" aria-hidden="true">＋</span>
            <span className="portal-action-copy"><strong>Plan a delivery</strong><small>Enter parcel details and preferences</small></span>
            <span className="portal-action-arrow" aria-hidden="true">↗</span>
          </NavLink>
          <NavLink to="/cores" className="portal-action-card">
            <span className="portal-action-icon" aria-hidden="true">▤</span>
            <span className="portal-action-copy"><strong>Business sending</strong><small>Explore options for sending teams</small></span>
            <span className="portal-action-arrow" aria-hidden="true">↗</span>
          </NavLink>
          <NavLink to="/results" className="portal-action-card">
            <span className="portal-action-icon" aria-hidden="true">?</span>
            <span className="portal-action-copy"><strong>Help &amp; support</strong><small>Find answers to common questions</small></span>
            <span className="portal-action-arrow" aria-hidden="true">↗</span>
          </NavLink>
        </div>
      </section>

      <section className="section home-services reveal" aria-labelledby="home-services-heading">
        <div className="section-heading">
          <p className="eyebrow">Choose what fits</p>
          <h2 id="home-services-heading">Delivery options for different days.</h2>
        </div>
        <div className="home-service-grid">
          {deliveryOptions.map((option, index) => (
            <article key={option.title} className="home-service-card">
              <span className="detail-index">0{index + 1} / {option.title}</span>
              <h3>{option.title}</h3>
              <p>{option.description}</p>
              <NavLink to="/pipeline" className="text-link">Explore this option <span aria-hidden="true">→</span></NavLink>
            </article>
          ))}
        </div>
        <p className="home-demo-note">Parcel / Flow is a service concept. Rates, coverage, bookings, and live carrier tracking are not connected.</p>
      </section>

      <section className="section flow-section home-journey reveal">
        <div className="section-heading narrow">
          <p className="eyebrow">The parcel journey</p>
          <h2>Know what happens along the way.</h2>
        </div>

        <div className="flow-track">
          {journeySteps.map(({ id, title, detail }) => (
            <div key={id} className="flow-step">
              <div className="step-rail" />
              <div className="step-node">{id}</div>
              <div className="step-copy">
                <strong>{title}</strong>
                <span>{detail}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section home-help reveal" aria-labelledby="home-help-heading">
        <div>
          <p className="eyebrow">Need a hand?</p>
          <h2 id="home-help-heading">We can help you find your way.</h2>
          <p>Browse answers about tracking, pickup planning, and delivery options.</p>
        </div>
        <NavLink to="/results" className="secondary-button">Visit help &amp; support <span aria-hidden="true">↗</span></NavLink>
      </section>
    </main>
  )
}

function ArchitecturePage() {
  const reducedMotion = useUiStore((state) => state.reducedMotion)
  const [selectedHub, setSelectedHub] = useState<number | null>(null)

  return (
    <section className="section page-section reveal">
      <div className="section-heading">
        <p className="eyebrow">How we deliver</p>
        <h2>A connected local network, built around your parcel’s journey.</h2>
      </div>

      <div className="architecture-layout">
        <div className="die-scene network-scene" aria-label="Interactive three-dimensional delivery network">
          {reducedMotion ? (
            <div className="network-fallback" aria-hidden="true">
              <span className="fallback-depot">Parcel hub</span>
              {['North', 'East', 'South', 'West'].map((hub) => <span key={hub} className="fallback-hub">{hub} hub</span>)}
            </div>
          ) : (
            <DeferredScene
              className="die-canvas network-canvas"
              placeholder={
                <div className="network-fallback" aria-hidden="true">
                  <span className="fallback-depot">Parcel hub</span>
                  {['North', 'East', 'South', 'West'].map((hub) => <span key={hub} className="fallback-hub">{hub} hub</span>)}
                </div>
              }
            >
              <DeliveryNetworkScene onHubSelect={setSelectedHub} />
            </DeferredScene>
          )}
          <div className="die-overlay-label">
            {selectedHub === null ? 'DRAG TO EXPLORE · SELECT A LOCAL HUB' : `${['NORTH', 'EAST', 'SOUTH', 'WEST'][selectedHub]} HUB · ROUTE SELECTED`}
          </div>
        </div>

        <aside className="info-panel">
          <p className="eyebrow">A parcel’s path</p>
          <h3>{selectedHub === null ? 'A little closer at every handoff' : `${['North', 'East', 'South', 'West'][selectedHub]} local hub`}</h3>
          <p>
            {selectedHub === null
              ? 'Your parcel is collected, sorted at a local hub, and sent along its next route. Select a hub in the illustration to see how the network connects.'
              : `This stop helps parcels move between local collection and their next delivery leg. Select another hub to explore the connected route.`}
          </p>
          <div className="mini-list">
            <span>Collection</span>
            <span>Sorting</span>
            <span>Delivery</span>
          </div>
        </aside>
      </div>

      <div className="architecture-grid">
        {deliveryHighlights.map((block) => (
          <article key={block.title} className="detail-card">
            <span className="detail-index">PARCEL / FLOW</span>
            <h3>{block.title}</h3>
            <p>{block.desc}</p>
          </article>
        ))}
      </div>
      <div className="service-page-cta">
        <p>Ready to see where your parcel is?</p>
        <NavLink to="/#track" className="primary-button">Track a parcel <span aria-hidden="true">↗</span></NavLink>
      </div>
    </section>
  )
}

interface DeferredSceneProps {
  children: ReactNode
  className: string
  placeholder: ReactNode
}

function DeferredScene({ children, className, placeholder }: DeferredSceneProps) {
  const sceneRef = useRef<HTMLDivElement | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = sceneRef.current
    if (!element) return undefined

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting)
    }, { rootMargin: '120px', threshold: 0.05 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={sceneRef} className={className}>
      {inView ? <Suspense fallback={placeholder}>{children}</Suspense> : placeholder}
    </div>
  )
}

function PipelinePage() {
  const [originPostcode, setOriginPostcode] = useState('')
  const [destinationPostcode, setDestinationPostcode] = useState('')
  const [parcelSize, setParcelSize] = useState('Small parcel')
  const [service, setService] = useState<'Everyday' | 'Express'>('Everyday')
  const [handoff, setHandoff] = useState<'Home collection' | 'Drop-off'>('Home collection')
  const [planReady, setPlanReady] = useState(false)

  const createPlanPreview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPlanReady(true)
  }

  return (
    <section className="section page-section shipment-page reveal">
      <div className="section-heading">
        <p className="eyebrow">Send a parcel</p>
        <h2>Plan your delivery, one step at a time.</h2>
        <p className="section-intro">Tell us where it is going and what you are sending. We will organise your choices into a clear preview.</p>
      </div>

      <div className="shipment-layout">
        <form className="shipment-form" onSubmit={createPlanPreview} onChange={() => setPlanReady(false)}>
          <fieldset className="shipment-fieldset">
            <legend><span>1</span> Where is it going?</legend>
            <div className="shipment-input-grid">
              <label className="shipment-field">
                <span>Collection postcode</span>
                <input
                  type="text"
                  name="origin-postcode"
                  autoComplete="postal-code"
                  placeholder="e.g. 201301"
                  value={originPostcode}
                  onChange={(event) => setOriginPostcode(event.target.value)}
                  required
                />
              </label>
              <label className="shipment-field">
                <span>Delivery postcode</span>
                <input
                  type="text"
                  name="destination-postcode"
                  autoComplete="postal-code"
                  placeholder="e.g. 110001"
                  value={destinationPostcode}
                  onChange={(event) => setDestinationPostcode(event.target.value)}
                  required
                />
              </label>
            </div>
            <p className="field-help">Postcodes only for this preview. Full addresses are not requested.</p>
          </fieldset>

          <fieldset className="shipment-fieldset">
            <legend><span>2</span> What are you sending?</legend>
            <label className="shipment-field shipment-size-field">
              <span>Parcel size</span>
              <select value={parcelSize} onChange={(event) => setParcelSize(event.target.value)}>
                <option>Small parcel</option>
                <option>Medium parcel</option>
                <option>Large parcel</option>
                <option>Document envelope</option>
              </select>
            </label>
            <div className="parcel-size-guide">
              <span><strong>Document</strong> Papers and flat mailers</span>
              <span><strong>Small</strong> Books, accessories, and gifts</span>
              <span><strong>Medium / large</strong> Boxed items with room to protect</span>
            </div>
          </fieldset>

          <fieldset className="shipment-fieldset">
            <legend><span>3</span> Choose a delivery speed</legend>
            <div className="shipment-choice-grid">
              {deliveryOptions.slice(0, 2).map((option, index) => (
                <label key={option.title} className={`shipment-choice ${service === option.title ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="delivery-service"
                    value={option.title}
                    checked={service === option.title}
                    onChange={() => setService(index === 0 ? 'Everyday' : 'Express')}
                  />
                  <span className="choice-radio" aria-hidden="true" />
                  <span className="choice-copy"><strong>{option.title}</strong><small>{option.eyebrow}</small></span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="shipment-fieldset">
            <legend><span>4</span> How will you hand it over?</legend>
            <div className="handoff-choice-grid">
              {(['Home collection', 'Drop-off'] as const).map((choice) => (
                <label key={choice} className={`handoff-choice ${handoff === choice ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="handoff"
                    value={choice}
                    checked={handoff === choice}
                    onChange={() => setHandoff(choice)}
                  />
                  <strong>{choice}</strong>
                  <small>{choice === 'Home collection' ? 'A courier collects from your address' : 'You take it to a nearby parcel point'}</small>
                </label>
              ))}
            </div>
          </fieldset>

          <button className="primary-button shipment-submit" type="submit">
            Create plan preview <span aria-hidden="true">→</span>
          </button>
          <p className="shipment-disclaimer">Preview only: no booking, price, or pickup is created.</p>
        </form>

        <aside className="shipment-aside">
          <div className="shipment-summary" aria-live="polite">
            <p className="eyebrow">{planReady ? 'Your plan preview' : 'Your plan at a glance'}</p>
            <h3>{planReady ? 'Your delivery details are ready.' : 'A clearer way to get started.'}</h3>
            {planReady ? (
              <dl className="summary-list">
                <div><dt>From</dt><dd>{originPostcode.trim().toUpperCase()}</dd></div>
                <div><dt>To</dt><dd>{destinationPostcode.trim().toUpperCase()}</dd></div>
                <div><dt>Parcel</dt><dd>{parcelSize}</dd></div>
                <div><dt>Service</dt><dd>{service}</dd></div>
                <div><dt>Handoff</dt><dd>{handoff}</dd></div>
              </dl>
            ) : (
              <p>Fill in the four short steps. You can review your choices before a real courier service would ask for full addresses and payment.</p>
            )}
            <div className="summary-next-step">
              <span className="next-step-icon" aria-hidden="true">i</span>
              <p>{planReady
                ? 'This preview stays on this page. It does not submit your details or arrange a delivery.'
                : 'Have your collection and delivery postcodes ready. You do not need to enter a full address here.'}</p>
            </div>
          </div>

          <div className="shipment-checklist">
            <h3>Before you send</h3>
            <ul>
              <li>Pack items securely in a sturdy box or mailer.</li>
              <li>Check that the contents can be sent by your chosen courier.</li>
              <li>Keep a tracking reference once a real booking is confirmed.</li>
            </ul>
            <NavLink to="/results" className="text-link">Read delivery help <span aria-hidden="true">→</span></NavLink>
          </div>
        </aside>
      </div>
      <div className="service-page-cta">
        <p>Already have a parcel on the move?</p>
        <NavLink to="/#track" className="primary-button">Track a parcel <span aria-hidden="true">↗</span></NavLink>
      </div>
    </section>
  )
}

function CoresPage() {
  return (
    <section className="section page-section reveal">
      <div className="section-heading">
        <p className="eyebrow">For business</p>
        <h2>More parcels to send? We make the handoff feel simple.</h2>
      </div>

      <div className="core-grid">
        {businessServices.map((service, index) => (
          <article key={service.label} className="core-card business-card">
            <span className="core-pill">{service.label}</span>
            <div>
              <h3>{service.title}</h3>
              <p>{service.detail}</p>
            </div>
            <span className="business-index">0{index + 1}</span>
          </article>
        ))}
      </div>

      <div className="coherence-panel">
        <div>
          <p className="eyebrow">A good fit for growing teams</p>
          <h3>Let’s get your parcels moving.</h3>
        </div>
        <NavLink to="/#track" className="primary-button small">Try parcel tracking</NavLink>
      </div>

      <div className="bus-message" aria-live="polite">
        <span>Parcel / Flow</span>
        <strong>Business pickup and account tools are part of the delivery-service concept.</strong>
      </div>
    </section>
  )
}

function ResultsPage() {
  return (
    <section className="section page-section reveal">
      <div className="section-heading">
        <p className="eyebrow">A few helpful answers</p>
        <h2>Here for the little details.</h2>
      </div>

      <div className="faq-list">
        <details className="faq-item">
          <summary>How can I track a parcel?</summary>
          <p>Enter a tracking reference in the form on the home page. This prototype shows a sample status and is not connected to a live carrier.</p>
        </details>
        <details className="faq-item">
          <summary>Can I book a pickup from this website?</summary>
          <p>Not yet. Pickup and delivery options are presented as a service concept; there is no live booking or payment system behind the site.</p>
        </details>
        <details className="faq-item">
          <summary>Which delivery option should I choose?</summary>
          <p>Choose Everyday for a non-urgent parcel, Express when time matters, or Business if you send parcels regularly. Real availability and rates would depend on the route.</p>
        </details>
        <details className="faq-item">
          <summary>Is this a real courier service?</summary>
          <p>Parcel / Flow is a student-built delivery experience concept, not an operating courier. The interactive tracker and network illustrate how a delivery service could work.</p>
        </details>
      </div>
      <div className="service-page-cta">
        <p>Ready to follow a sample journey?</p>
        <NavLink to="/#track" className="primary-button">Track a sample parcel <span aria-hidden="true">↗</span></NavLink>
      </div>
    </section>
  )
}

type CacheState = 'Modified' | 'Exclusive' | 'Shared' | 'Invalid'

interface CoreCache {
  name: string
  state: CacheState
}

const startingCacheStates: CoreCache[] = [
  { name: 'Core 0', state: 'Shared' },
  { name: 'Core 1', state: 'Shared' },
  { name: 'Core 2', state: 'Shared' },
  { name: 'Core 3', state: 'Invalid' },
]

function TechnologyPage() {
  const [cacheStates, setCacheStates] = useState(startingCacheStates)
  const [writeComplete, setWriteComplete] = useState(false)

  const simulateCoreWrite = () => {
    setCacheStates((current) =>
      current.map((cache, index) => ({
        ...cache,
        state: index === 2 ? 'Modified' : 'Invalid',
      })),
    )
    setWriteComplete(true)
  }

  const resetCoherence = () => {
    setCacheStates(startingCacheStates)
    setWriteComplete(false)
  }

  return (
    <section className="section page-section technology-page reveal">
      <div className="section-heading technology-heading">
        <p className="eyebrow">Behind the delivery</p>
        <h2>Computer architecture and parallel processing, explained.</h2>
        <p className="technology-intro">
          This page explains the processor concepts used in the Parcel / Flow delivery-hub simulation: several cores work on separate tasks, a pipeline overlaps instruction steps, and cache coherence keeps shared data consistent.
        </p>
      </div>

      <section className="technology-section" aria-labelledby="cores-heading">
        <div className="technology-section-heading">
          <p className="eyebrow">01 / Parallel processing</p>
          <h3 id="cores-heading">Four specialised cores share the workload.</h3>
          <p>A traditional single-core design completes parcel jobs one at a time. This MIMD design gives four cores separate work to process in parallel, while a parcel moves through the service flow.</p>
        </div>
        <div className="processor-overview">
          <div className="processor-topline"><span>SMART DELIVERY PROCESSOR</span><span>4-CORE MIMD</span></div>
          <div className="processor-core-grid">
            {[
              ['CORE 0', 'Order intake', 'Capture parcel details'],
              ['CORE 1', 'Route planning', 'Choose the next route'],
              ['CORE 2', 'Billing', 'Process delivery charges'],
              ['CORE 3', 'Dispatch', 'Prepare the outgoing parcel'],
            ].map(([label, title, description]) => (
              <article key={label} className="processor-core-card">
                <span>{label}</span>
                <strong>{title}</strong>
                <small>{description}</small>
              </article>
            ))}
          </div>
          <p className="processor-shared-memory">Shared address space · private L1 caches · shared L2 cache · main memory</p>
        </div>
      </section>

      <section className="technology-section" aria-labelledby="pipeline-heading">
        <div className="technology-section-heading">
          <p className="eyebrow">02 / Instruction pipeline</p>
          <h3 id="pipeline-heading">Five stages overlap work instead of waiting for a full instruction to finish.</h3>
          <p>As one instruction is decoded, another can be fetched and a third can execute. Forwarding helps supply results to dependent instructions without waiting for a full register write-back.</p>
        </div>
        <div className="technical-stage-grid">
          {[
            ['IF', 'Fetch', 'Read the next instruction.'],
            ['ID', 'Decode', 'Interpret the operation and operands.'],
            ['EX', 'Execute', 'Perform ALU or address work.'],
            ['MEM', 'Memory', 'Read or write data and caches.'],
            ['WB', 'Write-back', 'Commit the result to a register.'],
          ].map(([short, title, description], index) => (
            <article key={short} className="technical-stage">
              <span className="technical-stage-index">0{index + 1} / {short}</span>
              <h4>{title}</h4>
              <p>{description}</p>
            </article>
          ))}
        </div>
        <p className="technical-caption">Split instruction/data caches keep instruction fetch traffic separate from data access traffic.</p>
      </section>

      <section className="technology-section" aria-labelledby="memory-heading">
        <div className="technology-section-heading">
          <p className="eyebrow">03 / Memory &amp; coherence</p>
          <h3 id="memory-heading">Fast private caches, one consistent view of shared data.</h3>
          <p>Each core has private registers and an L1 cache. A shared L2 cache sits between those local caches and main memory. MESI tracks each cache line as Modified, Exclusive, Shared, or Invalid.</p>
        </div>
        <div className="memory-coherence-layout">
          <div className="memory-hierarchy">
            {[
              ['01', 'Registers', 'R0–R7 · private to each core'],
              ['02', 'Private L1', 'Fast local instruction/data access'],
              ['03', 'Shared L2', 'Shared cache for all four cores'],
              ['04', 'Main memory', 'Shared address space'],
            ].map(([number, title, description]) => (
              <div key={number} className="memory-level">
                <span>{number}</span>
                <strong>{title}</strong>
                <small>{description}</small>
              </div>
            ))}
          </div>
          <div className="mesi-panel">
            <div className="mesi-heading">
              <div>
                <p className="eyebrow">Try the coherence step</p>
                <h4>Core 2 writes to a shared cache line</h4>
              </div>
              <div className="mesi-actions">
                <button className="primary-button small" type="button" onClick={simulateCoreWrite}>Core 2 writes</button>
                {writeComplete && <button className="text-button" type="button" onClick={resetCoherence}>Reset</button>}
              </div>
            </div>
            <div className="mesi-core-grid" aria-live="polite">
              {cacheStates.map((cache) => (
                <div key={cache.name} className="mesi-core">
                  <span>{cache.name}</span>
                  <strong className={`mesi-state state-${cache.state.toLowerCase()}`}>{cache.state}</strong>
                </div>
              ))}
            </div>
            <p className="mesi-message" role="status">
              {writeComplete
                ? 'Bus invalidation: other cached copies become Invalid; Core 2 owns the Modified line.'
                : 'Before the write, the cache line is Shared by Core 0, Core 1, and Core 2.'}
            </p>
          </div>
        </div>
      </section>

      <section className="technology-section" aria-labelledby="fabric-heading">
        <div className="technology-section-heading">
          <p className="eyebrow">04 / Datapath &amp; control</p>
          <h3 id="fabric-heading">The supporting architecture keeps the parcel line moving.</h3>
        </div>
        <div className="technology-detail-grid">
          <article className="detail-card">
            <span className="detail-index">BUS FABRIC</span>
            <h4>Three independent bus lanes</h4>
            <p>Address, Data, and Control buses use split transactions. An address request can be issued while another transaction transfers data; daisy-chain arbitration coordinates access to the shared bus.</p>
          </article>
          <article className="detail-card">
            <span className="detail-index">REGISTERS &amp; HOLD STACK</span>
            <h4>Keep exceptions out of the main queue</h4>
            <p>Eight indexed registers, R0–R7, hold working values. A PUSH/POP hold stack isolates parcels with unreadable barcodes so they can be reviewed without stopping the rest of the line.</p>
          </article>
          <article className="detail-card">
            <span className="detail-index">ALU</span>
            <h4>Arithmetic and logic in hardware</h4>
            <p>The arithmetic logic unit includes Booth multiplication, a 4×4 array multiplier, an IEEE 754 floating-point unit, logic operations, and restoring division.</p>
          </article>
          <article className="detail-card">
            <span className="detail-index">CONTROL UNIT</span>
            <h4>Decode, sequence, and execute</h4>
            <p>A microprogrammed controller handles 32-bit RISC instruction formats and sequences the Fetch, Decode, Indirect, and Execute phases.</p>
          </article>
        </div>
      </section>

      <section className="technology-section results-technology" aria-labelledby="simulation-heading">
        <div className="technology-section-heading">
          <p className="eyebrow">05 / Simulation results</p>
          <h3 id="simulation-heading">A cycle-level browser simulation of 2,000 parcels.</h3>
          <p>These are modelled processor cycle counts, not measured courier times or hardware benchmarks.</p>
        </div>
        <div className="simulation-results">
          {[
            ['Single core', '98,420 cycles', 'Reference run'],
            ['5-stage pipeline', '~34,000 cycles', 'About 2.9× fewer cycles'],
            ['4 cores + MESI', '10,260 cycles', 'About 9.6× overall speedup'],
            ['Atomic vs split bus', '13,720 → 10,260 cycles', 'Split transactions overlap bus work'],
          ].map(([label, value, note]) => (
            <article key={label} className="simulation-result">
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{note}</small>
            </article>
          ))}
        </div>
        <p className="technical-caption">The model also reports a 96.1% combined cache hit rate and 32% fewer coherence messages with the selected configuration. Results describe this simulator and workload only.</p>
      </section>

      <div className="technology-credit">
        <p>Group 65 · B.Tech Computer Science &amp; Engineering · NIET Greater Noida</p>
        <p>Computer Architecture &amp; Parallel Processing · CCSE0304 · Guided by Ms. Pooja Kumari · Aligned with UN SDG 9</p>
      </div>
    </section>
  )
}

export default App

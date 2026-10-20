// Bayana landing page behaviour. No libraries: IntersectionObserver and class toggles; CSS does the moving.
;(function () {
  const root = document.documentElement
  const noMotion = root.classList.contains('no-motion')
  const $ = (s, el = document) => el.querySelector(s)
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s))
  const io = (cb, opts) => new IntersectionObserver((entries, obs) => entries.forEach((e) => cb(e, obs)), opts)

  /* In-page links: below-the-fold sheets skip rendering until needed (content-visibility),
     so render everything first, then scroll, or the jump lands short. */
  const go = (target, smooth) => {
    root.classList.add('cv-off')
    requestAnimationFrame(() => requestAnimationFrame(() => target.scrollIntoView({ behavior: smooth && !noMotion ? 'smooth' : 'auto' })))
  }
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('a[href^="#"]')
    if (!a || a.getAttribute('href') === '#') return
    const target = document.getElementById(a.getAttribute('href').slice(1))
    if (!target) return
    ev.preventDefault()
    go(target, true)
    if (a.hash !== location.hash) history.pushState(null, '', a.hash)
  })
  if (location.hash) {
    const target = document.getElementById(location.hash.slice(1))
    if (target) go(target, false)
  }

  /* Nav: drafting film over the hero, paper once the page moves on */
  const nav = $('[data-nav]')
  const hero = $('.hero')
  io((e) => nav.classList.toggle('scrolled', !e.isIntersecting), { rootMargin: '-60px 0px 0px 0px', threshold: 0 }).observe(
    (() => { const s = document.createElement('div'); s.style.cssText = 'position:absolute;left:0;width:1px;height:1px;top:' + Math.max(1, hero.offsetHeight - 70) + 'px'; hero.append(s); return s })(),
  )

  /* Hero: plays once on load */
  requestAnimationFrame(() => {
    $('.hero-copy')?.classList.add('go')
    $('[data-hero]')?.classList.add('go')
    $$('.hero [data-rule]').forEach((el) => el.classList.add('in'))
  })

  /* Everything else: headings are drawn, rules extend, drawings plot, cards settle, each once */
  const once = (cls, opts) =>
    io((e, obs) => {
      if (!e.isIntersecting) return
      const el = e.target
      if (el.hasAttribute('data-reveal')) {
        const group = $$(':scope > [data-reveal]', el.parentElement)
        el.style.setProperty('--d', Math.min(Math.max(0, group.indexOf(el)), 3) * 90 + 'ms')
      }
      el.classList.add(cls)
      obs.unobserve(el)
    }, opts)
  const seen = once('in', { rootMargin: '0px 0px -10% 0px', threshold: 0.1 })
  $$('[data-reveal], [data-rule]').forEach((el) => { if (!el.closest('.hero')) seen.observe(el) })
  // A heading being drawn in is clipped to nothing, and some browsers then never report it as visible,
  // so watch an invisible stand-in placed exactly where the heading sits.
  const wipe = io((e, obs) => { if (e.isIntersecting) { e.target._for.classList.add('in'); obs.unobserve(e.target); e.target.remove() } }, { rootMargin: '0px 0px -10% 0px' })
  $$('[data-wipe]').forEach((el) => {
    const s = document.createElement('i')
    s.setAttribute('aria-hidden', 'true')
    s.style.cssText = 'position:absolute;width:1px;height:1px;pointer-events:none'
    s._for = el
    el.before(s)
    wipe.observe(s)
  })
  const drawn = once('drawn', { rootMargin: '0px 0px -12% 0px', threshold: 0.2 })
  $$('[data-draw]').forEach((el) => drawn.observe(el))
  // Stage index drives the tower stagger (stage 1 rises first)
  $$('.stage').forEach((s, i) => s.style.setProperty('--s', i))

  /* Leak calculator */
  const calc = $('[data-calc]')
  if (calc) {
    const inr = new Intl.NumberFormat('en-IN')
    const big = $('[data-out="lost"]', calc)
    const short = (n) => (n >= 1e7 ? '₹' + (n / 1e7).toFixed(1).replace(/\.0$/, '') + ' crore' : n >= 1e5 ? '₹' + (n / 1e5).toFixed(1).replace(/\.0$/, '') + ' lakh' : '₹' + inr.format(n))
    const cta = $('[data-calc-cta]', calc)
    const update = () => {
      const v = Object.fromEntries($$('input', calc).map((i) => [i.name, +i.value]))
      $$('input', calc).forEach((i) => i.style.setProperty('--p', ((i.value - i.min) / (i.max - i.min)) * 100 + '%'))
      $('[data-out="leads"]', calc).textContent = inr.format(v.leads)
      $('[data-out="cpl"]', calc).textContent = '₹' + inr.format(v.cpl)
      $('[data-out="slow"]', calc).textContent = v.slow + '%'
      const lost = Math.round((v.leads * v.cpl * v.slow) / 100)
      big.textContent = '₹' + inr.format(lost)
      $('[data-out="year"]', calc).textContent = short(lost * 12)
      // The WhatsApp button carries their own numbers, so the first message already says why they're writing.
      if (cta) {
        const u = new URL(cta.href)
        u.searchParams.set('text', `Hi! I worked it out on your site: we buy about ${inr.format(v.leads)} leads a month and roughly ₹${inr.format(lost)} a month goes cold from slow replies. Can you show me how Bayana fixes this?`)
        cta.href = u.toString()
      }
    }
    calc.addEventListener('input', update)
    update()
  }

  /* Product clips: load shortly before they scroll in, play only while visible */
  const saveData = navigator.connection && navigator.connection.saveData
  const clips = $$('video[data-src]')
  const load = (v) => {
    if (v.dataset.loaded) return
    v.dataset.loaded = '1'
    const base = v.dataset.src
    v.insertAdjacentHTML('beforeend', `<source src="${base}.webm" type="video/webm"><source src="${base}.mp4" type="video/mp4">`)
    v.load()
  }
  if (noMotion || saveData) {
    clips.forEach((v) => { v.controls = true; load(v) })
  } else {
    const near = io((e, obs) => { if (e.isIntersecting) { load(e.target); obs.unobserve(e.target) } }, { rootMargin: '400px 0px' })
    const vis = io((e) => {
      const v = e.target
      if (e.isIntersecting) { load(v); const p = v.play(); if (p) p.catch(() => {}) } else v.pause()
    }, { threshold: 0.35 })
    clips.forEach((v) => { near.observe(v); vis.observe(v) })
  }

  /* Monthly / yearly prices */
  const billing = $('[data-billing]')
  if (billing) {
    billing.addEventListener('click', (ev) => {
      const b = ev.target.closest('button')
      if (!b) return
      const p = b.dataset.period
      $$('button', billing).forEach((x) => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on) })
      $$('[data-m]').forEach((el) => (el.textContent = el.dataset[p]))
    })
  }

  /* Phone WhatsApp dock: after the hero, hidden again at the final call to action */
  const dock = $('[data-dock]')
  const final = $('.final')
  if (dock && hero && final) {
    let pastHero = false, atEnd = false
    const sync = () => dock.classList.toggle('show', pastHero && !atEnd)
    io((e) => { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; sync() }).observe(hero)
    io((e) => { atEnd = e.isIntersecting; sync() }).observe(final)
  }

  /* ?fps shows a frame meter (for testing on real phones) */
  if (/[?&]fps\b/.test(location.search)) {
    const m = document.createElement('div'); m.className = 'fps'; document.body.append(m)
    let n = 0, last = performance.now(), worst = 0, prev = last
    const loop = (t) => { n++; worst = Math.max(worst, t - prev); prev = t; if (t - last > 1000) { m.textContent = `${n} fps · worst ${worst.toFixed(0)} ms`; n = 0; worst = 0; last = t } requestAnimationFrame(loop) }
    requestAnimationFrame(loop)
  }
})()

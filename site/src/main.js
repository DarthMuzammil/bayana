// Bayana landing page behaviour. No libraries; everything is IntersectionObserver + class toggles.
;(function () {
  const root = document.documentElement
  const still = root.classList.contains('still')
  const $ = (s, el = document) => el.querySelector(s)
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s))
  const io = (cb, opts) => new IntersectionObserver((entries, obs) => entries.forEach((e) => cb(e, obs)), opts)

  /* In-page links: sections below the fold skip rendering until needed (content-visibility),
     so render everything first, then scroll, or the jump lands short. */
  const go = (target, smooth) => {
    root.classList.add('cv-off')
    requestAnimationFrame(() => requestAnimationFrame(() => target.scrollIntoView({ behavior: smooth && !still ? 'smooth' : 'auto' })))
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

  /* Nav background once the page scrolls */
  const nav = $('[data-nav]')
  const sentinel = document.createElement('div')
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:8px'
  document.body.prepend(sentinel)
  io((e) => nav.classList.toggle('scrolled', !e.isIntersecting)).observe(sentinel)

  /* Reveal on scroll, with a small stagger between siblings that arrive together */
  const reveal = io(
    (e, obs) => {
      if (!e.isIntersecting) return
      const el = e.target
      const group = $$(':scope > [data-reveal]', el.parentElement)
      const i = Math.max(0, group.indexOf(el))
      el.style.setProperty('--d', Math.min(i, 4) * 80 + 'ms')
      el.classList.add('in')
      obs.unobserve(el)
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  )
  $$('[data-reveal]').forEach((el) => reveal.observe(el))

  /* Hero: the scripted WhatsApp conversation */
  const stage = $('[data-hero]')
  if (stage) {
    const steps = $$('[data-step]', stage)
    const track = $('[data-track]', stage)
    const body = track.parentElement
    const brief = $('[data-brief]', stage)
    const deal = $('[data-step-deal]', stage)
    const clock = $('[data-clock]', stage)
    const [fc1, fc2, fc3] = $$('.float-card', stage)
    let timers = []
    let running = false

    const later = (ms, fn) => timers.push(setTimeout(fn, ms))
    const follow = () => {
      const shift = Math.max(0, track.offsetHeight - body.clientHeight)
      track.style.transform = `translateY(${-shift}px)`
    }
    const show = (i) => {
      const el = steps[i]
      el.classList.remove('pending')
      void el.offsetWidth
      el.classList.add('on')
      follow()
    }
    const hideTyping = () => { const t = $('.typing', stage); t.classList.remove('on'); t.classList.add('pending') }
    const reset = () => {
      steps.forEach((el) => { el.classList.remove('on'); el.classList.add('pending') })
      brief.classList.remove('filled')
      deal.classList.remove('on')
      track.style.transform = 'translateY(0)'
      clock.textContent = '0:00'
    }
    const tickClock = (from, to, every) => {
      for (let s = from; s <= to; s++) later((s - from) * every, () => (clock.textContent = '0:0' + s))
    }
    const play = () => {
      if (running) return
      running = true
      reset()
      const t0 = 500
      later(t0 + 100, () => show(0))
      later(t0 + 300, () => tickClock(1, 4, 480))
      later(t0 + 800, () => show(1))
      later(t0 + 2200, () => { hideTyping(); show(2); fc1 && fc1.classList.add('in') })
      later(t0 + 3500, () => show(3))
      later(t0 + 4300, () => show(4))
      later(t0 + 5400, () => show(5))
      later(t0 + 6300, () => { brief.classList.add('filled'); show(6) })
      later(t0 + 7700, () => show(7))
      later(t0 + 9300, () => show(8))
      later(t0 + 10100, () => show(9))
      later(t0 + 11600, () => deal.classList.add('on'))
      later(t0 + 15600, () => { running = false; timers = []; play() })
    }
    const stop = () => { timers.forEach(clearTimeout); timers = []; running = false }

    if (still) {
      steps.forEach((el) => el.classList.remove('pending'))
      steps.forEach((el) => el.classList.add('on'))
      hideTyping()
      brief.classList.add('filled')
      clock.textContent = '0:04'
      requestAnimationFrame(follow)
      ;[fc1, fc2, fc3].forEach((f) => f && f.classList.add('in'))
    } else {
      reset()
      setTimeout(() => fc2 && fc2.classList.add('in'), 1400)
      setTimeout(() => fc3 && fc3.classList.add('in'), 1900)
      let visible = false
      const sync = () => (visible && !document.hidden ? play() : stop())
      io((e) => { visible = e.isIntersecting; sync() }, { threshold: 0.2 }).observe(stage)
      document.addEventListener('visibilitychange', sync)
    }
  }

  /* Ticker: pause while off screen */
  const ticker = $('[data-ticker]')
  if (ticker) io((e) => ticker.classList.toggle('paused', !e.isIntersecting)).observe(ticker)

  /* Leak calculator */
  const calc = $('[data-calc]')
  if (calc) {
    const inr = new Intl.NumberFormat('en-IN')
    const big = $('[data-out="lost"]', calc)
    const short = (n) => (n >= 1e7 ? '₹' + (n / 1e7).toFixed(1).replace(/\.0$/, '') + ' crore' : n >= 1e5 ? '₹' + (n / 1e5).toFixed(1).replace(/\.0$/, '') + ' lakh' : '₹' + inr.format(n))
    const update = () => {
      const v = Object.fromEntries($$('input', calc).map((i) => [i.name, +i.value]))
      $$('input', calc).forEach((i) => i.style.setProperty('--p', ((i.value - i.min) / (i.max - i.min)) * 100 + '%'))
      $('[data-out="leads"]', calc).textContent = inr.format(v.leads)
      $('[data-out="cpl"]', calc).textContent = '₹' + inr.format(v.cpl)
      $('[data-out="slow"]', calc).textContent = v.slow + '%'
      const lost = Math.round((v.leads * v.cpl * v.slow) / 100)
      big.textContent = '₹' + inr.format(lost)
      $('[data-out="year"]', calc).textContent = short(lost * 12)
      big.classList.remove('tick'); void big.offsetWidth; big.classList.add('tick')
      // The WhatsApp button carries their own numbers, so the first message already says why they're writing.
      const cta = $('[data-calc-cta]', calc)
      if (cta) {
        const u = new URL(cta.href)
        u.searchParams.set('text', `Hi! I worked it out on your site: we buy about ${inr.format(v.leads)} leads a month and roughly ₹${inr.format(lost)} a month goes cold from slow replies. Can you show me how Bayana fixes this?`)
        cta.href = u.toString()
      }
    }
    calc.addEventListener('input', update)
    update()
    big.classList.remove('tick')
  }

  /* How it works: the sticky phone follows the step in the middle of the screen */
  const shots = $$('[data-how-shot]')
  const stepEls = $$('[data-step-n]')
  if (stepEls.length) {
    const watch = io(
      (e) => {
        if (!e.isIntersecting) return
        const n = e.target.dataset.stepN
        stepEls.forEach((s) => { s.classList.toggle('on', s === e.target); s.classList.toggle('done', +s.dataset.stepN < +n) })
        shots.forEach((s) => s.classList.toggle('is-on', s.dataset.howShot === n))
        const rail = $('[data-steps]')
        if (rail) rail.style.setProperty('--fill', (n - 1) / (stepEls.length - 1))
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    stepEls.forEach((s) => watch.observe(s))
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
  if (still || saveData) {
    clips.forEach((v) => { v.controls = true; v.preload = 'none'; load(v) })
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

  /* Mobile WhatsApp dock: after the hero, hidden again at the final call to action */
  const dock = $('[data-dock]')
  const hero = $('.hero')
  const final = $('.final')
  if (dock && hero && final) {
    let pastHero = false, atEnd = false
    const sync = () => dock.classList.toggle('show', pastHero && !atEnd)
    io((e) => { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; sync() }).observe(hero)
    io((e) => { atEnd = e.isIntersecting; sync() }).observe(final)
  }

  /* Final skyline draws itself once */
  $$('[data-draw]').forEach((el) => io((e, obs) => { if (e.isIntersecting) { el.classList.add('drawn'); obs.unobserve(el) } }, { threshold: 0.2 }).observe(el))

  /* ?debug=1 shows an FPS meter */
  if (/[?&]debug=1/.test(location.search)) {
    const m = document.createElement('div'); m.className = 'fps'; document.body.append(m)
    let n = 0, last = performance.now(), worst = 0, prev = last
    const loop = (t) => { n++; worst = Math.max(worst, t - prev); prev = t; if (t - last > 1000) { m.textContent = `${n} fps · worst ${worst.toFixed(0)} ms`; n = 0; worst = 0; last = t } requestAnimationFrame(loop) }
    requestAnimationFrame(loop)
  }
})()

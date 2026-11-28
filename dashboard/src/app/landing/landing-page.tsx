/* eslint-disable @next/next/no-img-element -- small SVG icons the kit scripts find by data-icon; next/image adds nothing here */
import type { CSSProperties } from "react";
import { HeroMotion } from "./hero-motion";
import { SmoothScroll } from "./smooth-scroll";
import { ThemeToggle } from "./theme-toggle";

// The public home page. Built with the design-taste-frontend skill: hero collage, nav-mega,
// close-type, footer-statement, dark band, tonal buttons, stack mark; silk-folds effect in the hero,
// fluted-glass on the step cards, the liquid-type moment on #free. Effects, moments and UI panels
// are the kit's plain scripts in public/assets, loaded by page.tsx after hydration.
export function LandingPage() {
  return (
    <>
      <header className="nav">
        <div className="wrap nav__bar">
          <a className="skip-link" href="#top">Skip to content</a>
          <a className="nav__logo" href="#top"><span className="mark" data-mark="stack" aria-hidden="true"></span>Job Outreach</a>
          <nav className="nav__links" aria-label="Main">
            <div className="nav__item">
              <a className="nav__link" href="#product">Product <svg className="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
              <div className="nav__menu">
                <div className="wrap grid">
                  <div className="menu-col span-3">
                    <p className="t-label">Find</p>
                    <a href="#how">Chrome extension<span>Reads LinkedIn hiring posts</span></a>
                    <a href="#how">Word filters<span>Skips posts you rule out</span></a>
                    <a href="#product">Contacts<span>One row per address</span></a>
                  </div>
                  <div className="menu-col span-3">
                    <p className="t-label">Send</p>
                    <a href="#how">Campaigns<span>Gaps, caps and hours</span></a>
                    <a href="#product">Templates<span>Name and company filled in</span></a>
                    <a href="#security">Follow-ups<span>Same thread, after N days</span></a>
                  </div>
                  <a className="menu-card span-3 start-10" href="#security">
                    <div className="panel"><img className="frame__img" data-icon="gmail" src="/assets/icons/gmail.svg" alt="" style={{objectFit: "contain", padding: "40px"} as CSSProperties} /></div>
                    <span className="t-card">Reply detection</span>
                    <span className="t-small muted">Checks your inbox every 10 minutes</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="nav__item"><a className="nav__link" href="#how">Steps</a></div>
            <div className="nav__item"><a className="nav__link" href="#security">Security</a></div>
            <div className="nav__item"><a className="nav__link" href="#faq">Questions</a></div>
          </nav>
          <div className="nav__actions">
            <ThemeToggle />
            <a className="btn btn--primary" href="/login">Try now</a>
          </div>
          <button className="nav__toggle" type="button" aria-expanded="false" aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>
      </header>
      
      <main id="top">
        {/* Staged hero: "SEND" + a "your CV" sticker as the headline, a phone running a campaign on a lime arch,
            stickers around it, a wavy ribbon at the foot. On wide screens the phone travels down into the next
            section as you scroll (hero-motion.tsx measures the distance). data-enter="off": its entrance is its
            own CSS, not the kit's word split. */}
        <section className="hero hstage" data-enter="off" aria-labelledby="hero-h">
          <HeroMotion />
          <SmoothScroll />
          <div className="hstage__grid" aria-hidden="true"></div>
          <div className="wrap hstage__wrap">
            <div className="hstage__stage">
              <h1 id="hero-h" className="hstage__title">
                <span className="hstage__word">Send</span>{" "}
                <span className="hstage__sticker"><span>your CV</span></span>
              </h1>

              <div className="hs-stick hs-stick--a" aria-hidden="true"><span className="hs-stick__in is-accent"><svg viewBox="0 0 16 16"><path d="M2.5 4.5h11v8h-11z" /><path d="m2.5 5 5.5 4 5.5-4" /></svg>7 replies</span></div>
              <div className="hs-stick hs-stick--b" aria-hidden="true"><span className="hs-stick__in"><img src="/assets/icons/linkedin.svg" alt="" width="18" height="18" />142 recruiters found</span></div>
              <div className="hs-stick hs-stick--c" aria-hidden="true"><span className="hs-stick__in"><img src="/assets/icons/gmail.svg" alt="" width="18" height="18" />Sent from your Gmail</span></div>

              <div className="hstage__center" role="img" aria-label="A campaign in the Job Outreach app: 142 recruiters queued, 86 emails sent and 7 replies">
                {/* the arch behind the phone: the kit's fluted-glass ground, like the step cards */}
                <div className="hstage__arch" data-fx="fluted-glass" data-fx-seed="31" aria-hidden="true"></div>
                <div className="hs-fly">
                  <div className="hs-phone" aria-hidden="true">
                    <div className="hs-phone__screen">
                      <div className="hs-phone__status"><span>9:41</span><i className="hs-phone__island"></i><span className="hs-phone__bat"></span></div>
                      <div className="hs-app__head">
                        <span className="hs-app__mark"><svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="4" rx="1" /><rect x="3" y="10" width="18" height="4" rx="1" /><rect x="3" y="16" width="18" height="4" rx="1" /></svg></span>
                        <span><b>React roles</b><small>Campaign · day 2</small></span>
                        <span className="hs-live"><i></i>Sending</span>
                      </div>
                      <div className="hs-stats">
                        <div><small>Queued</small><b>142</b></div>
                        <div><small>Sent</small><b className="hs-count">86</b></div>
                        <div className="is-accent"><small>Replied</small><b>7</b></div>
                      </div>
                      <div className="hs-chart">
                        <div className="hs-chart__head"><small>Sent, last 7 days</small><small className="hs-chart__up">+24 today</small></div>
                        <svg className="hs-area" viewBox="0 0 240 80" preserveAspectRatio="none">
                          <path className="hs-area__fill" d="M0 70 L40 60 L80 64 L120 44 L160 48 L200 26 L240 10 L240 80 L0 80 Z" />
                          <path className="hs-area__line" d="M0 70 L40 60 L80 64 L120 44 L160 48 L200 26 L240 10" />
                          <circle className="hs-area__dot" cx="240" cy="10" r="4" />
                        </svg>
                      </div>
                      <div className="hs-tiles">
                        <div className="is-ink"><small>Reply rate</small><b>8.1%</b></div>
                        <div><small>Follow-ups</small><b>2 queued</b></div>
                      </div>
                      <div className="hs-list">
                        <div className="hs-row"><span className="hs-av">DO</span><span><b>Daniel Osei</b><small>Paylane</small></span><em className="is-accent">Replied</em></div>
                        <div className="hs-row"><span className="hs-av">RS</span><span><b>Ritika Sharma</b><small>Cloudnest</small></span><em>Sent</em></div>
                        <div className="hs-row"><span className="hs-av">JW</span><span><b>Jonas Weber</b><small>Orbitly</small></span><em>Queued</em></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hs-stick hs-stick--e" aria-hidden="true">
                <div className="hs-stick__in hs-reply">
                  <span className="hs-reply__head"><span className="hs-av">DO</span><span><b>Daniel Osei</b><small>Re: Frontend developer · 2h ago</small></span></span>
                  <span className="hs-reply__text">&ldquo;Thanks for reaching out. Are you free for a call on Thursday?&rdquo;</span>
                </div>
              </div>

              <div className="hstage__proof">
                <span className="hstage__faces" aria-hidden="true"><i>MI</i><i>JW</i><i>RS</i><i>DO</i><i>+</i></span>
                <p><b>Replies land in your inbox,</b> not on a job portal.</p>
              </div>

              <div className="hstage__pitch">
                <p className="hero__lead">Job Outreach finds recruiter emails in LinkedIn hiring posts and sends your CV from your own Gmail, on a schedule, with follow-ups in the same thread.</p>
                <div className="btn-row"><a className="btn btn--secondary hstage__play" href="#how"><span className="hstage__play-dot" aria-hidden="true"><svg viewBox="0 0 12 12"><path d="M4 2.5v7l5.5-3.5z" /></svg></span>See the 3 steps</a><a className="btn btn--primary" href="/login">Try now<svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path className="m-arrow__stem" d="M1 6h8" /><path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" /></svg></a></div>
              </div>
            </div>
          </div>

          {/* the wavy ribbon is the edge between the hero and the next section: one long, gentle wave; below it the
              next section's colour fills to the bottom, the band runs along the wave and the words along the band */}
          <svg className="hstage__ribbon" viewBox="0 0 1440 190" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs><path id="hs-wave" d="M-320 118 C-20 86 260 52 600 58 S1180 150 1760 104" /></defs>
            <path className="hstage__ribbon-fill" d="M-320 118 C-20 86 260 52 600 58 S1180 150 1760 104 L1760 190 L-320 190 Z" />
            <use href="#hs-wave" className="hstage__ribbon-band" />
            <text className="hstage__ribbon-text" dy="10">
              <textPath href="#hs-wave" startOffset="0">
                {Array.from({ length: 5 }, (_, i) => (
                  <tspan key={i}>LINKEDIN POSTS <tspan className="is-star">✱</tspan> <tspan className="is-serif">recruiter emails</tspan> <tspan className="is-star">✱</tspan> YOUR OWN GMAIL <tspan className="is-star">✱</tspan> <tspan className="is-serif">follow-ups</tspan> <tspan className="is-star">✱</tspan> REPLY DETECTION <tspan className="is-star">✱</tspan> <tspan className="is-serif">your CV attached</tspan> <tspan className="is-star">✱</tspan> </tspan>
                ))}
                <animate attributeName="startOffset" from="0" to="-1500" dur="26s" repeatCount="indefinite" />
              </textPath>
            </text>
          </svg>
        </section>

        {/* where the phone lands: the problem the visitor already has */}
        <section className="section pain" aria-labelledby="pain-h">
          <div className="wrap pain__wrap">
            <span className="pain__tag">Sound familiar?</span>
            <h2 id="pain-h" className="pain__title">So many applications, zero <span className="hstage__sticker hstage__sticker--sm"><span>replies</span></span></h2>
            <p className="pain__lead">Your CV is fine. The way it travels isn&rsquo;t: portals bury it, <b>recruiter emails hide in LinkedIn posts</b>, and nobody follows up. That is what Job Outreach fixes.</p>
            <div className="pain__stage">
              <div className="pain__slot" aria-hidden="true"></div>
              <figure className="pain-card pain-card--a"><blockquote>&ldquo;I apply on portals and never hear back.&rdquo;</blockquote><figcaption>Your CV lands in a pile of hundreds.</figcaption></figure>
              <figure className="pain-card pain-card--b"><blockquote>&ldquo;Finding recruiter emails takes hours.&rdquo;</blockquote><figcaption>They are buried in LinkedIn posts.</figcaption></figure>
              <figure className="pain-card pain-card--c"><blockquote>&ldquo;I forget to follow up.&rdquo;</blockquote><figcaption>So the conversation goes cold.</figcaption></figure>
              <figure className="pain-card pain-card--d"><blockquote>&ldquo;My emails feel copy-pasted.&rdquo;</blockquote><figcaption>No name, no company, no reason to reply.</figcaption></figure>
              <span className="pain__think" aria-hidden="true"><span>😩</span><i></i><i></i></span>
            </div>
          </div>
        </section>

        <section className="section" id="product" aria-labelledby="product-h">
          <div className="wrap">
            <div className="grid">
              <h2 id="product-h" className="span-5">Every email in one Job Outreach list</h2>
              <div className="span-6 start-7 stack-4">
                <p>The sent list shows who is queued, sending and done. Open a row and you see the email as it went out, with the name, the company and your CV filled in.</p>
                <a className="link" href="#how">See how a campaign is set up</a>
              </div>
            </div>
            <div className="ui app fill" role="img" aria-label="The sent list with recruiters queued and sent, beside the first email with the recruiter's name and the CV filled in" data-ui-pause-host="">
              <div className="app__pane app__pane--list">
                <div className="ui ui-panel ui-win" data-ui="window" data-open="Queued" data-work="Sending" data-done="Sent">
                  <div className="ui-win__bar">
                    <span className="ui-dots" aria-hidden="true"><i></i><i></i><i></i></span>
                    <span className="ui-win__crumb">Job Outreach <i>/</i> <b>Sent</b></span>
                    <span className="ui-spacer"></span>
                    <span className="ui-win__search" aria-hidden="true"><svg className="ui-icon" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" /></svg><span className="ui-win__ph">Search</span><span className="ui-kbd">/</span></span>
                  </div>
                  <div className="ui-win__body">
                    <nav className="ui-win__side" aria-hidden="true">
                      <span className="ui-win__nav is-on"><svg className="ui-icon" viewBox="0 0 16 16"><path d="M2.5 4.5h11v8h-11z" /><path d="m2.5 5 5.5 4 5.5-4" /></svg>Sent<em>86</em></span>
                      <span className="ui-win__nav"><svg className="ui-icon" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" /><path d="M8 5v3l2 1.5" /></svg>Scheduled<em>41</em></span>
                      <span className="ui-win__nav"><svg className="ui-icon" viewBox="0 0 16 16"><path d="m3.5 8.4 2.8 2.8 6.2-6.4" /></svg>Replied<em>7</em></span>
                      <span className="ui-win__nav"><svg className="ui-icon" viewBox="0 0 16 16"><path d="M8 3v6M8 11.5v.5" /></svg>Failed<em>2</em></span>
                      <span className="ui-win__label">Campaigns</span>
                      <span className="ui-win__nav"><span className="ui-win__hash">#</span>React roles</span>
                      <span className="ui-win__nav"><span className="ui-win__hash">#</span>Node.js</span>
                    </nav>
                    <div className="ui-win__main">
                      <div className="ui-win__cols" aria-hidden="true"><span>Recruiter</span><span>Email</span><span>Status</span><span>Time</span></div>
                      <ul className="ui-win__rows">
                        <li className="ui-win__row" data-row=""><span className="ui-avatar" data-tone="1">MI</span><span className="ui-win__who">Meera Iyer</span><span className="ui-win__sub">Frontend developer, Fintrail</span><span className="ui-win__st" data-st="">Queued</span><span className="ui-win__age">10:42</span></li>
                        <li className="ui-win__row" data-row=""><span className="ui-avatar" data-tone="3">JW</span><span className="ui-win__who">Jonas Weber</span><span className="ui-win__sub">Frontend developer, Orbitly</span><span className="ui-win__st" data-st="">Queued</span><span className="ui-win__age">10:47</span></li>
                        <li className="ui-win__row" data-row=""><span className="ui-avatar" data-tone="4">VN</span><span className="ui-win__who">Vikram Nair</span><span className="ui-win__sub">Frontend developer, Tessera</span><span className="ui-win__st" data-st="">Queued</span><span className="ui-win__age">10:51</span></li>
                        <li className="ui-win__row" data-row=""><span className="ui-avatar" data-tone="2">DO</span><span className="ui-win__who">Daniel Osei</span><span className="ui-win__sub">Re: Frontend developer, Paylane</span><span className="ui-win__st is-you" data-st="">Replied</span><span className="ui-win__age">09:58</span></li>
                        <li className="ui-win__row" data-row=""><span className="ui-avatar" data-tone="5">RS</span><span className="ui-win__who">Ritika Sharma</span><span className="ui-win__sub">Frontend developer, Cloudnest</span><span className="ui-win__st is-done" data-st="">Sent</span><span className="ui-win__age">09:36</span></li>
                        <li className="ui-win__row" data-row=""><span className="ui-avatar" data-tone="3">AK</span><span className="ui-win__who">Anna Kowalski</span><span className="ui-win__sub">Frontend developer, Brightdesk</span><span className="ui-win__st is-done" data-st="">Sent</span><span className="ui-win__age">09:31</span></li>
                        <li className="ui-win__row" data-row=""><span className="ui-avatar" data-tone="1">LM</span><span className="ui-win__who">Luis Moreno</span><span className="ui-win__sub">Frontend developer, Quillstack</span><span className="ui-win__st is-done" data-st="">Sent</span><span className="ui-win__age">09:26</span></li>
                        <li className="ui-win__row" data-row=""><span className="ui-avatar" data-tone="4">HT</span><span className="ui-win__who">Hana Takeda</span><span className="ui-win__sub">Frontend developer, Ferroway</span><span className="ui-win__st is-done" data-st="">Sent</span><span className="ui-win__age">09:20</span></li>
                        <li className="ui-win__row" data-row=""><span className="ui-avatar" data-tone="2">SB</span><span className="ui-win__who">Sofia Bianchi</span><span className="ui-win__sub">Frontend developer, Marlowe</span><span className="ui-win__st is-done" data-st="">Sent</span><span className="ui-win__age">09:15</span></li>
                        <li className="ui-win__row" data-row=""><span className="ui-avatar" data-tone="5">KA</span><span className="ui-win__who">Kwame Asante</span><span className="ui-win__sub">Frontend developer, Driftly</span><span className="ui-win__st is-done" data-st="">Sent</span><span className="ui-win__age">09:09</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="app__pane app__pane--open" data-ui-loop="">
                <div className="ui ui-doc" data-ui="doc">
                  <article className="ui-doc__page">
                    <div className="ui-doc__label">To Meera Iyer · template First email · attached Resume_2026.pdf</div>
                    <div className="ui-doc__title">Frontend developer, <mark className="ui-doc__mark is-on">Fintrail</mark></div>
                    <div className="ui-doc__text">Hi <mark className="ui-doc__mark" data-kind="Filled in" data-msg="Her first name, taken from the contact." data-where="Contacts, from her LinkedIn post">Meera</mark>,</div>
                    <div className="ui-doc__text">I saw your post about the React developer role and would like to apply. I have four years of React and TypeScript work, most recently on a payments dashboard used by 30 teams.</div>
                    <div className="ui-doc__text">My CV is attached. I can start within a month and am happy to do a short call this week.</div>
                    <div className="ui-doc__text">Thanks for reading,<br />Akash</div>
                    <div className="ui-doc__text">No reply in 3 days? The follow-up goes out in this same thread.</div>
                  </article>
                  <aside className="ui-doc__note ui-panel is-on" aria-live="polite">
                    <div className="ui-doc__kind"><span className="ui-doc__dot"></span><span data-doc-kind="">Filled in</span></div>
                    <div className="ui-doc__msg" data-doc-msg="">The company name goes into the subject.</div>
                    <div className="ui-doc__where" data-doc-where="">Contacts, company field</div>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        </section>
      
        <section className="section" id="how" style={{"--hm": "2"} as CSSProperties} aria-labelledby="how-h">
          <div className="wrap">
            <div className="section-head">
              <h2 id="how-h">Start a campaign in 3 steps</h2>
            </div>
            <div className="grid">
              <article className="card card--row card--open span-4 m-nolift">
                <span className="step-num">1</span>
                <h3>Collect emails from LinkedIn</h3>
                <p>The extension searches posts by keyword and date, scrolls for you and saves every email it finds.</p>
                <div className="panel" data-fx="fluted-glass" data-fx-seed="31">
                  <div className="stage stage--fade-b"><div className="at-rise fit" style={{"--fit-max": "380px", "--ax": "max(24px, 50% - 190px)", "--ay": "40px", "--ay-sm": "16px"} as CSSProperties} data-ui-loop="">
                    <div className="ui ui-panel ui-search" data-ui="search">
                      <div className="ui-search__field">
                        <svg className="ui-icon" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" /></svg>
                        <span className="ui-search__q"><span data-search-q="">hiring react developer</span><i className="ui-search__caret"></i></span>
                        <kbd className="ui-search__kbd">Past week</kbd>
                      </div>
                      <div className="ui-search__group">Posts on LinkedIn</div>
                      <ul className="ui-search__list" data-search-list="">
                        <li className="ui-search__row is-sel"><span className="ui-search__ico"><img data-icon="linkedin" src="/assets/icons/linkedin.svg" alt="" width="14" height="14" /></span><span className="ui-search__t">Fintrail: <b>React</b> role</span><span className="ui-search__m">2 emails</span></li>
                        <li className="ui-search__row"><span className="ui-search__ico"><img data-icon="linkedin" src="/assets/icons/linkedin.svg" alt="" width="14" height="14" /></span><span className="ui-search__t">Orbitly: <b>React</b>, remote</span><span className="ui-search__m">1 email</span></li>
                        <li className="ui-search__row"><span className="ui-search__ico"><img data-icon="linkedin" src="/assets/icons/linkedin.svg" alt="" width="14" height="14" /></span><span className="ui-search__t">Java backend team</span><span className="ui-search__m">Skipped</span></li>
                      </ul>
                      <div className="ui-search__foot"><span>Skip posts that mention: java, php</span></div>
                    </div>
                  </div></div>
                </div>
              </article>
              <article className="card card--row card--open span-4 m-nolift">
                <span className="step-num">2</span>
                <h3>Add your CV and templates</h3>
                <p>Upload a PDF or Word CV up to 5 MB and write a first email and a follow-up.</p>
                <div className="panel" data-fx="fluted-glass" data-fx-seed="47">
                  <div className="stage stage--fade-b"><div className="at-rise fit" style={{"--fit-max": "300px", "--ax": "max(24px, 50% - 150px)", "--ay": "40px", "--ay-sm": "16px"} as CSSProperties}>
                    <div className="ui ui-files" data-ui="files" data-reading="Checking {n} of {total}">
                      <div className="ui-files__status"><span className="ui-dot"></span><span data-files-status="">4 files ready</span></div>
                      <ul className="ui-files__grid">
                        <li className="ui-file is-done">
                          <span className="ui-file__icon"><svg className="ui-file__glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.25 2.75h8L18.75 7.25v14H6.25z" /><path d="M14 2.75v4.75h4.75M9 12.5h6.5M9 15.5h6.5M9 18.5h4" /></svg></span>
                          <span className="ui-file__name">Resume_2026.pdf</span><span className="ui-file__kind">PDF, default</span>
                          <span className="ui-file__bar"><i></i></span>
                          <span className="ui-file__check"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4.5 8.2 2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                        </li>
                        <li className="ui-file is-done">
                          <span className="ui-file__icon"><img data-icon="docx" src="/assets/icons/docx.svg" alt="" /></span>
                          <span className="ui-file__name">Resume_full.docx</span><span className="ui-file__kind">Word</span>
                          <span className="ui-file__bar"><i></i></span>
                          <span className="ui-file__check"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4.5 8.2 2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                        </li>
                        <li className="ui-file is-done">
                          <span className="ui-file__icon"><img data-icon="gmail" src="/assets/icons/gmail.svg" alt="" /></span>
                          <span className="ui-file__name">First email</span><span className="ui-file__kind">Template</span>
                          <span className="ui-file__bar"><i></i></span>
                          <span className="ui-file__check"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4.5 8.2 2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                        </li>
                        <li className="ui-file is-done">
                          <span className="ui-file__icon"><img data-icon="gmail" src="/assets/icons/gmail.svg" alt="" /></span>
                          <span className="ui-file__name">Follow-up</span><span className="ui-file__kind">Template</span>
                          <span className="ui-file__bar"><i></i></span>
                          <span className="ui-file__check"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4.5 8.2 2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                        </li>
                      </ul>
                    </div>
                  </div></div>
                </div>
              </article>
              <article className="card card--row card--open span-4 m-nolift">
                <span className="step-num">3</span>
                <h3>Schedule your Gmail sends</h3>
                <p>Pick a start time, a gap between emails, a daily cap and the hours you send in.</p>
                <div className="panel" data-fx="fluted-glass" data-fx-seed="58">
                  <div className="stage stage--fade-b"><div className="at-rise fit" style={{"--fit-max": "340px", "--ax": "max(24px, 50% - 170px)", "--ay": "40px", "--ay-sm": "16px"} as CSSProperties}>
                    <div className="ui ui-panel ui-toggles" data-ui="toggles">
                      <div className="ui-head">
                        <svg className="ui-icon ui-toggles__ico" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5" /><path d="M8 5v3l2 1.5" /></svg>
                        <div className="ui-title">Campaign rules</div>
                        <span className="ui-spacer"></span>
                        <div className="ui-meta" data-tg-count="">4 of 5 on</div>
                      </div>
                      <ul className="ui-toggles__list">
                        <li className="ui-tg"><span className="ui-tg__text"><span className="ui-tg__label">Random gap</span><span className="ui-tg__sub">2 to 6 minutes between emails</span></span><button className="ui-switch is-on" type="button" role="switch" aria-checked="true" aria-label="Random gap" tabIndex={-1}><i></i></button></li>
                        <li className="ui-tg"><span className="ui-tg__text"><span className="ui-tg__label">Daily cap</span><span className="ui-tg__sub">60 emails a day</span></span><button className="ui-switch is-on" type="button" role="switch" aria-checked="true" aria-label="Daily cap" tabIndex={-1}><i></i></button></li>
                        <li className="ui-tg"><span className="ui-tg__text"><span className="ui-tg__label">Sending hours</span><span className="ui-tg__sub">09:00 to 18:00, Monday to Friday</span></span><button className="ui-switch is-on" type="button" role="switch" aria-checked="true" aria-label="Sending hours" tabIndex={-1}><i></i></button></li>
                        <li className="ui-tg"><span className="ui-tg__text"><span className="ui-tg__label">Automatic follow-up</span><span className="ui-tg__sub">After 3 days, up to 2 times</span></span><button className="ui-switch" type="button" role="switch" aria-checked="false" aria-label="Automatic follow-up" tabIndex={-1}><i></i></button></li>
                        <li className="ui-tg"><span className="ui-tg__text"><span className="ui-tg__label">Skip anyone emailed before</span><span className="ui-tg__sub">Checked again before each send</span></span><button className="ui-switch is-on" type="button" role="switch" aria-checked="true" aria-label="Skip anyone emailed before" tabIndex={-1}><i></i></button></li>
                      </ul>
                    </div>
                  </div></div>
                </div>
              </article>
            </div>
          </div>
        </section>
      
        <section className="section statement" id="free" aria-labelledby="free-h">
          <div className="wrap">
            <div data-moment="liquid-type" className="section-head" style={{maxWidth: "none"} as CSSProperties}>
              <h2 id="free-h" className="mo-lt__type">Free, and sent from your inbox</h2>
              <p className="t-lead measure">There is no plan to buy and no card to add. Recruiters see your own address, and their replies land in the inbox you already read.</p>
            </div>
            <div className="free-bento">
              <article className="fb fb--price">
                <span className="fb__tag">Price</span>
                <div className="fb__price"><b>$0</b><span className="fb__stamp">Free</span></div>
                <ul className="fb__receipt" aria-label="What Job Outreach costs">
                  <li><span>Chrome extension</span><span>$0</span></li>
                  <li><span>Dashboard and campaigns</span><span>$0</span></li>
                  <li><span>Follow-ups and reply checks</span><span>$0</span></li>
                  <li className="is-total"><span>Every month</span><span>$0</span></li>
                </ul>
                <p className="fb__note">Every feature, no card to add.</p>
              </article>
              <article className="fb fb--from">
                <span className="fb__tag">Sends from</span>
                <b className="fb__big">Your inbox</b>
                <div className="fb__mail" aria-hidden="true">
                  <div className="fb__mail-row"><span>From</span><span className="fb__chip"><img src="/assets/icons/gmail.svg" alt="" width="14" height="14" />you@gmail.com</span></div>
                  <div className="fb__mail-row"><span>To</span><span className="fb__chip">Priya · Hireloop recruiter</span></div>
                  <div className="fb__mail-sub">Application for the React role</div>
                  <div className="fb__reply"><i></i>Priya replied, in your inbox</div>
                </div>
                <p className="fb__note">Your Gmail or any SMTP account.</p>
              </article>
              <article className="fb fb--limit">
                <span className="fb__tag">Daily limit</span>
                <b className="fb__big">~500<small>/day</small></b>
                <div className="fb__meter" aria-hidden="true">
                  <span className="fb__cap">Your cap: 60</span>
                  <div className="fb__bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
                  <div className="fb__scale"><span>0</span><span>250</span><span>500</span></div>
                </div>
                <p className="fb__note">Gmail&rsquo;s own limit. Each campaign sets a lower daily cap.</p>
              </article>
            </div>
          </div>
        </section>
      
        <section className="section" id="security" aria-labelledby="security-h">
          <div className="wrap">
            <div className="grid">
              <div className="span-5 stack-6">
                <h2 id="security-h">Your passwords are locked before they are saved</h2>
                <p className="t-lead">Your Gmail, SMTP and IMAP app passwords are encrypted with AES-256-GCM. Your login password is kept only as a one-way bcrypt hash, so no one can read it, not even an admin.</p>
                <ul className="stack-3">
                  <li>Sign-in tokens last 15 minutes; end any session from Settings</li>
                  <li>Mail goes out from your own address</li>
                  <li>Accounts are made by the admin, no public sign-up</li>                </ul>
                <a className="link" href="#faq">Read the questions</a>
              </div>
              <div className="frame frame--split frame--lit span-6 start-7" data-visual="">
                <div className="sec-panel" aria-hidden="true">
                  <div className="sec-panel__head"><b>Account security</b><span className="sec-pill sec-pill--ok">All on</span></div>
                  <div className="sec-row"><span className="sec-ico"><svg viewBox="0 0 16 16"><rect x="3.5" y="7" width="9" height="6.5" rx="1.5" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></svg></span><span><b>SMTP and IMAP passwords</b><small>AES-256-GCM, stored encrypted</small></span><span className="sec-pill sec-pill--ok">Encrypted</span></div>
                  <div className="sec-row"><span className="sec-ico"><svg viewBox="0 0 16 16"><path d="M8 1.5 13 3.5v4c0 3-2.2 5.6-5 7-2.8-1.4-5-4-5-7v-4z" /><path d="m5.8 8 1.6 1.6 2.8-3" /></svg></span><span><b>Login password</b><small>bcrypt hash, one-way</small></span><span className="sec-pill sec-pill--ok">Hashed</span></div>
                  <div className="sec-row"><span className="sec-ico"><svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" /><path d="M8 5v3l2 1.5" /></svg></span><span><b>Sign-in token</b><small>Expires after 15 minutes</small></span><span className="sec-pill">Active</span></div>                  <div className="sec-panel__label">Active sessions</div>
                  <div className="sec-row"><span className="sec-ico"><svg viewBox="0 0 16 16"><rect x="2" y="3.5" width="12" height="8" rx="1.2" /><path d="M1 13.5h14" /></svg></span><span><b>Chrome on a laptop</b><small>This device</small></span><span className="sec-pill">Current</span></div>
                  <div className="sec-row"><span className="sec-ico"><svg viewBox="0 0 16 16"><rect x="4.5" y="1.5" width="7" height="13" rx="1.5" /><path d="M7 12.5h2" /></svg></span><span><b>Safari on a phone</b><small>Last seen 2 days ago</small></span><span className="sec-btn">End</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      
        <section className="section" id="faq" aria-labelledby="faq-h">
          <div className="wrap">
            <div className="grid grid--top">
              <div className="span-5 faq-intro">
                <h2 id="faq-h">Questions</h2>
                <p className="t-lead muted">What people ask before they send their first campaign.</p>
                <div className="faq-help">
                  <b>Have an account already?</b>
                  <span>Sign in and start your first campaign in a few minutes.</span>
                  <a className="link" href="/login">Sign in</a>
                </div>
              </div>
              <ol className="faq-list span-7 start-6">
                <li className="faq-card"><span className="faq-card__n">01</span><div><h3>Is it really free?</h3><p>Yes. There is no plan or card. The only limit is your mail provider’s: Gmail allows about 500 emails a day.</p></div></li>
                <li className="faq-card"><span className="faq-card__n">02</span><div><h3>How do I get a Job Outreach account?</h3><p>The admin creates it; there is no public sign-up. With your email and password, Try now takes you to the sign-in page.</p></div></li>
                <li className="faq-card"><span className="faq-card__n">03</span><div><h3>Which Gmail or SMTP account sends it?</h3><p>Yours. Add your SMTP details in Settings; for Gmail, an app password and one click on Use Gmail defaults.</p></div></li>
                <li className="faq-card"><span className="faq-card__n">04</span><div><h3>Can a recruiter get my CV twice?</h3><p>No. Each address is saved once, campaigns skip anyone already emailed, and the sender checks again right before each send.</p></div></li>
                <li className="faq-card"><span className="faq-card__n">05</span><div><h3>Is scrolling LinkedIn allowed?</h3><p>Automated scrolling goes against LinkedIn’s terms. The extension reads only what your signed-in browser shows, at a human pace, so keep runs modest.</p></div></li>
              </ol>
            </div>
          </div>
        </section>
      </main>

      <footer className="closing site-foot" id="contact" aria-labelledby="close-h">
        <div className="wrap">
          <div className="cta-panel">
            {/* the fluted-glass ground of the step cards, turned diagonal; it fades out behind the words */}
            <div className="cta-panel__glass" aria-hidden="true"><div className="cta-panel__flutes" data-fx="fluted-glass" data-fx-seed="58"></div></div>
            <div className="cta-panel__text">
              <h2 id="close-h">Send your first campaign today</h2>
              <p className="t-lead muted">Free. Sign in with the account your admin made for you, add your CV and start sending.</p>
              <ul className="cta-panel__facts"><li>No card</li><li>Your own inbox</li><li>Follow-ups in the same thread</li></ul>
            </div>
            <div className="cta-panel__actions">
              <a className="btn btn--primary btn--xl" href="/login">Try now<svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path className="m-arrow__stem" d="M1 6h8" /><path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" /></svg></a>
              <a className="btn btn--secondary btn--xl" href="#how">See the 3 steps</a>
            </div>
          </div>

          <div className="site-foot__grid">
            <div className="site-foot__brand">
              <a className="nav__logo" href="#top"><span className="mark" data-mark="stack" aria-hidden="true"></span>Job Outreach</a>
              <p>Finds recruiter emails in LinkedIn hiring posts and sends your CV from your own inbox, on a schedule.</p>
              <p className="site-foot__works"><img src="/assets/icons/linkedin.svg" alt="" width="16" height="16" /><img src="/assets/icons/gmail.svg" alt="" width="16" height="16" /><img src="/assets/icons/docx.svg" alt="" width="16" height="16" /><span>Works with LinkedIn, Gmail and any SMTP account</span></p>
            </div>
            <nav className="site-foot__col" aria-label="Product"><h3>Product</h3><ul><li><a href="#product">Sent list</a></li><li><a href="#how">How it works</a></li><li><a href="#free">Pricing</a></li></ul></nav>
            <nav className="site-foot__col" aria-label="Trust"><h3>Trust</h3><ul><li><a href="#security">Security</a></li><li><a href="#faq">Questions</a></li></ul></nav>
            <nav className="site-foot__col" aria-label="Account"><h3>Account</h3><ul><li><a href="/login">Sign in</a></li><li><a href="/login">Dashboard</a></li></ul></nav>
          </div>

          <div className="site-foot__legal">
            <span>&copy; 2026 Job Outreach</span>
            <span>Product names and logos are trademarks of their owners</span>
            <a className="site-foot__top" href="#top">Back to top <i aria-hidden="true">↑</i></a>
          </div>
        </div>
        {/* the wordmark, cut by the bottom edge, with the blue sticker word as in the hero */}
        <div className="site-foot__mega" aria-hidden="true"><span className="hstage__sticker"><span>job</span></span>Outreach</div>
      </footer>
    </>
  );
}

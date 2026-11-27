/* eslint-disable @next/next/no-img-element -- small SVG icons the kit scripts find by data-icon; next/image adds nothing here */
import type { CSSProperties } from "react";
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
        <section className="hero hero--collage" data-enter="" aria-labelledby="hero-h">
          <div className="wrap"><div className="hero-text grid hero__grid">
            <div className="hero__text span-5">
              <p className="hero__badge"><span className="hero__badge-dot" aria-hidden="true"></span>Free · Chrome extension and dashboard</p>
              <h1 id="hero-h">Recruiter email outreach for job seekers</h1>
              <p className="hero__lead">Job Outreach finds recruiter emails in LinkedIn hiring posts and sends your CV from your own Gmail, on a schedule, with follow-ups in the same thread.</p>
              <div className="btn-row"><a className="btn btn--primary" href="/login">Try now<svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path className="m-arrow__stem" d="M1 6h8" /><path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" /></svg></a><a className="btn btn--secondary" href="#how">See the 3 steps</a></div>
              <p className="hero__proof">Free to use. Checks your inbox for replies every 10 minutes.</p>
              <p className="hero__works"><span>Works with</span><img src="/assets/icons/linkedin.svg" alt="" width="18" height="18" />LinkedIn<img src="/assets/icons/gmail.svg" alt="" width="18" height="18" />Gmail<span>and any SMTP account</span></p>
            </div>
            <div className="hero__art span-6 start-7" data-fx="silk-folds" data-fx-seed="14" role="img" aria-label="The Job Outreach contacts list with recruiters found on LinkedIn, and a campaign that has started sending">
              <div className="ly-piece ly-piece--main d-win" aria-hidden="true">
                <div className="d-win__bar"><span className="d-win__dots"><i></i><i></i><i></i></span><span>Job Outreach · Contacts</span></div>
                <div className="d-win__body">
                  <div className="d-side">
                    <span><i></i>Dashboard</span><span className="is-on"><i></i>Contacts</span><span><i></i>Campaigns</span><span><i></i>Sent</span><span><i></i>Follow-ups</span>
                    <span className="d-side__label">Library</span><span><i></i>Templates</span><span><i></i>Resumes</span>
                  </div>
                  <div className="d-main">
                    <div className="d-main__head"><h4>Contacts</h4><span className="d-btn">Email 12</span></div>
                    <div className="d-tabs"><span className="is-on">All 318</span><span>New 142</span><span>Replied 7</span></div>
                    <div className="d-rows">
                      <div className="d-row"><span className="d-avatar">MI</span><div><b>Meera Iyer</b><small>Fintrail · React developer post</small></div><span className="num">2d</span><span className="d-chip">New</span></div>
                      <div className="d-row"><span className="d-avatar">JW</span><div><b>Jonas Weber</b><small>Orbitly · Frontend, remote</small></div><span className="num">2d</span><span className="d-chip">Queued</span></div>
                      <div className="d-row"><span className="d-avatar">RS</span><div><b>Ritika Sharma</b><small>Cloudnest · Node.js roles</small></div><span className="num">3d</span><span className="d-chip">Sent</span></div>
                      <div className="d-row"><span className="d-avatar">DO</span><div><b>Daniel Osei</b><small>Paylane · Hiring 4 engineers</small></div><span className="num">4d</span><span className="d-chip d-chip--low">Replied</span></div>
                      <div className="d-row"><span className="d-avatar">AK</span><div><b>Anna Kowalski</b><small>Brightdesk · Full-stack</small></div><span className="num">5d</span><span className="d-chip">Sent</span></div>
                      <div className="d-row"><span className="d-avatar">VN</span><div><b>Vikram Nair</b><small>Tessera · TypeScript post</small></div><span className="num">6d</span><span className="d-chip">New</span></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ly-piece ly-piece--note d-card" aria-hidden="true" data-ly-steps="700">
                <div className="d-card__row"><h5>Campaign: React roles</h5><span className="d-chip" data-step="" data-step-at="4">Sending</span></div>
                <div className="d-note__line" data-step=""><i>✓</i><span><b>142 new contacts</b>, 9 already emailed skipped</span></div>
                <div className="d-note__line" data-step=""><i>✓</i><span>Random gap of <b>2 to 6 minutes</b></span></div>
                <div className="d-note__line" data-step=""><i>✓</i><span>Follow-up after <b>3 days</b>, up to 2 times</span></div>
              </div>
            </div>
          </div></div>
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
            <dl className="grid free-facts">
              <div className="span-4 free-card"><dt>Price</dt><dd><b>$0</b>Every feature, no card to add</dd></div>
              <div className="span-4 free-card"><dt>Sends from</dt><dd><b>Your inbox</b>Your Gmail or any SMTP account</dd></div>
              <div className="span-4 free-card"><dt>Daily limit</dt><dd><b>~500</b>Your provider’s own limit on Gmail</dd></div>
            </dl>
          </div>
        </section>
      
        <section className="section ground-inverse" id="security" aria-labelledby="security-h">
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
            <a href="#top">Back to top ↑</a>
          </div>
        </div>
      </footer>
    </>
  );
}

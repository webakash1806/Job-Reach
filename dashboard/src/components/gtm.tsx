import Script from "next/script";

// Google Tag Manager. Loaded on the public pages only (landing and login): the dashboard shows
// contacts and emails, and its URLs carry record ids that should not go to Google.
// Off in development so local testing does not count as visits. The tag starts on the first scroll, tap,
// key or pointer move, or 8 s after load: its scripts never compete with the first seconds on a phone.
// ponytail: a visitor who leaves within 8 s without touching the page is not counted.
const GTM_ID = "GTM-NJWRK34X";

export function GoogleTagManager() {
  if (process.env.NODE_ENV !== "production") return null;
  return (
    <>
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){var go=function(){if(w.__gtm)return;w.__gtm=1;E.forEach(function(e){w.removeEventListener(e,go)});
w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);};
var E=['scroll','pointerdown','keydown','pointermove','touchstart'];E.forEach(function(e){w.addEventListener(e,go,{once:true,passive:true})});
var t=function(){setTimeout(go,8000)};if(d.readyState==='complete')t();else w.addEventListener('load',t,{once:true});
})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
      {/* no <noscript> iframe: with scripts on, the browser keeps its content as text, which React reads as
          a hydration mismatch (error #418); GA4 cannot track visitors without scripts anyway */}
    </>
  );
}

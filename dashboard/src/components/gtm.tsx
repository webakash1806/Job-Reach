import Script from "next/script";

// Google Tag Manager. Loaded on the public pages only (landing and login): the dashboard shows
// contacts and emails, and its URLs carry record ids that should not go to Google.
// Off in development so local testing does not count as visits.
const GTM_ID = "GTM-NJWRK34X";

export function GoogleTagManager() {
  if (process.env.NODE_ENV !== "production") return null;
  return (
    <>
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
      <noscript>
        <iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} />
      </noscript>
    </>
  );
}

import React from 'react'
import { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'

export async function getServerSideProps(context: any) {
  const path = context.resolvedUrl
  let ogTitle

  if (path === '/earn') {
    ogTitle = 'Earn | Clober DEX'
  } else {
    ogTitle = 'Trade | Clober DEX'
  }

  return {
    props: { ogTitle },
  }
}

export default function Document({ ogTitle }: { ogTitle: string }) {
  return (
    <Html lang="en">
      <Head>
        <meta
          name="description"
          content="Join Clober DEX and Start Trading on a Fully On-chain Order Book. Eliminate Counterparty Risk. Place Limit Orders. Low Transaction Costs Powered by LOBSTER."
        />

        {/* <!-- Facebook Meta Tags --> */}
        <meta property="og:url" content="https://app.clober.io/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={ogTitle} />
        <meta
          property="og:description"
          content="Fully On-chain Order Book for EVM"
        />
        <meta
          property="og:image"
          content="https://app.clober.io/twitter-card-v2.png"
        />
        {/* <!-- Twitter Meta Tags --> */}
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:site" content="@CloberDEX" />
        <meta property="twitter:title" content={ogTitle} />
        <meta
          property="twitter:description"
          content="Fully On-chain Order Book for EVM."
        />
        <meta
          name="twitter:image"
          content="https://app.clober.io/twitter-card.png"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TE8CSB6JP2"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-TE8CSB6JP2');
        `}
        </Script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

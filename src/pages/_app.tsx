import type { AppProps } from 'next/app'
import Link from 'next/link'
import '../styles/globals.css'
import '../styles/cargo-fitter.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <nav style={{ 
        padding: '1rem', 
        backgroundColor: '#667eea',
        color: 'white',
        marginBottom: '2rem',
        display: 'flex',
        gap: '2rem'
      }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>🏠 Home</Link>
      </nav>
      
      <Component {...pageProps} />
    </>
  )
}
import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from '@/context/CartContext'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata = {
  title: 'Northern Blue',
  description: "Plus-size women's clothing. Love your clothes, love our earth.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <CartProvider>
          {children}
          <Toaster position="bottom-right" />
        </CartProvider>
      </body>
    </html>
  )
}

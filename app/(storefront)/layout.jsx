import AnnouncementBar from '@/components/AnnouncementBar'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CartDrawer from '@/storefront/CartDrawer'

export default function StorefrontLayout({ children }) {
  return (
    <>
      <div className="sticky top-0 z-50">
        <AnnouncementBar />
        <Navbar />
      </div>
      <main>{children}</main>
      <Footer />
      <CartDrawer />
    </>
  )
}

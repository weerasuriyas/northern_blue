import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import ContactForm from './components/ContactForm'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <ContactForm />
      </main>
      <Footer />
    </>
  )
}

export default App

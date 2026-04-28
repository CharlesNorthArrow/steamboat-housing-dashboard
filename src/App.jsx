import { useState, useEffect, useRef } from 'react'
import SkipNav from './components/layout/SkipNav'
import Header from './components/layout/Header'
import TabNav from './components/layout/TabNav'
import DataBanner from './components/layout/DataBanner'
import Footer from './components/layout/Footer'
import TrailForward from './pages/TrailForward'
import Affordability from './pages/Affordability'
import Pipeline from './pages/Pipeline'
import Policies from './pages/Policies'

const TABS = ['trail-forward', 'affordability', 'pipeline', 'policies']

export default function App() {
  const [activeTab, setActiveTab] = useState('trail-forward')
  const mainRef = useRef(null)

  function handleTabChange(tabId) {
    setActiveTab(tabId)
    // Move focus to main content area after tab switch
    requestAnimationFrame(() => {
      const panel = document.getElementById(`panel-${tabId}`)
      if (panel) panel.focus()
    })
  }

  // Sync hash for deep-linking
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (TABS.includes(hash)) setActiveTab(hash)
  }, [])

  useEffect(() => {
    window.history.replaceState(null, '', `#${activeTab}`)
  }, [activeTab])

  return (
    <>
      <SkipNav />
      <Header />
      <TabNav activeTab={activeTab} onTabChange={handleTabChange} />
      <DataBanner />

      <main id="main-content" ref={mainRef} tabIndex={-1} style={{ outline: 'none' }}>
        <div hidden={activeTab !== 'trail-forward'}>
          <TrailForward />
        </div>
        <div hidden={activeTab !== 'affordability'}>
          <Affordability />
        </div>
        <div hidden={activeTab !== 'pipeline'}>
          <Pipeline />
        </div>
        <div hidden={activeTab !== 'policies'}>
          <Policies />
        </div>
      </main>

      <Footer activeTab={activeTab} onTabChange={handleTabChange} />
    </>
  )
}

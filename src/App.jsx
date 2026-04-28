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

const TAB_IDS = ['trail-forward', 'affordability', 'pipeline', 'policies']

export default function App() {
  const [activeTab, setActiveTab] = useState('trail-forward')
  const mainRef = useRef(null)

  function handleTabChange(tabId) {
    setActiveTab(tabId)
    requestAnimationFrame(() => {
      const panel = document.getElementById(`panel-${tabId}`)
      if (panel) panel.focus()
    })
  }

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (TAB_IDS.includes(hash)) setActiveTab(hash)
  }, [])

  useEffect(() => {
    window.history.replaceState(null, '', `#${activeTab}`)
  }, [activeTab])

  return (
    <>
      <SkipNav />
      <Header />
      <DataBanner />

      <div className="app-layout">
        <TabNav activeTab={activeTab} onTabChange={handleTabChange} />

        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className="content-col"
        >
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
      </div>

      <Footer activeTab={activeTab} onTabChange={handleTabChange} />
    </>
  )
}

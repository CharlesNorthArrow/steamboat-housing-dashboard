import { useState, useEffect, useRef } from 'react'
import SkipNav from './components/layout/SkipNav'
import Header from './components/layout/Header'
import TabNav from './components/layout/TabNav'
import Footer from './components/layout/Footer'
import TrailForward from './pages/TrailForward'
import Affordability from './pages/Affordability'
import Pipeline from './pages/Pipeline'
import Policies from './pages/Policies'

const TAB_IDS = ['trail-forward', 'affordability', 'pipeline', 'policies']

export default function App() {
  const [activeTab, setActiveTab] = useState('trail-forward')
  const [printAll, setPrintAll] = useState(false)
  const mainRef = useRef(null)

  function handleTabChange(tabId) {
    setActiveTab(tabId)
    window.scrollTo({ top: 0, behavior: 'instant' })
    requestAnimationFrame(() => {
      const panel = document.getElementById(`panel-${tabId}`)
      if (panel) panel.focus({ preventScroll: true })
    })
  }

  function handleExportAll() {
    setPrintAll(true)
    window.onafterprint = () => {
      setPrintAll(false)
      window.onafterprint = null
    }
    // Small delay lets React render all panels before print dialog opens
    setTimeout(() => window.print(), 150)
  }

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    const hash = window.location.hash.replace('#', '')
    if (TAB_IDS.includes(hash)) setActiveTab(hash)
  }, [])

  useEffect(() => {
    window.history.replaceState(null, '', `#${activeTab}`)
  }, [activeTab])

  return (
    <>
      <SkipNav />
      <Header activeTab={activeTab} />

      <div className="app-layout">
        <TabNav activeTab={activeTab} onTabChange={handleTabChange} onExportAll={handleExportAll} />

        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className="content-col"
        >
          <div className="tab-panel-wrapper" hidden={!printAll && activeTab !== 'trail-forward'}>
            <TrailForward />
          </div>
          <div className="tab-panel-wrapper" hidden={!printAll && activeTab !== 'affordability'}>
            <Affordability />
          </div>
          <div className="tab-panel-wrapper" hidden={!printAll && activeTab !== 'pipeline'}>
            <Pipeline />
          </div>
          <div className="tab-panel-wrapper" hidden={!printAll && activeTab !== 'policies'}>
            <Policies />
          </div>
        </main>
      </div>

      <Footer activeTab={activeTab} onTabChange={handleTabChange} />
    </>
  )
}

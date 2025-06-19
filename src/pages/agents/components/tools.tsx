import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import Files from './files'
import GenerateKPIs from './generate-kpis'
import Checkpoints from './checkpoints'
import Shared from './shared'
import type { KPI } from './generate-kpis'

export default function Tools() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const baseClasses =
    'inline font-semibold px-10 py-3 border-b-3 cursor-pointer'
  const [tab, setTab] = useState(0)
  const [kpis, setKpis] = useState<KPI[]>([])
  
  useEffect(() => {
    setTab(0)
    setKpis([])
  }, [sessionId])

  return (
    <div className='h-[90vh] flex flex-col'>
      <div className='border-b py-3'>
        <div
          className={`${baseClasses} ${
            tab === 0 && 'border-gray-800 dark:border-white'
          }`}
          onClick={() => setTab(0)}
        >
          Files
        </div>
        <div
          className={`${baseClasses} ${
            tab === 1 && 'border-gray-800 dark:border-white'
          }`}
          onClick={() => setTab(1)}
        >
          Goals
        </div>
        <div
          className={`${baseClasses} ${
            tab === 2 && 'border-gray-800 dark:border-white'
          }`}
          onClick={() => setTab(2)}
        >
          Checkpoints
        </div>
        <div
          className={`${baseClasses} ${
            tab === 3 && 'border-gray-800 dark:border-white'
          }`}
          onClick={() => setTab(3)}
        >
          Shared
        </div>
      </div>

      <div className='flex-1 overflow-auto'>
        {tab === 0 && <Files />}
        {tab === 1 && <GenerateKPIs kpis={kpis} setKpis={setKpis} />}
        {tab === 2 && <Checkpoints />}
        {tab === 3 && <Shared />}
      </div>
    </div>
  )
}

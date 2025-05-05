import { useState } from 'react'
import Files from './files'
import GenerateKPIs from './generate-kpis'

function Tools() {
  const [tab, setTab] = useState(0)

  return (
    <div className='h-[90vh]'>
      <div className='border-b py-3'>
        <div
          className={`inline font-semibold px-10 py-3 border-b-3 cursor-pointer ${
            tab === 0 && 'border-gray-800 dark:border-white'
          }`}
          onClick={() => setTab(0)}
        >
          Files
        </div>
        <div
          className={`inline font-semibold px-10 py-3 border-b-3 cursor-pointer ${
            tab === 1 && 'border-gray-800 dark:border-white'
          }`}
          onClick={() => setTab(1)}
        >
          KPI Generator
        </div>
      </div>

      {tab === 0 && <Files />}
      {tab === 1 && <GenerateKPIs />}
    </div>
  )
}

export default Tools

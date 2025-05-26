import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import Files from './files'
import GenerateKPIs from './generate-kpis'
import Checkpoints from './checkpoints'

export default function Tools() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const baseClasses =
    'inline font-semibold px-10 py-3 border-b-3 cursor-pointer'
  const [tab, setTab] = useState(0)
  
  useEffect(() => {
    setTab(0)
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
      </div>

      <div className='flex-1 overflow-auto'>
        {tab === 0 && <Files />}
        {tab === 1 && <GenerateKPIs />}
        {tab === 2 && <Checkpoints />}
      </div>
    </div>
  )
}

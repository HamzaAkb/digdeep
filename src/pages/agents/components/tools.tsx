import Files from './files'

function Tools() {
  return (
    <div className='h-[90vh]'>
      <div className='border-b py-3'>
        <div className='inline font-semibold px-10 py-3 border-b-3 border-gray-800 dark:border-white '>
          Files
        </div>
        <div className='inline font-semibold px-10 py-3'>KPI Generator</div>
      </div>

      <Files />
    </div>
  )
}

export default Tools

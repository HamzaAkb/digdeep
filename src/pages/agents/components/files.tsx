import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Download } from 'lucide-react'

interface FileMeta {
  name: string
  size: number
  modified: number
}

const SESSION_ID = '111f8bc2-648e-4854-a9bc-23035f5260d0'
const BASE_URL = `http://127.0.0.1:8000/api/v1/session/${SESSION_ID}/outputs`
const ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYXNpaDk4IiwiZXhwIjoxNzQ2Mzc2MDkzLCJ0b2tlbl90eXBlIjoiYWNjZXNzIn0.GS6xzkG2NYlMmbxT7tIowgBK5ZhwT4iyCFF_wvXkN8w' // your full ASCII token

export default function Files() {
  const [files, setFiles] = useState<FileMeta[]>([])
  const [selected, setSelected] = useState<FileMeta | null>(null)
  const [textContent, setTextContent] = useState<string>('')
  const [imgUrl, setImgUrl] = useState<string>('')
  const [csvData, setCsvData] = useState<string[][]>([])
  const sinceRef = useRef<number>(1746361047)

  // Poll for new files
  useEffect(() => {
    let cancelled = false
    const poll = async () => {
      const url = `${BASE_URL}?since=${sinceRef.current}`
      try {
        const res = await fetch(url, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
        })
        if (!res.ok) throw new Error(res.statusText)
        const json = await res.json()
        const newFiles: FileMeta[] = Array.isArray(json.files) ? json.files : []
        if (cancelled || newFiles.length === 0) return
        setFiles((prev) => [...prev, ...newFiles])
        const maxTs = Math.max(
          ...newFiles.map((f) => f.modified || sinceRef.current)
        )
        sinceRef.current = maxTs
      } catch (err) {
        console.error('Polling error:', err)
      }
    }
    poll()
    const id = setInterval(poll, 2000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  // Fetch selected file contents
  useEffect(() => {
    if (!selected) return
    setTextContent('')
    setImgUrl('')
    setCsvData([])

    const fetchFile = async () => {
      const url = `${BASE_URL}/${encodeURIComponent(selected.name)}`
      try {
        const res = await fetch(url, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
        })
        if (!res.ok) throw new Error(res.statusText)

        // CSV
        if (selected.name.toLowerCase().endsWith('.csv')) {
          const txt = await res.text()
          const rows = txt
            .trim()
            .split('\n')
            .map((line) => line.split(','))
          setCsvData(rows)
        }
        // Image
        else if (/\.(png|jpe?g|gif)$/i.test(selected.name)) {
          const blob = await res.blob()
          setImgUrl(URL.createObjectURL(blob))
        }
        // Fallback to markdown/text
        else {
          const txt = await res.text()
          setTextContent(txt)
        }
      } catch (err) {
        console.error('Fetch file error:', err)
      }
    }

    fetchFile()
    return () => {
      if (imgUrl) URL.revokeObjectURL(imgUrl)
    }
  }, [selected])

  // Download handler
  const downloadFile = async () => {
    if (!selected) return
    const url = `${BASE_URL}/${encodeURIComponent(selected.name)}`
    try {
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      })
      if (!res.ok) throw new Error(res.statusText)
      const blob = await res.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = selected.name
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  return (
    <div className='h-full flex'>
      {/* Sidebar */}
      <aside className='w-[180px] border-r p-4 overflow-y-auto'>
        <ul className='space-y-1 text-sm'>
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className={`truncate cursor-pointer px-2 py-1 rounded ${
                selected?.name === f.name ? 'bg-blue-100 dark:bg-blue-500' : ''
              }`}
              onClick={() => setSelected(f)}
            >
              📄 {f.name}
            </li>
          ))}
        </ul>
      </aside>

      {/* Content Display */}
      <main className='flex-1 p-4 overflow-y-auto'>
        {!selected ? (
          <p className='text-gray-500'>Select a file to view its contents.</p>
        ) : (
          <>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='font-semibold'>{selected.name}</h3>
              <Download
                className='cursor-pointer hover:text-blue-600'
                size={20}
                onClick={downloadFile}
              />
            </div>

            {/* CSV Table */}
            {csvData.length > 0 ? (
              <div className='overflow-auto'>
                <table className='min-w-full border-collapse text-sm'>
                  <thead>
                    <tr>
                      {csvData[0].map((col, j) => (
                        <th
                          key={j}
                          className='border px-2 py-1 font-medium text-left'
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(1).map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} className='border px-2 py-1'>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : imgUrl ? (
              <img src={imgUrl} alt={selected.name} className='max-w-full' />
            ) : (
              <div className='prose max-w-none'>
                <ReactMarkdown>{textContent || 'Loading…'}</ReactMarkdown>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

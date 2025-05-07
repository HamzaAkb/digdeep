import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import ReactMarkdown from 'react-markdown'
import { Download } from 'lucide-react'
import api from '@/lib/api'

interface FileMeta {
  name: string
  size: number
  modified: number
}

export default function Files() {
  const { sessionId } = useParams<{ sessionId: string }>()

  const [files, setFiles] = useState<FileMeta[]>([])
  const [selected, setSelected] = useState<FileMeta | null>(null)
  const [textContent, setTextContent] = useState<string>('')
  const [imgUrl, setImgUrl] = useState<string>('')
  const [csvData, setCsvData] = useState<string[][]>([])
  const sinceRef = useRef<number>(0)

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      try {
        const res = await api.get<{ files: FileMeta[] }>(
          `/session/${sessionId}/outputs`,
          { params: { since: sinceRef.current } }
        )
        const newFiles = res.data.files
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
    const id = setInterval(poll, 10_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [sessionId])

  useEffect(() => {
    if (!selected) return
    setTextContent('')
    setImgUrl('')
    setCsvData([])

    let objectUrl: string | null = null

    const fetchFile = async () => {
      try {
        const path = `/session/${sessionId}/outputs/${encodeURIComponent(
          selected.name
        )}`

        if (selected.name.toLowerCase().endsWith('.csv')) {
          const res = await api.get<string>(path, { responseType: 'text' })
          const rows = res.data
            .trim()
            .split('\n')
            .map((line) => line.split(','))
          setCsvData(rows)
        }

        else if (/\.(png|jpe?g|gif)$/i.test(selected.name)) {
          const res = await api.get<Blob>(path, { responseType: 'blob' })
          objectUrl = URL.createObjectURL(res.data)
          setImgUrl(objectUrl)
        }

        else {
          const res = await api.get<string>(path, { responseType: 'text' })
          setTextContent(res.data)
        }
      } catch (err) {
        console.error('Fetch file error:', err)
      }
    }

    fetchFile()
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [selected, sessionId])

  const downloadFile = async () => {
    if (!selected) return
    try {
      const res = await api.get<Blob>(
        `/session/${sessionId}/outputs/${encodeURIComponent(selected.name)}`,
        { responseType: 'blob' }
      )
      const downloadUrl = URL.createObjectURL(res.data)
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

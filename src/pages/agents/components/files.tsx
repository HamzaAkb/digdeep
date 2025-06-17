import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import ReactMarkdown from 'react-markdown'
import { Download, Share2, Mail } from 'lucide-react'
import api from '@/lib/api'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  FileListSkeleton,
  ContentSkeleton,
  TableSkeleton,
} from '@/components/skeletons'
import remarkGfm from 'remark-gfm'
import { FileShareDialog } from './file-share-dialog'
import { FileEmailDialog } from './file-email-dialog'

interface FilesProps {
  isSharedSession?: boolean
  visitorId?: string
}

interface FileMeta {
  name: string
  size: number
  modified: number
}

export default function Files({ isSharedSession = false, visitorId }: FilesProps) {
  const { sessionId, shareToken } = useParams<{ sessionId: string; shareToken: string }>()

  const [files, setFiles] = useState<FileMeta[]>([])
  const [selected, setSelected] = useState<FileMeta | null>(null)
  const [textContent, setTextContent] = useState<string>('')
  const [imgUrl, setImgUrl] = useState<string>('')
  const [csvData, setCsvData] = useState<string[][]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isContentLoading, setIsContentLoading] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const sinceRef = useRef<number>(0)

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      try {
        let res
        if (isSharedSession && visitorId) {
          res = await api.get<{ files: FileMeta[] }>(
            `/public/${shareToken}/files/${visitorId}`,
            { params: { since: sinceRef.current } }
          )
        } else {
          res = await api.get<{ files: FileMeta[] }>(
            `/session/${sessionId}/outputs`,
            { params: { since: sinceRef.current } }
          )
        }
        const newFiles = res.data.files
        if (cancelled || newFiles.length === 0) return

        setFiles((prev) => {
          const fileMap = new Map(prev.map(f => [f.name, f]))
          
          const actuallyNewFiles: FileMeta[] = []
          
          newFiles.forEach(file => {
            const existingFile = fileMap.get(file.name)
            if (!existingFile) {
              actuallyNewFiles.push(file)
            }
            fileMap.set(file.name, file)
          })
          
          const sortedFiles = Array.from(fileMap.values())
            .sort((a, b) => (b.modified || 0) - (a.modified || 0))
          
          if (actuallyNewFiles.length > 0 && !selected) {
            const mostRecentFile = sortedFiles[0]
            setSelected(mostRecentFile)
          }
          
          return sortedFiles
        })

        const maxTs = Math.max(
          ...newFiles.map((f) => f.modified || sinceRef.current)
        )
        sinceRef.current = maxTs
        setIsLoading(false)
      } catch (err) {
        console.error('Polling error:', err)
        setIsLoading(false)
      }
    }

    poll()
    const id = setInterval(poll, 10_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [sessionId, shareToken])

  useEffect(() => {
    if (!selected) return
    setTextContent('')
    setImgUrl('')
    setCsvData([])
    setIsContentLoading(true)

    let objectUrl: string | null = null

    const fetchFile = async () => {
      try {
        let path
        if (isSharedSession && shareToken && visitorId) {
          path = `/public/${shareToken}/files/${visitorId}/${encodeURIComponent(selected.name)}`
        } else {
          path = `/session/${sessionId}/outputs/${encodeURIComponent(selected.name)}`
        }

        if (selected.name.toLowerCase().endsWith('.csv')) {
          const res = await api.get<string>(path, { responseType: 'text' })
          const rows = res.data
            .trim()
            .split('\n')
            .map((line) => line.split(','))
          setCsvData(rows)
        } else if (/(png|jpe?g|gif)$/i.test(selected.name)) {
          const res = await api.get<Blob>(path, { responseType: 'blob' })
          objectUrl = URL.createObjectURL(res.data)
          setImgUrl(objectUrl)
        } else {
          const res = await api.get<string>(path, { responseType: 'text' })
          setTextContent(res.data)
        }
      } catch (err) {
        console.error('Fetch file error:', err)
      } finally {
        setIsContentLoading(false)
      }
    }

    fetchFile()
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [selected?.name, sessionId, isSharedSession, shareToken, visitorId])

  const downloadFile = async () => {
    if (!selected) return
    try {
      let path
      if (isSharedSession && shareToken && visitorId) {
        path = `/public/${shareToken}/files/${visitorId}/${encodeURIComponent(selected.name)}`
      } else {
        path = `/session/${sessionId}/outputs/${encodeURIComponent(selected.name)}`
      }
      
      const res = await api.get<Blob>(path, { responseType: 'blob' })
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
        <TooltipProvider>
          {isLoading ? (
            <FileListSkeleton />
          ) : (
            <ul className='space-y-1 text-sm'>
              {files.map((f, i) => (
                <Tooltip key={`${f.name}-${i}`}>
                  <TooltipTrigger asChild>
                    <li
                      className={`truncate cursor-pointer px-2 py-1 rounded ${
                        selected?.name === f.name
                          ? 'bg-blue-100 dark:bg-blue-500'
                          : ''
                      }`}
                      onClick={() => setSelected(f)}
                    >
                      📄 {f.name}
                    </li>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{f.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </ul>
          )}
        </TooltipProvider>
      </aside>

      <main className='flex-1 p-4 overflow-y-auto'>
        {!selected ? (
          <p className='text-gray-500'>Select a file to view its contents.</p>
        ) : (
          <>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='font-semibold'>{selected.name}</h3>
              <div className='flex items-center gap-4'>
                <Mail
                  className='cursor-pointer hover:text-blue-600'
                  size={20}
                  onClick={() => setEmailDialogOpen(true)}
                />
                <Share2
                  className='cursor-pointer hover:text-blue-600'
                  size={20}
                  onClick={() => setShareDialogOpen(true)}
                />
                <Download
                  className='cursor-pointer hover:text-blue-600'
                  size={20}
                  onClick={downloadFile}
                />
              </div>
            </div>

            {isContentLoading ? (
              selected.name.toLowerCase().endsWith('.csv') ? (
                <TableSkeleton />
              ) : (
                <ContentSkeleton />
              )
            ) : csvData.length > 0 ? (
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
              <div className='prose dark:prose-invert max-w-none'>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    table: ({node, ...props}) => <table className="min-w-full border-collapse mb-4" {...props} />,
                    th: ({node, ...props}) => <th className="border px-4 py-2 text-left" {...props} />,
                    td: ({node, ...props}) => <td className="border px-4 py-2" {...props} />,
                  }}
                >
                  {textContent || 'No content available'}
                </ReactMarkdown>
              </div>
            )}
          </>
        )}
      </main>

      {selected && (
        <>
          <FileShareDialog
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            sessionId={sessionId!}
            fileName={selected.name}
          />
          <FileEmailDialog
            open={emailDialogOpen}
            onOpenChange={setEmailDialogOpen}
            sessionId={sessionId!}
            fileName={selected.name}
          />
        </>
      )}
    </div>
  )
}

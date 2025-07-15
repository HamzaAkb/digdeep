

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { Skeleton } from './ui/skeleton'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { List, File, FileText, FileJson, FileCode, Image as ImageIcon, Sheet, FileIcon } from 'lucide-react';
import { apiFetch, fetchFileContent } from '@/lib/api'
import Papa from 'papaparse'
import { FixedSizeGrid as Grid } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'

interface FileMeta {
  name: string
}

interface FileViewerPanelProps {
  sessionId?: string
  shareToken?: string
  visitorId?: string
  selectedFile: string | null
  onFileSelect: (fileName: string | null) => void
}

const getFiles = async ({
  sessionId,
  shareToken,
  visitorId,
}: Omit<FileViewerPanelProps, 'selectedFile' | 'onFileSelect'>) => {
  let path
  if (shareToken && visitorId) {
    path = `/public/${shareToken}/files/${visitorId}`
  } else if (sessionId) {
    path = `/session/${sessionId}/outputs`
  } else {
    throw new Error('Session ID or Share Token must be provided.')
  }
  return apiFetch(path)
}

const getIconForFile = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return { Icon: ImageIcon, color: 'text-blue-500' }
    case 'md':
    case 'markdown':
      return { Icon: FileText, color: 'text-indigo-500' }
    case 'csv':
      return { Icon: Sheet, color: 'text-green-600' }
    case 'html':
      return { Icon: FileCode, color: 'text-orange-500' }
    case 'json':
      return { Icon: FileJson, color: 'text-yellow-500' }
    default:
      return { Icon: File, color: 'text-muted-foreground' }
  }
}

export function FileViewerPanel({
  sessionId,
  shareToken,
  visitorId,
  selectedFile,
  onFileSelect,
}: FileViewerPanelProps) {
  const [textContent, setTextContent] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [csvData, setCsvData] = useState<string[][]>([])

  const queryKey = shareToken
    ? ['files', shareToken, visitorId]
    : ['files', sessionId]

  const filesQuery = useQuery({
    queryKey,
    queryFn: () => getFiles({ sessionId, shareToken, visitorId }),
    refetchInterval: 10000,
    enabled: !!(sessionId || (shareToken && visitorId)),
  })

  const fileContentQuery = useQuery({
    queryKey: [...queryKey, 'content', selectedFile],
    queryFn: async () => {
      if (!selectedFile) return null
      setImageUrl('')
      setTextContent('')
      setCsvData([])

      const res = await fetchFileContent(
        sessionId,
        shareToken,
        visitorId,
        selectedFile
      )
      const fileExtension = selectedFile.split('.').pop()?.toLowerCase()

      if (
        ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(
          fileExtension || ''
        )
      ) {
        const blob = await res.blob()
        setImageUrl(URL.createObjectURL(blob))
      } else if (fileExtension === 'csv') {
        const text = await res.text()
        Papa.parse(text, {
          complete: (results) => setCsvData(results.data as string[][]),
          skipEmptyLines: true,
        })
      } else {
        setTextContent(await res.text())
      }
      return true
    },
    enabled: !!selectedFile,
    retry: false,
  })

  useEffect(() => {
    if (filesQuery.data?.files) {
      const files = filesQuery.data.files ?? []
      if (!selectedFile && files.length > 0) {
        onFileSelect(files[0].name)
      }
    }
  }, [filesQuery.data, selectedFile, onFileSelect])

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  const renderContent = () => {
    if (fileContentQuery.isPending) {
      return (
        <div className='p-6 space-y-4 w-full'>
          <Skeleton className='h-8 w-1/2' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4' />
        </div>
      )
    }
    if (fileContentQuery.isError)
      return (
        <p className='p-6 text-destructive'>Could not load file content.</p>
      )
    if (imageUrl)
      return (
        <div className='p-6 h-full w-full flex items-center justify-center'>
          <img
            src={imageUrl}
            alt={selectedFile || 'image'}
            className='max-w-full max-h-full object-contain'
          />
        </div>
      )

    if (csvData.length > 0) {
      const columnCount = csvData[0]?.length ?? 0
      const rowCount = Math.max(csvData.length - 1, 0)
      return (
        <div className='h-full w-full'>
          <AutoSizer>
            {({ height, width }) => {
              const colWidth =
                columnCount > 0
                  ? Math.max(150, Math.floor(width / columnCount))
                  : 150
              const Cell = ({ columnIndex, rowIndex, style }: any) => (
                <div
                  className='box-border p-2 truncate border-r border-b border-border text-sm'
                  style={style}
                >
                  {csvData[rowIndex + 1]?.[columnIndex] ?? ''}
                </div>
              )
              return (
                <div>
                  <div
                    className='grid font-semibold bg-muted'
                    style={{
                      gridTemplateColumns: `repeat(${columnCount}, ${colWidth}px)`,
                    }}
                  >
                    {csvData[0].map((header, j) => (
                      <div
                        key={j}
                        className='box-border p-2 truncate text-sm font-bold border-r border-b border-border'
                        style={{ height: 36 }}
                      >
                        {header}
                      </div>
                    ))}
                  </div>
                  <Grid
                    columnCount={columnCount}
                    columnWidth={colWidth}
                    height={height - 36}
                    width={width}
                    rowCount={rowCount}
                    rowHeight={36}
                  >
                    {Cell}
                  </Grid>
                </div>
              )
            }}
          </AutoSizer>
        </div>
      )
    }

    if (textContent) {
      if (selectedFile?.endsWith('.html'))
        return (
          <iframe
            srcDoc={textContent}
            title={selectedFile}
            className='w-full h-full border-none'
            sandbox='allow-scripts'
          />
        )

      return (
        <div className='prose dark:prose-invert max-w-none h-full overflow-y-auto w-full p-6'>
          <ReactMarkdown
            children={textContent}
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ node, ...props }) => (
                <h1 className='text-3xl font-bold mt-6 mb-4' {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className='text-2xl font-bold mt-5 mb-3 border-b pb-2'
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3 className='text-xl font-semibold mt-4 mb-2' {...props} />
              ),
              p: ({ node, ...props }) => (
                <p
                  className='leading-7 [&:not(:first-child)]:mt-4'
                  {...props}
                />
              ),
              ul: ({ node, ...props }) => (
                <ul className='my-4 ml-6 list-disc [&>li]:mt-2' {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className='my-4 ml-6 list-decimal [&>li]:mt-2' {...props} />
              ),
              a: ({ node, ...props }) => (
                <a className='text-primary underline' {...props} />
              ),
              table: ({ node, ...props }) => (
                <div className='my-6 w-full overflow-y-auto'>
                  <Table {...props} />
                </div>
              ),
              thead: ({ node, ...props }) => <TableHeader {...props} />,
              tbody: ({ node, ...props }) => <TableBody {...props} />,
              tr: ({ node, ...props }) => <TableRow {...props} />,
              th: ({ node, ...props }) => (
                <TableHead className='font-bold' {...props} />
              ),
              td: ({ node, ...props }) => <TableCell {...props} />,
            }}
          />
        </div>
      )
    }

    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-muted-foreground'>
          Select a file to view its content
        </p>
      </div>
    )
  }

  return (
    <ResizablePanelGroup
      direction='horizontal'
      className='h-full border rounded-2xl'
    >
      <ResizablePanel
        defaultSize={25}
        minSize={15}
        className='p-4 bg-muted/20 flex flex-col'
      >
        <h3 className='font-semibold mb-4 flex items-center gap-2 shrink-0'>
          <List className='h-4 w-4' /> Files
        </h3>
        <div className='flex-1 overflow-y-auto'>
          {filesQuery.isPending ? (
            <div className='space-y-2'>
              <Skeleton className='h-8 w-full' />
              <Skeleton className='h-8 w-full' />
              <Skeleton className='h-8 w-full' />
            </div>
          ) : filesQuery.isError ? (
            <p className='text-destructive text-sm'>
              {filesQuery.error.message}
            </p>
          ) : (filesQuery.data?.files?.length ?? 0) === 0 ? (
            <p className='text-muted-foreground text-sm text-center pt-4'>
              No files found.
            </p>
          ) : (
            <ul className='space-y-1'>
              {filesQuery.data.files.map((file: FileMeta) => {
                const { Icon, color } = getIconForFile(file.name)
                return (
                  <li key={file.name}>
                    <button
                      onClick={() => onFileSelect(file.name)}
                      className={`w-full text-left text-sm p-2 rounded-md flex items-center gap-2 transition-colors ${selectedFile === file.name ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-accent'}`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${selectedFile === file.name ? '' : color}`}
                      />
                      <span className='truncate'>{file.name}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={75}
        minSize={30}
        className='flex flex-col bg-background'
      >
        {selectedFile ? (
          <main className='flex-1 overflow-auto'>{renderContent()}</main>
        ) : (
          <div className='flex-1 flex items-center justify-center'>
            <p className='text-muted-foreground'>
              No files available to display
            </p>
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

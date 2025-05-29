import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function DownloadPage() {
  const { fileId } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const downloadFile = async () => {
      try {
        const response = await api.get(
          `/files/shared_files/download/${fileId}`,
          {
            responseType: 'blob',
            headers: {
              accept: 'application/json',
            },
          }
        )

        if (response.data.type === 'application/json') {
          const reader = new FileReader()
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result as string)
              toast.error(errorData.detail || 'Failed to download file')
              navigate('/')
            } catch (e) {
              toast.error('Failed to download file')
              navigate('/')
            }
          }
          reader.readAsText(response.data)
          return
        }

        const fullDownloadUrl = `${response.config.baseURL}${response.config.url}`;
        

        const filename = 'downloaded-file';

        const a = document.createElement('a')
        a.href = fullDownloadUrl;
        a.download = filename; 
        document.body.appendChild(a)
        a.click()
        
        document.body.removeChild(a)
        
        navigate('/')
      } catch (error: any) {
        console.error('Download error:', error)

        const errorMessage = error.response?.data?.detail || 'Failed to download file'
        toast.error(errorMessage)
        navigate('/')
      } finally {
        setIsLoading(false)
      }
    }

    if (fileId) {
      downloadFile()
    }
  }, [fileId, navigate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return null
} 
 
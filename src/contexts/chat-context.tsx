import { createContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react'
import { useParams } from 'react-router'
import { ParsedBlock, parseEventStream } from '@/lib/utils'
import api from '@/lib/api'

const INITIAL_MESSAGE = {
  sender: 'user' as const,
  text: '👋 How can I help you today?',
  timestamp: new Date().toISOString(),
}

export type Message = {
  sender: 'user' | 'bot'
  text?: string
  parsed?: ParsedBlock
  timestamp: string
}

interface ChatContextType {
  messages: Message[]
  streaming: boolean
  sendTask: (task: string) => Promise<void>
  isSharedSession: boolean
  sendReportTask: (report_specs: string) => Promise<void>
}

interface ChatProviderProps {
  children: ReactNode
  isSharedSession?: boolean
  visitorId?: string
}

export const ChatContext = createContext<ChatContextType>({
  messages: [],
  streaming: false,
  sendTask: async () => {},
  isSharedSession: false,
  sendReportTask: async () => {},
})

export function ChatProvider({ 
  children, 
  isSharedSession = false, 
  visitorId, 
}: ChatProviderProps) {
  const { sessionId, shareToken } = useParams<{ sessionId: string, shareToken: string }>()
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [streaming, setStreaming] = useState(false)

  useEffect(() => {
    setMessages([INITIAL_MESSAGE])
    setStreaming(false)
  }, [sessionId])

  const streamingPostRequest = useCallback(
    async (
      endpointPath: string,
      payload: Record<string, unknown>,
      userText: string,
      isSharedSession?: boolean,
      visitorId?: string
    ) => {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: userText, timestamp: new Date().toISOString() },
      ])
      setStreaming(true)
      try {
        const url = `${import.meta.env.VITE_API_URL}${endpointPath}`
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }
        if (isSharedSession && visitorId) {
          headers['X-Visitor-Id'] = visitorId
        } else {
          const token = localStorage.getItem('access_token')
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }
        }
        const response = await api.post(url, payload, {
          headers,
          responseType: 'blob',
        })
        const reader = (response.data as Blob).stream().getReader()
        const decoder = new TextDecoder()
        let done = false
        while (!done) {
          const { value, done: readerDone } = await reader.read()
          done = readerDone
          if (value) {
            const chunk = decoder.decode(value, { stream: true })
            const events = parseEventStream(chunk)
            if (events.length) {
              events.forEach((parsed) =>
                setMessages((prev) => [
                  ...prev,
                  {
                    sender: 'bot',
                    parsed,
                    timestamp: new Date().toISOString(),
                  },
                ])
              )
            } else {
              setMessages((prev) => [
                ...prev,
                {
                  sender: 'bot',
                  text: chunk,
                  timestamp: new Date().toISOString(),
                },
              ])
            }
          }
        }
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: 'API failed: ' + (err?.message || 'Unknown error'), timestamp: new Date().toISOString() },
        ])
      } finally {
        setStreaming(false)
      }
    },
    []
  )

  const sendTask = useCallback(
    async (task: string) => {
      const currentSessionId = isSharedSession ? shareToken : sessionId
      if (!currentSessionId) return
      const endpoint = isSharedSession
        ? `/public/${currentSessionId}/run`
        : `/session/run_task_v2/${currentSessionId}`
      await streamingPostRequest(
        endpoint,
        { task, log_iter: 3, red_report: false },
        task,
        isSharedSession,
        visitorId
      )
    },
    [sessionId, shareToken, isSharedSession, visitorId, streamingPostRequest]
  )

  const sendReportTask = useCallback(
    async (report_specs: string) => {
      const REPORT_API_PATH = '/report/run_report_temp/03daeba5-098b-4f11-b9ce-b99155dd240b'
      const REPORT_HTML_TEMPLATE = `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <title>Simple Report</title>\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <!-- TailwindCSS CDN -->\n  <script src=\"https://cdn.tailwindcss.com\"></script>\n</head>\n<body class=\"bg-gray-100 min-h-screen\">\n  <div class=\"max-w-2xl mx-auto p-6\">\n    <header class=\"mb-8\">\n      <h1 class=\"text-2xl font-bold text-gray-900 mb-2\">Monthly Report</h1>\n      <p class=\"text-gray-600\">This is a summary of the latest key metrics for your data.</p>\n    </header>\n\n    <section class=\"mb-8\">\n      <h2 class=\"text-xl font-semibold text-gray-800 mb-3\">Key Results</h2>\n      <p class=\"text-gray-700 mb-4\">Below is a simple bar chart showing department revenue, followed by a summary table.</p>\n\n      <!-- Chart -->\n      <div class=\"bg-white rounded-lg p-4 mb-6 shadow\">\n        <canvas id=\"myChart\" height=\"250\"></canvas>\n      </div>\n\n      <!-- Table -->\n      <div class=\"bg-white rounded-lg shadow overflow-x-auto\">\n        <table class=\"min-w-full text-sm\">\n          <thead class=\"bg-gray-50\">\n            <tr>\n              <th class=\"px-4 py-2 text-left\">Department</th>\n              <th class=\"px-4 py-2 text-left\">Revenue ($)</th>\n              <th class=\"px-4 py-2 text-left\">Change (%)</th>\n            </tr>\n          </thead>\n          <tbody>\n            <tr>\n              <td class=\"px-4 py-2\">Oncology</td>\n              <td class=\"px-4 py-2\">24400</td>\n              <td class=\"px-4 py-2 text-green-600\">+32%</td>\n            </tr>\n            <tr>\n              <td class=\"px-4 py-2\">Surgery</td>\n              <td class=\"px-4 py-2\">19500</td>\n              <td class=\"px-4 py-2 text-green-600\">+10%</td>\n            </tr>\n            <tr>\n              <td class=\"px-4 py-2\">Radiology</td>\n              <td class=\"px-4 py-2\">13800</td>\n              <td class=\"px-4 py-2 text-red-600\">-3%</td>\n            </tr>\n            <tr>\n              <td class=\"px-4 py-2\">Outpatient</td>\n              <td class=\"px-4 py-2\">21600</td>\n              <td class=\"px-4 py-2 text-green-600\">+21%</td>\n            </tr>\n          </tbody>\n        </table>\n      </div>\n    </section>\n  </div>\n\n  <!-- Chart.js CDN -->\n  <script src=\"https://cdn.jsdelivr.net/npm/chart.js\"></script>\n  <script>\n    const ctx = document.getElementById('myChart').getContext('2d');\n    new Chart(ctx, {\n      type: 'bar',\n      data: {\n        labels: ['Oncology', 'Surgery', 'Radiology', 'Outpatient'],\n        datasets: [{\n          label: 'Revenue ($)',\n          data: [24400, 19500, 13800, 21600],\n          backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316'],\n          borderRadius: 5\n        }]\n      },\n      options: {\n        responsive: true,\n        plugins: {\n          legend: { display: false }\n        },\n        scales: {\n          y: {\n            beginAtZero: true\n          }\n        }\n      }\n    });\n  </script>\n</body>\n</html>`
      await streamingPostRequest(
        REPORT_API_PATH,
        { report_specs, html_template: REPORT_HTML_TEMPLATE, log_iter: 2 },
        report_specs
      )
    },
    [streamingPostRequest]
  )

  const contextValue = useMemo(() => ({
    messages,
    streaming,
    sendTask,
    isSharedSession,
    sendReportTask,
  }), [messages, streaming, sendTask, isSharedSession, sendReportTask])

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  )
}

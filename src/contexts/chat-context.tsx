import { createContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react'
import { useParams } from 'react-router'
import { ParsedBlock, parseEventStream } from '@/lib/utils'

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
  sendReportTask: (report_specs: string, htmlTemplate?: string) => Promise<void>
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
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        })
        if (!response.body) throw new Error('No response body for streaming')
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let done = false
        let buffer = ''
        while (!done) {
          const { value, done: readerDone } = await reader.read()
          done = readerDone
          if (value) {
            const chunk = decoder.decode(value, { stream: true })
            buffer += chunk
            const events = parseEventStream(buffer)
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
              buffer = ''
            } else if (chunk.trim()) {
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
    async (report_specs: string, htmlTemplate?: string) => {
      const REPORT_API_PATH = `/report/run_report_temp/${sessionId}`
      const DEFAULT_TEMPLATE = `<!doctypehtml><html lang=en><meta charset=UTF-8><title>Minimal Structured Report</title><meta content="width=device-width,initial-scale=1"name=viewport><script src=https://cdn.tailwindcss.com></script><body class="bg-gray-100 antialiased font-sans min-h-screen text-gray-800"><div class="bg-white max-w-3xl md:p-12 mt-8 mx-auto p-6 rounded-sm shadow-2xl sm:p-10"><h1 class="font-bold tracking-wider mb-8 sm:text-4xl text-3xl text-black text-center">Project Financial Summary</h1><div class="border border-black mb-8"><div class="border-black border-b grid grid-cols-1 md:grid-cols-3"><div class="text-sm font-bold md:col-span-1 p-3 tracking-wide">Period</div><div class="text-sm p-3 md:border-black md:border-l md:col-span-2">Q2 2025</div></div><div class="grid grid-cols-1 md:grid-cols-3"><div class="text-sm font-bold md:col-span-1 p-3 tracking-wide">Prepared By</div><div class="text-sm p-3 md:border-black md:border-l md:col-span-2">Finance Team</div></div></div><div class=mb-10><div class="bg-black px-4 py-2 text-white"><h2 class="text-sm font-bold tracking-widest">Executive Summary</h2></div><div class="border border-gray-300 border-t-0 p-4"><p class="text-sm leading-relaxed">This quarter showed positive revenue growth across all main departments. Actual spending stayed below budget for the first time this year, indicating improved operational efficiency.</div></div><div class=mb-10><div class="bg-black px-4 py-2 text-white"><h2 class="text-sm font-bold tracking-widest">Budget vs Actual Spend</h2></div><div class="bg-white border border-gray-300 border-t-0 p-4"><canvas height=250 id=budgetChart></canvas></div></div><div><div class="bg-black px-4 py-2 text-white"><h2 class="text-sm font-bold tracking-widest">Department Breakdown</h2></div><div class="bg-white border border-gray-300 border-t-0 p-4 overflow-x-auto"><table class="text-sm min-w-full"id=deptTable><thead class=bg-gray-100><tr><th class="font-bold p-3 text-gray-600 text-left tracking-wider uppercase">Department<th class="font-bold p-3 text-gray-600 text-left tracking-wider uppercase">Budget<th class="font-bold p-3 text-gray-600 text-left tracking-wider uppercase">Actual<th class="font-bold p-3 text-gray-600 text-left tracking-wider uppercase">Variance<tbody class="bg-white divide-gray-200 divide-y"id=deptTableBody></table><div class="flex items-center justify-between mt-4"><button class="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"id=prevPage>Previous</button> <span class=text-sm id=pageInfo></span> <button class="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"id=nextPage>Next</button></div></div></div></div><script src=https://cdn.jsdelivr.net/npm/chart.js></script><script>var budgetData=[{name:"Operations",Budget:2e5,Actual:185e3},{name:"Sales",Budget:12e4,Actual:118e3},{name:"Marketing",Budget:8e4,Actual:77e3}],ctx=document.getElementById("budgetChart").getContext("2d");new Chart(ctx,{type:"bar",data:{labels:budgetData.map(function(e){return e.name}),datasets:[{label:"Budget",data:budgetData.map(function(e){return e.Budget}),backgroundColor:"#a3a3a3",borderRadius:4},{label:"Actual Spend",data:budgetData.map(function(e){return e.Actual}),backgroundColor:"#10b981",borderRadius:4}]},options:{responsive:!0,plugins:{legend:{labels:{font:{size:13}}},tooltip:{callbacks:{label:function(e){return e.dataset.label+': $'+e.parsed.y.toLocaleString()}}}},scales:{x:{ticks:{font:{size:13}}},y:{ticks:{font:{size:13},callback:function(e){return'$'+e/1e3+'k'}}}}}});var departmentRows=[{name:"Operations",budget:2e5,actual:185e3,variance:-15e3},{name:"Sales",budget:12e4,actual:118e3,variance:-2e3},{name:"Marketing",budget:8e4,actual:77e3,variance:-3e3},{name:"R&D",budget:7e4,actual:71e3,variance:1e3},{name:"HR",budget:4e4,actual:39e3,variance:-1e3},{name:"IT",budget:5e4,actual:52e3,variance:2e3},{name:"Legal",budget:3e4,actual:28e3,variance:-2e3},{name:"Admin",budget:25e3,actual:22e3,variance:-3e3},{name:"Customer Support",budget:4e4,actual:41e3,variance:1e3},{name:"Procurement",budget:33e3,actual:33500,variance:500},{name:"Logistics",budget:44e3,actual:43e3,variance:-1e3},{name:"Compliance",budget:37e3,actual:36e3,variance:-1e3},{name:"QA",budget:42e3,actual:41e3,variance:-1e3},{name:"Facilities",budget:21e3,actual:22e3,variance:1e3},{name:"PR",budget:27e3,actual:26500,variance:-500},{name:"Design",budget:32e3,actual:31900,variance:-100},{name:"Training",budget:23e3,actual:22500,variance:-500},{name:"Finance",budget:1e5,actual:99500,variance:-500},{name:"Business Dev",budget:55e3,actual:54900,variance:-100},{name:"Strategy",budget:6e4,actual:60500,variance:500}],currentPage=1,rowsPerPage=10,totalPages=Math.ceil(departmentRows.length/rowsPerPage);function renderTable(){var e=document.getElementById("deptTableBody");e.innerHTML="";for(var a=(currentPage-1)*rowsPerPage,t=Math.min(a+rowsPerPage,departmentRows.length),n=a;n<t;n++){var r=departmentRows[n],c=document.createElement("tr");c.innerHTML='<td class="p-3 whitespace-nowrap">'+r.name+'</td><td class="p-3 whitespace-nowrap">$'+r.budget.toLocaleString()+'</td><td class="p-3 whitespace-nowrap">$'+r.actual.toLocaleString()+'</td><td class="p-3 whitespace-nowrap '+(r.variance<0?"text-green-600":"text-red-600")+'">'+(r.variance<0?"-":"+")+"$"+Math.abs(r.variance).toLocaleString()+"</td>",e.appendChild(c)}document.getElementById("pageInfo").textContent="Page "+currentPage+" of "+totalPages,document.getElementById("prevPage").disabled=1===currentPage,document.getElementById("nextPage").disabled=currentPage===totalPages}document.getElementById("prevPage").onclick=function(){1<currentPage&&(currentPage--,renderTable())},document.getElementById("nextPage").onclick=function(){currentPage<totalPages&&(currentPage++,renderTable())},renderTable()</script>`
      const templateToUse = htmlTemplate || DEFAULT_TEMPLATE
      await streamingPostRequest(
        REPORT_API_PATH,
        { report_specs, html_template: templateToUse, log_iter: 2 },
        report_specs
      )
    },
    [streamingPostRequest, sessionId]
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

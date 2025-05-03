import { Textarea } from "@/components/ui/textarea"
import { SendHorizontal } from "lucide-react"

const messages = [
  {
    sender: 'user',
    message: 'make a agent that builds best landing pages when given a description',
    timestamp: '2025-05-03T14:25:00Z',
  },
  {
    sender: 'bot',
    message: 'Absolutely! I can help you create an intelligent agent that takes a description of a product or service and generates a high-converting landing page, complete with sections like hero banners, CTAs, testimonials, and responsive layout.',
    timestamp: '2025-05-03T14:25:01Z',
  },
  {
    sender: 'user',
    message: 'What’s the weather?',
    timestamp: '2025-05-03T14:25:05Z',
  },
  {
    sender: 'bot',
    message: 'Today’s weather is mostly sunny with mild cloud coverage in the afternoon. Expect temperatures between 22°C and 26°C, with gentle breezes throughout the day.',
    timestamp: '2025-05-03T14:25:06Z',
  },
  {
    sender: 'user',
    message: 'Create a logo idea',
    timestamp: '2025-05-03T14:25:10Z',
  },
  {
    sender: 'bot',
    message: 'Sure! How about a clean, minimalistic logo featuring a geometric icon paired with a modern sans-serif typeface? The color scheme can be a calming blue gradient to evoke trust and clarity.',
    timestamp: '2025-05-03T14:25:11Z',
  },
  {
    sender: 'user',
    message: 'Summarize GPT-4',
    timestamp: '2025-05-03T14:25:15Z',
  },
  {
    sender: 'bot',
    message: 'GPT-4 is a large multimodal model developed by OpenAI that processes both text and image inputs. It outperforms GPT-3.5 in accuracy, reasoning, and safety, offering improved capabilities for professional and creative tasks.',
    timestamp: '2025-05-03T14:25:16Z',
  },
  {
    sender: 'user',
    message: 'Suggest UI ideas',
    timestamp: '2025-05-03T14:25:20Z',
  },
  {
    sender: 'bot',
    message: 'You could go for a card-based layout with intuitive hover effects and soft shadows. Incorporate light/dark mode toggles, animated micro-interactions, and sticky navigation for enhanced UX.',
    timestamp: '2025-05-03T14:25:21Z',
  },
  {
    sender: 'user',
    message: 'Build a chart',
    timestamp: '2025-05-03T14:25:25Z',
  },
  {
    sender: 'bot',
    message: 'Sure! I recommend using a line chart with Chart.js or Recharts. Feed it time-series data and add interactive tooltips, legends, and axis labels for readability. I can generate sample code too.',
    timestamp: '2025-05-03T14:25:26Z',
  },
  {
    sender: 'user',
    message: 'Write SEO meta',
    timestamp: '2025-05-03T14:25:30Z',
  },
  {
    sender: 'bot',
    message: 'Here’s a meta description: “Boost your productivity with our AI-powered dashboard. Real-time insights, seamless integration, and beautiful design — all in one place.”',
    timestamp: '2025-05-03T14:25:31Z',
  },
  {
    sender: 'user',
    message: 'Deploy the app',
    timestamp: '2025-05-03T14:25:35Z',
  },
  {
    sender: 'bot',
    message: 'To deploy, you can use platforms like Vercel or Netlify. Push your code to GitHub, connect the repo in your platform dashboard, and configure environment variables as needed. I can help walk you through each step.',
    timestamp: '2025-05-03T14:25:36Z',
  },
  {
    sender: 'user',
    message: 'Generate test data',
    timestamp: '2025-05-03T14:25:40Z',
  },
  {
    sender: 'bot',
    message: 'Sure. I can generate synthetic user profiles, transactions, or random event logs in JSON or CSV format, which is ideal for testing dashboards or analytics pipelines.',
    timestamp: '2025-05-03T14:25:41Z',
  },
  {
    sender: 'user',
    message: 'Next steps?',
    timestamp: '2025-05-03T14:25:45Z',
  },
  {
    sender: 'bot',
    message: 'You can now define your project scope, set up a Git repo, install dependencies, and start building out your components. Let me know if you’d like a starter template or CI/CD help!',
    timestamp: '2025-05-03T14:25:46Z',
  }
]


function Chatbot() {
  return (
    <div className='px-8'>
      <div className='flex-1/2 max-w-4xl flex flex-col justify-between h-[94vh]'>
        <div className='flex-1 overflow-y-auto overflow-x-hidden'>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${
                message.sender === 'user'
                  && 'bg-muted border'
              } rounded text-sm px-4 py-2 mb-4 max-w-[95%]`}
            >
              {message.message}
            </div>
          ))}
        </div>
        <div className='relative'>
          <Textarea placeholder='Ask a follow up' className='h-24' />
          <SendHorizontal className='size-4 absolute bottom-3 right-3 cursor-pointer' />
        </div>
      </div>
    </div>
  )
}

export default Chatbot

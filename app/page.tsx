'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { copyToClipboard } from '@/lib/clipboard'
import { FiSend, FiCopy, FiRefreshCw, FiAlertCircle, FiSearch, FiMenu, FiFileText, FiX, FiInfo, FiTrash2, FiCheck, FiLoader } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

// ─── Constants ───────────────────────────────────────────────────────────────

const MANAGER_AGENT_ID = '698b3c45f5a3c496d902339d'
const CONTENT_WRITER_ID = '698b3bc4530a77dfe1db90d6'
const SEO_ANALYST_ID = '698b3bf79b3205af189627aa'
const GRAPHICS_GENERATOR_ID = '698b3c0ef5a3c496d902339c'

const AGENTS = [
  { id: MANAGER_AGENT_ID, name: 'Marketing Coordinator', role: 'Manager - Orchestrates all sub-agents' },
  { id: CONTENT_WRITER_ID, name: 'Content Writer', role: 'Drafts marketing copy and blog posts' },
  { id: SEO_ANALYST_ID, name: 'SEO Analyst', role: 'Keyword research and optimization guidance' },
  { id: GRAPHICS_GENERATOR_ID, name: 'Graphics Generator', role: 'Creates visual asset descriptions' },
]

const ACTIVITY_STEPS = [
  { label: 'Analyzing campaign brief...', agent: 'Marketing Coordinator', duration: 2000 },
  { label: 'Researching keywords and SEO strategy...', agent: 'SEO Analyst', duration: 3000 },
  { label: 'Drafting marketing copy and content...', agent: 'Content Writer', duration: 4000 },
  { label: 'Generating visual asset concepts...', agent: 'Graphics Generator', duration: 3000 },
  { label: 'Compiling and reviewing campaign...', agent: 'Marketing Coordinator', duration: 2000 },
]

const SAMPLE_BRIEF = {
  topic: "Create a complete marketing campaign for the launch of 'FlowState', a new productivity app for remote workers. Target audience: young professionals aged 25-35. Include SEO optimization, compelling copy, and visual assets.",
  contentTypes: ['blog', 'social'] as string[],
  targetAudience: 'Young professionals aged 25-35 who work remotely',
  brandTone: 'bold' as string,
}

const SAMPLE_RESULT = {
  summary: "Delivered a unified, SEO-optimized campaign package for FlowState's launch -- targeting young remote-working professionals -- with a bold blog post, multi-platform social media content, detailed SEO guidance, and vibrant branded visuals.",
  campaign_overview: "The campaign for FlowState, a new productivity app targeting remote workers aged 25-35, merges bold, energetic messaging with actionable productivity solutions. Components include an SEO-optimized launch blog post, three distinctive social media posts (Instagram/Facebook, LinkedIn, Twitter/X), a comprehensive SEO recommendations document (keywords, structure, and best practices), and a suite of branded visual assets for web and social channels.",
  written_content: "# FlowState: The Best Productivity App for Remote Workers Who Refuse to Settle\n\n## How to Improve Productivity While Working From Home Without Losing Your Mind\n\nLet's be honest -- remote work productivity isn't what the Instagram influencers promised. You're juggling endless Zoom calls, context-switching between 15 browser tabs, and somehow working more hours with less to show for it.\n\n**Enter FlowState.**\n\nFlowState is the game-changing productivity platform built specifically for the modern remote worker who refuses to settle for mediocrity.\n\n### Key Features\n\n- **Smart Focus Sessions**: AI-powered focus mode that doesn't just block distractions -- it actively creates the perfect environment for deep work\n- **Energy-Based Scheduling**: Schedule tasks based on your energy levels throughout the day\n- **Real-Time Collaboration Boundaries**: Protects your deep work time while ensuring availability for collaboration\n\n## Social Media Posts\n\n**Instagram/Facebook:**\nSTOP LETTING DISTRACTIONS WIN. Your WFH setup is fire. Your productivity system? Not so much. Meet FlowState -- the app that finally gets YOU.\n\n**LinkedIn:**\nRemote work promised freedom. Instead, it delivered distraction overload. Time to flip the script. Introducing FlowState -- the productivity app that actually understands how modern professionals work.\n\n**Twitter/X:**\nYour productivity isn't broken. Your tools are. FlowState is the first app built for how remote workers ACTUALLY work. Launching June 15.",
  seo_recommendations: "**Primary Keywords:** productivity app, remote work productivity, FlowState, app for remote workers, time management app\n\n**Secondary Keywords:** boost productivity, work from home tools, workspace organization, focus apps, time tracking apps\n\n**Long-tail Keywords:** best productivity app for remote workers, how to improve productivity while working from home, top apps for enhancing remote work efficiency\n\n**Meta Descriptions:**\n- Boost your productivity with FlowState, the ultimate app for remote workers. Enhance your workflow and achieve your goals this summer.\n- Unlock your full potential while working remotely! Discover the features of FlowState, your go-to productivity app.\n\n**Optimization Checklist:**\n- Optimize title tags and meta descriptions with primary keywords\n- Include primary and secondary keywords naturally throughout the content\n- Use header tags (H1, H2, H3) to structure the content clearly\n- Add images with alt tags containing keywords\n- Ensure mobile optimization for the app's landing page\n- Enhance page load speed for a better user experience\n- Build backlinks from reputable productivity and tech blogs\n- Encourage user reviews and testimonials for social proof\n\n**Keyword Density:** Maintain 1-2% for primary keywords and 0.5-1% for secondary keywords\n\n**Content Structure:** Introduction to FlowState, Key Features, Benefits for Remote Workers, User Testimonials, Tips for Enhancing Productivity, Call to Action",
  visual_assets: "Four custom visuals were generated:\n\n1. **Blog Cover Image** - Vibrant workspace, FlowState branding, energetic remote work theme. Wide-format for web headers.\n\n2. **Instagram/Facebook Social Graphic** - Young professional at desk, CTA to download. Bold gradient background with playful geometric overlays.\n\n3. **App Features Social Graphic** - App UI overlays, feature highlights. Clean, minimal design with fun summer palette.\n\n4. **Collaboration CTA Social Graphic** - Remote professionals collaborating, bold CTA. Professional color gradients in blues and oranges.\n\nAll assets feature a bold palette, modern typography, and clear branding.",
  consistency_notes: "All deliverables maintain a bold, energetic tone with direct and motivating language. Visual style across social and blog assets is consistent -- vivid colors, youthful imagery, and FlowState's branding unite the campaign. Keywords, benefits, and calls-to-action are aligned through both copy and visuals.",
  revision_flags: "No major inconsistencies detected. If further customization is needed (such as specific download links, platform-specific image sizes, or A/B tested headlines), please indicate adjustments required.",
}

// ─── Theme ───────────────────────────────────────────────────────────────────

const THEME_VARS = {
  '--background': '30 40% 98%',
  '--foreground': '20 40% 10%',
  '--card': '30 40% 96%',
  '--card-foreground': '20 40% 10%',
  '--popover': '30 40% 94%',
  '--popover-foreground': '20 40% 10%',
  '--primary': '24 95% 53%',
  '--primary-foreground': '30 40% 98%',
  '--secondary': '30 35% 92%',
  '--secondary-foreground': '20 40% 15%',
  '--accent': '12 80% 50%',
  '--accent-foreground': '30 40% 98%',
  '--destructive': '0 84% 60%',
  '--destructive-foreground': '0 0% 98%',
  '--muted': '30 30% 90%',
  '--muted-foreground': '20 25% 45%',
  '--border': '30 35% 88%',
  '--input': '30 30% 80%',
  '--ring': '24 95% 53%',
  '--radius': '0.875rem',
} as React.CSSProperties

// ─── Types ───────────────────────────────────────────────────────────────────

interface CampaignResult {
  summary: string
  campaign_overview: string
  written_content: string
  seo_recommendations: string
  visual_assets: string
  consistency_notes: string
  revision_flags: string
}

interface CampaignHistory {
  id: string
  topic: string
  tone: string
  audience: string
  timestamp: string
  result: CampaignResult
}

interface FormData {
  topic: string
  contentTypes: string[]
  targetAudience: string
  brandTone: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 36).toString(36)).join('')
}

function parseManagerResponse(apiResponse: { success: boolean; response?: Record<string, unknown> }): CampaignResult | null {
  if (!apiResponse?.success) return null
  const resp = apiResponse?.response as Record<string, unknown> | undefined
  if (!resp) return null

  const result = resp?.result as Record<string, unknown> | undefined
  if (!result) return null

  const data = (result?.data as Record<string, unknown>) || result

  return {
    summary: String(result?.summary ?? data?.summary ?? ''),
    campaign_overview: String(data?.campaign_overview ?? ''),
    written_content: String(data?.written_content ?? ''),
    seo_recommendations: String(data?.seo_recommendations ?? ''),
    visual_assets: String(data?.visual_assets ?? ''),
    consistency_notes: String(data?.consistency_notes ?? ''),
    revision_flags: String(data?.revision_flags ?? ''),
  }
}

function parseVisualAssets(text: string): { name: string; intended_use: string; specifications: string }[] {
  if (!text) return []
  const assets: { name: string; intended_use: string; specifications: string }[] = []
  const lines = text.split('\n')
  let currentAsset: { name: string; intended_use: string; specifications: string } | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    const match = trimmed.match(/^\d+\.\s+\*\*(.+?)\*\*\s*[-:]?\s*(.*)/)
    if (match) {
      if (currentAsset) assets.push(currentAsset)
      currentAsset = {
        name: match[1].trim(),
        intended_use: match[2].trim(),
        specifications: '',
      }
    } else if (trimmed.match(/^\d+\.\s+(.+)/)) {
      const m = trimmed.match(/^\d+\.\s+(.+)/)
      if (m) {
        if (currentAsset) assets.push(currentAsset)
        const parts = m[1].split(/[-:]/)
        currentAsset = {
          name: parts[0]?.trim() ?? '',
          intended_use: parts.slice(1).join(':').trim(),
          specifications: '',
        }
      }
    } else if (currentAsset && trimmed.length > 0 && !trimmed.startsWith('All assets') && !trimmed.startsWith('Four custom')) {
      currentAsset.specifications += (currentAsset.specifications ? ' ' : '') + trimmed
    }
  }
  if (currentAsset) assets.push(currentAsset)
  return assets
}

function parseSEOKeywords(text: string): { primary: string[]; secondary: string[]; longTail: string[] } {
  const result = { primary: [] as string[], secondary: [] as string[], longTail: [] as string[] }
  if (!text) return result

  const primaryMatch = text.match(/\*\*Primary Keywords?:?\*\*\s*([^\n*]+)/i)
  if (primaryMatch) {
    result.primary = primaryMatch[1].split(',').map(k => k.trim()).filter(Boolean)
  }
  const secondaryMatch = text.match(/\*\*Secondary Keywords?:?\*\*\s*([^\n*]+)/i)
  if (secondaryMatch) {
    result.secondary = secondaryMatch[1].split(',').map(k => k.trim()).filter(Boolean)
  }
  const longTailMatch = text.match(/\*\*Long[- ]?tail Keywords?:?\*\*\s*([^\n*]+)/i)
  if (longTailMatch) {
    result.longTail = longTailMatch[1].split(',').map(k => k.trim()).filter(Boolean)
  }
  return result
}

function parseSEOChecklist(text: string): string[] {
  if (!text) return []
  const items: string[] = []
  const checklistMatch = text.match(/\*\*Optimization Checklist:?\*\*\s*([\s\S]*?)(?:\n\n\*\*|\n\n$|$)/i)
  if (checklistMatch) {
    const lines = checklistMatch[1].split('\n')
    for (const line of lines) {
      const trimmed = line.replace(/^[-*]\s*/, '').trim()
      if (trimmed.length > 0) items.push(trimmed)
    }
  }
  return items
}

function parseSEOMetaDescriptions(text: string): string[] {
  if (!text) return []
  const items: string[] = []
  const metaMatch = text.match(/\*\*Meta Descriptions?:?\*\*\s*([\s\S]*?)(?:\n\n\*\*|\n\n$|$)/i)
  if (metaMatch) {
    const lines = metaMatch[1].split('\n')
    for (const line of lines) {
      const trimmed = line.replace(/^[-*]\s*/, '').trim()
      if (trimmed.length > 0) items.push(trimmed)
    }
  }
  return items
}

// ─── Markdown Renderer ──────────────────────────────────────────────────────

function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let listKey = 0

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="space-y-1.5 my-3 ml-4">
          {listItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      )
      listItems = []
    }
  }

  const renderInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = []
    let remaining = text
    let keyIdx = 0
    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(remaining.slice(0, boldMatch.index))
        }
        parts.push(<strong key={keyIdx++} className="font-semibold">{boldMatch[1]}</strong>)
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length)
      } else {
        parts.push(remaining)
        break
      }
    }
    return parts.length === 1 ? parts[0] : <>{parts}</>
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed.startsWith('### ')) {
      flushList()
      elements.push(<h3 key={i} className="text-base font-semibold mt-5 mb-2 text-foreground">{renderInline(trimmed.slice(4))}</h3>)
    } else if (trimmed.startsWith('## ')) {
      flushList()
      elements.push(<h2 key={i} className="text-lg font-semibold mt-6 mb-2 text-foreground">{renderInline(trimmed.slice(3))}</h2>)
    } else if (trimmed.startsWith('# ')) {
      flushList()
      elements.push(<h1 key={i} className="text-xl font-bold mt-4 mb-3 text-foreground">{renderInline(trimmed.slice(2))}</h1>)
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(trimmed.slice(2))
    } else if (trimmed === '') {
      flushList()
    } else {
      flushList()
      elements.push(<p key={i} className="text-sm leading-relaxed mb-2 text-foreground/90">{renderInline(trimmed)}</p>)
    }
  }
  flushList()
  return <div>{elements}</div>
}

// ─── Activity Stream ─────────────────────────────────────────────────────────

function ActivityStream({ isActive, completedStep }: { isActive: boolean; completedStep: number }) {
  if (!isActive && completedStep < 0) return null

  return (
    <Card className="mt-4 border-border/50 bg-card/80 backdrop-blur-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Agent Activity Stream
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {ACTIVITY_STEPS.map((step, idx) => {
            const isCompleted = idx < completedStep
            const isCurrent = idx === completedStep && isActive
            const isPending = idx > completedStep

            return (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {isCompleted ? (
                      <FiCheck className="w-3.5 h-3.5" />
                    ) : isCurrent ? (
                      <FiLoader className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span className="text-xs">{idx + 1}</span>
                    )}
                  </div>
                  {idx < ACTIVITY_STEPS.length - 1 && (
                    <div className={`w-0.5 h-5 mt-1 transition-colors duration-500 ${isCompleted ? 'bg-emerald-500/50' : 'bg-border'}`} />
                  )}
                </div>
                <div className={`pt-1 transition-opacity duration-300 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
                  <p className={`text-sm font-medium ${isCurrent ? 'text-foreground' : isCompleted ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.agent}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Graphics Card ───────────────────────────────────────────────────────────

const GRADIENT_PRESETS = [
  'from-orange-400 via-rose-400 to-pink-500',
  'from-amber-400 via-orange-400 to-red-400',
  'from-yellow-400 via-amber-400 to-orange-500',
  'from-rose-400 via-red-400 to-orange-500',
]

function GraphicsCard({ asset, index }: { asset: { name: string; intended_use: string; specifications: string }; index: number }) {
  const gradient = GRADIENT_PRESETS[index % GRADIENT_PRESETS.length]

  return (
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
      <div className={`h-36 bg-gradient-to-br ${gradient} flex items-center justify-center p-4`}>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/30">
          <FiFileText className="w-6 h-6 text-white mx-auto mb-1" />
          <p className="text-white text-xs font-medium">Visual Asset</p>
        </div>
      </div>
      <CardContent className="p-4">
        <h4 className="font-semibold text-sm text-foreground mb-1">{asset.name}</h4>
        {asset.intended_use && (
          <p className="text-xs text-muted-foreground mb-2">{asset.intended_use}</p>
        )}
        {asset.specifications && (
          <p className="text-xs text-muted-foreground/80 leading-relaxed">{asset.specifications}</p>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Campaign History Sidebar ────────────────────────────────────────────────

function HistorySidebar({
  isOpen,
  history,
  onSelect,
  onDelete,
  onClose,
}: {
  isOpen: boolean
  history: CampaignHistory[]
  onSelect: (h: CampaignHistory) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-80 max-w-[85vw] bg-card border-r border-border shadow-2xl flex flex-col h-full">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Campaign History</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <FiX className="w-4 h-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          {history.length === 0 ? (
            <div className="p-6 text-center">
              <FiFileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No campaigns yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Generate your first campaign to see it here</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/50 cursor-pointer transition-colors group"
                  onClick={() => { onSelect(h); onClose() }}
                >
                  <p className="text-sm font-medium text-foreground line-clamp-2 mb-1">{h.topic.slice(0, 80)}{h.topic.length > 80 ? '...' : ''}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="secondary" className="text-xs capitalize">{h.tone}</Badge>
                    <span className="text-xs text-muted-foreground">{h.timestamp}</span>
                  </div>
                  <button
                    className="mt-2 text-xs text-destructive/70 hover:text-destructive flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); onDelete(h.id) }}
                  >
                    <FiTrash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Home() {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    contentTypes: [],
    targetAudience: '',
    brandTone: 'professional',
  })

  // App state
  const [isLoading, setIsLoading] = useState(false)
  const [activityStep, setActivityStep] = useState(-1)
  const [campaignResult, setCampaignResult] = useState<CampaignResult | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [showSampleData, setShowSampleData] = useState(false)
  const [copySuccess, setCopySuccess] = useState('')
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  // History state
  const [history, setHistory] = useState<CampaignHistory[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Refs
  const activityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('marketing_hub_history')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setHistory(parsed)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Save history to localStorage
  const saveHistory = useCallback((newHistory: CampaignHistory[]) => {
    setHistory(newHistory)
    try {
      localStorage.setItem('marketing_hub_history', JSON.stringify(newHistory))
    } catch {
      // ignore storage errors
    }
  }, [])

  // Handle sample data toggle
  useEffect(() => {
    if (showSampleData) {
      setFormData(SAMPLE_BRIEF)
      setCampaignResult(SAMPLE_RESULT)
      setActiveTab('overview')
    } else {
      setFormData({ topic: '', contentTypes: [], targetAudience: '', brandTone: 'professional' })
      setCampaignResult(null)
    }
  }, [showSampleData])

  // Copy handler
  const handleCopy = useCallback(async (text: string, label: string) => {
    await copyToClipboard(text)
    setCopySuccess(label)
    setTimeout(() => setCopySuccess(''), 2000)
  }, [])

  // Content type toggle
  const toggleContentType = useCallback((type: string) => {
    setFormData(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(type)
        ? prev.contentTypes.filter(t => t !== type)
        : [...prev.contentTypes, type],
    }))
  }, [])

  // Simulate activity stream steps
  const runActivityStream = useCallback(() => {
    let step = 0
    setActivityStep(0)

    const advance = () => {
      step++
      if (step < ACTIVITY_STEPS.length) {
        setActivityStep(step)
        activityTimerRef.current = setTimeout(advance, ACTIVITY_STEPS[step].duration)
      }
    }
    activityTimerRef.current = setTimeout(advance, ACTIVITY_STEPS[0].duration)
  }, [])

  // Generate campaign
  const handleGenerate = useCallback(async () => {
    if (!formData.topic.trim()) {
      setError('Please enter a campaign topic')
      return
    }

    setError('')
    setIsLoading(true)
    setCampaignResult(null)
    setActiveAgentId(MANAGER_AGENT_ID)
    runActivityStream()

    const prompt = `Campaign Topic: ${formData.topic}\nContent Types: ${formData.contentTypes.length > 0 ? formData.contentTypes.join(', ') : 'blog post, social media'}\nTarget Audience: ${formData.targetAudience || 'General audience'}\nBrand Tone: ${formData.brandTone || 'professional'}`

    try {
      const apiResult = await callAIAgent(prompt, MANAGER_AGENT_ID)
      const parsed = parseManagerResponse(apiResult as { success: boolean; response?: Record<string, unknown> })

      if (parsed) {
        setCampaignResult(parsed)
        setActiveTab('overview')
        setActivityStep(ACTIVITY_STEPS.length)

        const now = new Date()
        const timestamp = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`
        const entry: CampaignHistory = {
          id: generateId(),
          topic: formData.topic,
          tone: formData.brandTone,
          audience: formData.targetAudience,
          timestamp,
          result: parsed,
        }
        saveHistory([entry, ...history].slice(0, 20))
      } else {
        setError('Could not parse the campaign results. Please try again.')
      }
    } catch (err) {
      setError('Failed to generate campaign. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
      setActiveAgentId(null)
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current)
      }
    }
  }, [formData, history, runActivityStream, saveHistory])

  // Reset form
  const handleNewCampaign = useCallback(() => {
    setFormData({ topic: '', contentTypes: [], targetAudience: '', brandTone: 'professional' })
    setCampaignResult(null)
    setError('')
    setActivityStep(-1)
    setShowSampleData(false)
  }, [])

  // Load from history
  const handleLoadHistory = useCallback((entry: CampaignHistory) => {
    setCampaignResult(entry.result)
    setFormData({
      topic: entry.topic,
      contentTypes: [],
      targetAudience: entry.audience,
      brandTone: entry.tone,
    })
    setActiveTab('overview')
    setShowSampleData(false)
  }, [])

  // Delete from history
  const handleDeleteHistory = useCallback((id: string) => {
    saveHistory(history.filter(h => h.id !== id))
  }, [history, saveHistory])

  // Copy all content
  const handleCopyAll = useCallback(async () => {
    if (!campaignResult) return
    const allContent = [
      '=== CAMPAIGN OVERVIEW ===',
      campaignResult.campaign_overview,
      '',
      '=== WRITTEN CONTENT ===',
      campaignResult.written_content,
      '',
      '=== SEO RECOMMENDATIONS ===',
      campaignResult.seo_recommendations,
      '',
      '=== VISUAL ASSETS ===',
      campaignResult.visual_assets,
      '',
      '=== CONSISTENCY NOTES ===',
      campaignResult.consistency_notes,
    ].join('\n')
    await handleCopy(allContent, 'all')
  }, [campaignResult, handleCopy])

  const charCount = formData.topic.length

  return (
    <div style={THEME_VARS} className="min-h-screen bg-background text-foreground">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, hsl(30 50% 97%) 0%, hsl(20 45% 95%) 35%, hsl(40 40% 96%) 70%, hsl(15 35% 97%) 100%)' }} />

      {/* History Sidebar */}
      <HistorySidebar
        isOpen={sidebarOpen}
        history={history}
        onSelect={handleLoadHistory}
        onDelete={handleDeleteHistory}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)} className="border-border/50">
                <FiMenu className="w-4 h-4 mr-1.5" />
                History
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="sample-toggle" className="text-sm text-muted-foreground">Sample Data</Label>
              <Switch id="sample-toggle" checked={showSampleData} onCheckedChange={setShowSampleData} />
            </div>
          </div>
          <div className="text-center mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">Marketing Team Hub</h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-xl mx-auto leading-relaxed">Orchestrate your marketing team of AI agents to create complete, SEO-optimized campaigns with compelling copy and visual assets -- all from a single brief.</p>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - Campaign Form */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-border/50 bg-card/80 backdrop-blur-md shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Campaign Brief</CardTitle>
                <CardDescription className="text-xs">Describe your campaign and let the team handle the rest</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Topic */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Campaign Topic <span className="text-destructive">*</span></Label>
                  <Textarea
                    placeholder="e.g., Launch campaign for a new productivity app targeting remote workers..."
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value.slice(0, 500) }))}
                    className="min-h-[120px] resize-none bg-background/50 border-border/60 text-sm"
                    disabled={isLoading}
                  />
                  <div className="flex justify-end">
                    <span className={`text-xs ${charCount > 450 ? 'text-amber-600' : 'text-muted-foreground'}`}>{charCount}/500</span>
                  </div>
                </div>

                {/* Content Types */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Content Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'blog', label: 'Blog Post' },
                      { key: 'social', label: 'Social Media' },
                      { key: 'email', label: 'Email Campaign' },
                    ].map(ct => (
                      <button
                        key={ct.key}
                        type="button"
                        onClick={() => toggleContentType(ct.key)}
                        disabled={isLoading}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${formData.contentTypes.includes(ct.key) ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-background/50 text-muted-foreground border-border/60 hover:border-primary/40'}`}
                      >
                        {formData.contentTypes.includes(ct.key) && <FiCheck className="w-3 h-3 inline mr-1" />}
                        {ct.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Audience */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Target Audience</Label>
                  <Input
                    placeholder="e.g., Young professionals aged 25-35"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    className="bg-background/50 border-border/60 text-sm"
                    disabled={isLoading}
                  />
                </div>

                {/* Brand Tone */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Brand Tone</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'professional', label: 'Professional' },
                      { key: 'casual', label: 'Casual' },
                      { key: 'bold', label: 'Bold' },
                    ].map(tone => (
                      <button
                        key={tone.key}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, brandTone: tone.key }))}
                        disabled={isLoading}
                        className={`py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${formData.brandTone === tone.key ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-background/50 text-muted-foreground border-border/60 hover:border-primary/40'}`}
                      >
                        {tone.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <FiAlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !formData.topic.trim()}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all duration-200"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                      Generating Campaign...
                    </>
                  ) : (
                    <>
                      <FiSend className="w-4 h-4 mr-2" />
                      Generate Campaign
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Activity Stream */}
            <ActivityStream isActive={isLoading} completedStep={activityStep} />

            {/* Agent Info */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Agent Team</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {AGENTS.map(agent => (
                    <div key={agent.id} className="flex items-center gap-2.5 py-1.5">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-300 ${activeAgentId === agent.id ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{agent.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{agent.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-3">
            {!campaignResult && !isLoading ? (
              <Card className="border-border/50 bg-card/80 backdrop-blur-md shadow-md h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center py-16 px-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <FiSend className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Create Your Campaign</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Fill in your campaign brief on the left and click Generate. The marketing team will collaborate to produce content, SEO strategy, and visual assets.
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-4">
                    Or toggle Sample Data to preview how results look.
                  </p>
                </CardContent>
              </Card>
            ) : isLoading && !campaignResult ? (
              <Card className="border-border/50 bg-card/80 backdrop-blur-md shadow-md h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center py-16">
                  <FiLoader className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Coordinating Your Marketing Team</h3>
                  <p className="text-sm text-muted-foreground">
                    The Marketing Coordinator is orchestrating Content Writer, SEO Analyst, and Graphics Generator...
                  </p>
                </CardContent>
              </Card>
            ) : campaignResult ? (
              <div className="space-y-4">
                {/* Action Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyAll} className="border-border/50 text-xs">
                    {copySuccess === 'all' ? <FiCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> : <FiCopy className="w-3.5 h-3.5 mr-1.5" />}
                    {copySuccess === 'all' ? 'Copied!' : 'Copy All Content'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNewCampaign} className="border-border/50 text-xs">
                    <FiRefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    New Campaign
                  </Button>
                  {campaignResult.summary && (
                    <Badge variant="secondary" className="ml-auto text-xs py-1">
                      <FiCheck className="w-3 h-3 mr-1 text-emerald-500" />
                      Campaign Generated
                    </Badge>
                  )}
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full grid grid-cols-4 bg-muted/60">
                    <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                    <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
                    <TabsTrigger value="seo" className="text-xs">SEO</TabsTrigger>
                    <TabsTrigger value="graphics" className="text-xs">Graphics</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-4">
                    <ScrollArea className="h-[calc(100vh-320px)] min-h-[400px]">
                      <div className="space-y-4 pr-4">
                        {/* Summary */}
                        {campaignResult.summary && (
                          <Card className="border-border/50 bg-card/80 backdrop-blur-md">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <div className="w-1.5 h-6 rounded-full bg-primary" />
                                Campaign Summary
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm leading-relaxed text-foreground/90">{campaignResult.summary}</p>
                            </CardContent>
                          </Card>
                        )}

                        {/* Campaign Overview */}
                        {campaignResult.campaign_overview && (
                          <Card className="border-border/50 bg-card/80 backdrop-blur-md">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                  <div className="w-1.5 h-6 rounded-full bg-amber-500" />
                                  Campaign Overview
                                </CardTitle>
                                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleCopy(campaignResult.campaign_overview, 'overview')}>
                                  {copySuccess === 'overview' ? <FiCheck className="w-3.5 h-3.5 text-emerald-500" /> : <FiCopy className="w-3.5 h-3.5 text-muted-foreground" />}
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <MarkdownRenderer content={campaignResult.campaign_overview} />
                            </CardContent>
                          </Card>
                        )}

                        {/* Consistency Notes */}
                        {campaignResult.consistency_notes && (
                          <Card className="border-border/50 bg-card/80 backdrop-blur-md">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <div className="w-1.5 h-6 rounded-full bg-emerald-500" />
                                Consistency Notes
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm leading-relaxed text-foreground/90">{campaignResult.consistency_notes}</p>
                            </CardContent>
                          </Card>
                        )}

                        {/* Revision Flags */}
                        {campaignResult.revision_flags && (
                          <Card className="border-border/50 bg-card/80 backdrop-blur-md">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <div className="w-1.5 h-6 rounded-full bg-rose-500" />
                                Revision Notes
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm leading-relaxed text-foreground/90">{campaignResult.revision_flags}</p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Content Tab */}
                  <TabsContent value="content" className="mt-4">
                    <ScrollArea className="h-[calc(100vh-320px)] min-h-[400px]">
                      <div className="space-y-4 pr-4">
                        <Card className="border-border/50 bg-card/80 backdrop-blur-md">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <div className="w-1.5 h-6 rounded-full bg-primary" />
                                Written Content
                              </CardTitle>
                              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleCopy(campaignResult.written_content, 'content')}>
                                {copySuccess === 'content' ? <FiCheck className="w-3.5 h-3.5 text-emerald-500" /> : <FiCopy className="w-3.5 h-3.5 text-muted-foreground" />}
                              </Button>
                            </div>
                            <CardDescription className="text-xs">Generated by Content Writer Agent</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <MarkdownRenderer content={campaignResult.written_content} />
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* SEO Tab */}
                  <TabsContent value="seo" className="mt-4">
                    <ScrollArea className="h-[calc(100vh-320px)] min-h-[400px]">
                      <div className="space-y-4 pr-4">
                        {/* Keywords */}
                        {(() => {
                          const keywords = parseSEOKeywords(campaignResult.seo_recommendations)
                          const hasKeywords = keywords.primary.length > 0 || keywords.secondary.length > 0 || keywords.longTail.length > 0
                          if (!hasKeywords) return null
                          return (
                            <Card className="border-border/50 bg-card/80 backdrop-blur-md">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                  <FiSearch className="w-4 h-4 text-primary" />
                                  Keyword Strategy
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {keywords.primary.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Primary Keywords</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {keywords.primary.map((kw, i) => (
                                        <Badge key={i} className="bg-primary/10 text-primary border-primary/20 text-xs">{kw}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {keywords.secondary.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Secondary Keywords</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {keywords.secondary.map((kw, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {keywords.longTail.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Long-tail Keywords</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {keywords.longTail.map((kw, i) => (
                                        <Badge key={i} variant="outline" className="text-xs border-border/60">{kw}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )
                        })()}

                        {/* Meta Descriptions */}
                        {(() => {
                          const metas = parseSEOMetaDescriptions(campaignResult.seo_recommendations)
                          if (metas.length === 0) return null
                          return (
                            <Card className="border-border/50 bg-card/80 backdrop-blur-md">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                  <FiFileText className="w-4 h-4 text-amber-500" />
                                  Meta Descriptions
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                {metas.map((meta, i) => (
                                  <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/40">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="text-sm text-foreground/90 leading-relaxed flex-1">{meta}</p>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0" onClick={() => handleCopy(meta, `meta-${i}`)}>
                                        {copySuccess === `meta-${i}` ? <FiCheck className="w-3 h-3 text-emerald-500" /> : <FiCopy className="w-3 h-3 text-muted-foreground" />}
                                      </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{meta.length} characters</p>
                                  </div>
                                ))}
                              </CardContent>
                            </Card>
                          )
                        })()}

                        {/* Optimization Checklist */}
                        {(() => {
                          const checklist = parseSEOChecklist(campaignResult.seo_recommendations)
                          if (checklist.length === 0) return null
                          return (
                            <Card className="border-border/50 bg-card/80 backdrop-blur-md">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                  <FiCheck className="w-4 h-4 text-emerald-500" />
                                  Optimization Checklist
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  {checklist.map((item, i) => (
                                    <div key={i} className="flex items-start gap-2.5 py-1">
                                      <div className="w-5 h-5 rounded-md border-2 border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <FiCheck className="w-3 h-3 text-emerald-500" />
                                      </div>
                                      <p className="text-sm text-foreground/90 leading-relaxed">{item}</p>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })()}

                        {/* Full SEO Text */}
                        <Card className="border-border/50 bg-card/80 backdrop-blur-md">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <FiInfo className="w-4 h-4 text-muted-foreground" />
                                Full SEO Recommendations
                              </CardTitle>
                              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleCopy(campaignResult.seo_recommendations, 'seo')}>
                                {copySuccess === 'seo' ? <FiCheck className="w-3.5 h-3.5 text-emerald-500" /> : <FiCopy className="w-3.5 h-3.5 text-muted-foreground" />}
                              </Button>
                            </div>
                            <CardDescription className="text-xs">Generated by SEO Analyst Agent</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <MarkdownRenderer content={campaignResult.seo_recommendations} />
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Graphics Tab */}
                  <TabsContent value="graphics" className="mt-4">
                    <ScrollArea className="h-[calc(100vh-320px)] min-h-[400px]">
                      <div className="space-y-4 pr-4">
                        <Card className="border-border/50 bg-card/80 backdrop-blur-md">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <div className="w-1.5 h-6 rounded-full bg-rose-500" />
                                Visual Assets
                              </CardTitle>
                              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleCopy(campaignResult.visual_assets, 'graphics')}>
                                {copySuccess === 'graphics' ? <FiCheck className="w-3.5 h-3.5 text-emerald-500" /> : <FiCopy className="w-3.5 h-3.5 text-muted-foreground" />}
                              </Button>
                            </div>
                            <CardDescription className="text-xs">Generated by Graphics Generator Agent</CardDescription>
                          </CardHeader>
                          <CardContent>
                            {(() => {
                              const assets = parseVisualAssets(campaignResult.visual_assets)
                              if (assets.length > 0) {
                                return (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {assets.map((asset, i) => (
                                      <GraphicsCard key={i} asset={asset} index={i} />
                                    ))}
                                  </div>
                                )
                              }
                              return <MarkdownRenderer content={campaignResult.visual_assets} />
                            })()}
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

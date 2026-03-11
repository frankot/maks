'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

interface NavCarouselData {
  id: string
  texts: string[]
}

export default function NavCarouselCms() {
  const [data, setData] = useState<NavCarouselData | null>(null)
  const [texts, setTexts] = useState<string[]>([''])
  const [saving, setSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/nav-carousel')
      if (res.ok) {
        const content: NavCarouselData | null = await res.json()
        if (content) {
          setData(content)
          setTexts(content.texts.length > 0 ? content.texts : [''])
        }
      }
    } catch {
      toast.error('Failed to load nav carousel content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    const filtered = texts.filter((t) => t.trim())
    if (filtered.length === 0) {
      toast.error('At least one text is required')
      return
    }

    setSaving(true)
    try {
      const method = data ? 'PUT' : 'POST'
      const payload = data ? { id: data.id, texts: filtered } : { texts: filtered }

      const res = await fetch('/api/nav-carousel', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Failed to save')

      const saved: NavCarouselData = await res.json()
      setData(saved)
      setTexts(saved.texts)
      toast.success('Nav carousel content saved!')
    } catch {
      toast.error('Failed to save nav carousel content')
    } finally {
      setSaving(false)
    }
  }

  const updateText = (index: number, value: string) => {
    setTexts((prev) => prev.map((t, i) => (i === index ? value : t)))
  }

  const addText = () => {
    setTexts((prev) => [...prev, ''])
  }

  const removeText = (index: number) => {
    if (texts.length <= 1) return
    setTexts((prev) => prev.filter((_, i) => i !== index))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading nav carousel content...</div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nav Carousel Texts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Scrolling announcement texts</Label>
          {texts.map((text, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={text}
                onChange={(e) => updateText(index, e.target.value)}
                placeholder={`Text ${index + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeText(index)}
                disabled={texts.length <= 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addText}>
            <Plus className="mr-1 h-4 w-4" />
            Add Text
          </Button>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Nav Carousel'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MarqueeData {
  id: string;
  description: string;
  href: string | null;
  textHref: string | null;
}

export default function MarqueeCms() {
  const [data, setData] = useState<MarqueeData | null>(null);
  const [description, setDescription] = useState('');
  const [href, setHref] = useState('');
  const [textHref, setTextHref] = useState('');
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/marquee');
      if (res.ok) {
        const content: MarqueeData | null = await res.json();
        if (content) {
          setData(content);
          setDescription(content.description);
          setHref(content.href ?? '');
          setTextHref(content.textHref ?? '');
        }
      }
    } catch {
      toast.error('Failed to load marquee content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }

    setSaving(true);
    try {
      const method = data ? 'PUT' : 'POST';
      const payload = data
        ? { id: data.id, description, href: href || null, textHref: textHref || null }
        : { description, href: href || null, textHref: textHref || null };

      const res = await fetch('/api/marquee', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save');

      const saved: MarqueeData = await res.json();
      setData(saved);
      toast.success('Marquee content saved!');
    } catch {
      toast.error('Failed to save marquee content');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading marquee content...</div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marquee Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="marquee-description">Description (scrolling text)</Label>
          <Textarea
            id="marquee-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="SPLOT STUDIO A jewelry brand founded by..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="marquee-href">Link URL (optional)</Label>
          <Input
            id="marquee-href"
            value={href}
            onChange={(e) => setHref(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="marquee-textHref">Link Text (optional)</Label>
          <Input
            id="marquee-textHref"
            value={textHref}
            onChange={(e) => setTextHref(e.target.value)}
            placeholder="CHECK US OUT ;)"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Marquee Content'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

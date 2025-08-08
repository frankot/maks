"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";
import type { HeroContent } from "@/app/generated/prisma";

interface HeroTextEditorProps {
  heroContent: HeroContent | null;
  onUpdate: () => void;
}

export default function HeroTextEditor({
  heroContent,
  onUpdate,
}: HeroTextEditorProps) {
  const [isEditingText, setIsEditingText] = useState(false);
  const [textForm, setTextForm] = useState({
    description: "",
    href: "",
    textHref: "",
  });

  useEffect(() => {
    if (heroContent) {
      setTextForm({
        description: heroContent.description,
        href: heroContent.href || "",
        textHref: heroContent.textHref || "",
      });
    }
  }, [heroContent]);

  const handleTextSave = async () => {
    if (!heroContent) return;

    try {
      await fetch("/api/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: heroContent.id,
          ...textForm,
        }),
      });
      setIsEditingText(false);
      onUpdate();
      toast.success("Text updated!");
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <>
      <Separator />
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Hero Text</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditingText(!isEditingText)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>

        {isEditingText ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>
              <Textarea
                value={textForm.description}
                onChange={(e) =>
                  setTextForm({
                    ...textForm,
                    description: e.target.value.toUpperCase(),
                  })
                }
                placeholder="Hero description..."
                rows={3}
                className="text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Link Text
              </label>
              <Input
                value={textForm.textHref}
                onChange={(e) =>
                  setTextForm({ ...textForm, textHref: e.target.value })
                }
                placeholder="CHECK US OUT ;)"
                className="text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Link URL
              </label>
              <Input
                value={textForm.href}
                onChange={(e) =>
                  setTextForm({ ...textForm, href: e.target.value })
                }
                placeholder="#products"
                className="text-sm"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleTextSave} size="sm" className="flex-1">
                <Save className="mr-1 h-4 w-4" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditingText(false)}
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="group cursor-pointer rounded border bg-white p-3 transition-colors hover:bg-gray-50"
            onClick={() => setIsEditingText(true)}
            title="Click to edit hero text"
          >
            <p className="mb-2 text-sm text-gray-800 transition-colors group-hover:text-blue-600">
              {heroContent?.description || "No description set"}
            </p>
            <p className="text-xs text-gray-600 transition-colors group-hover:text-blue-500">
              Link: {heroContent?.textHref || "No link text"} →{" "}
              {heroContent?.href || "#"}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

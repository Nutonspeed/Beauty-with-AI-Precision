"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useTranslations } from "next-intl";
import {
  Phone,
  Calendar as CalendarIcon,
  Star,
  StickyNote,
  AlertCircle,
  X,
  Mic,
  Save,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AddNoteFormProps {
  customer_id: string;
  onSubmit: (data: {
    content: string;
    note_type?: string;
    tags?: string[];
    is_private?: boolean;
    is_pinned?: boolean;
    followup_date?: string;
  }) => Promise<void>;
  onCancel?: () => void;
}

const QUICK_TEMPLATES = (t: any) => [
  {
    id: "call",
    icon: Phone,
    label: `📞 ${t('customerNotes.types.call')}`,
    content: t('customerNotes.templates.call'),
  },
  {
    id: "meeting",
    icon: CalendarIcon,
    label: `💬 ${t('customerNotes.types.meeting')}`,
    content: t('customerNotes.templates.meeting'),
  },
  {
    id: "interest",
    icon: Star,
    label: `🎯 ${t('customerNotes.types.interest')}`,
    content: t('customerNotes.templates.interest'),
  },
  {
    id: "budget",
    icon: Sparkles,
    label: `💰 ${t('customerNotes.types.budget')}`,
    content: t('customerNotes.templates.budget'),
  },
  {
    id: "followup",
    icon: AlertCircle,
    label: `⏰ ${t('customerNotes.types.followup')}`,
    content: t('customerNotes.templates.followup'),
  },
  {
    id: "custom",
    icon: StickyNote,
    label: `📝 ${t('customerNotes.types.custom')}`,
    content: "",
  },
];

export function AddNoteForm({
  customer_id: _customer_id,
  onSubmit,
  onCancel,
}: AddNoteFormProps) {
  const t = useTranslations();
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [followupDate, setFollowupDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const templates = QUICK_TEMPLATES(t);
  const suggestedTags = t.raw('customerNotes.suggestedTags') as string[];

  // Handle template selection
  const handleTemplateSelect = (template: any) => {
    setContent(template.content);
    setNoteType(template.id === "custom" ? "general" : template.id);
  };

  // Handle tag addition
  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  // Handle voice recording (placeholder - needs implementation)
  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recognition
    // Will integrate with lib/voice-recognition.ts
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert(t('customerNotes.contentPlaceholder'));
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        content: content.trim(),
        note_type: noteType,
        tags,
        is_private: isPrivate,
        is_pinned: isPinned,
        followup_date: followupDate?.toISOString(),
      });

      // Reset form
      setContent("");
      setNoteType("general");
      setTags([]);
      setIsPrivate(false);
      setIsPinned(false);
      setFollowupDate(undefined);
    } catch (error) {
      console.error("Error submitting note:", error);
      alert(t('customerNotes.saveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Quick Templates */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          {t('customerNotes.quickTemplates')}
        </Label>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            {templates.map((template) => (
              <Button
                key={template.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTemplateSelect(template)}
                className="whitespace-nowrap"
              >
                {template.label}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Note Type */}
      <div>
        <Label htmlFor="note-type">{t('customerNotes.type')}</Label>
        <Select value={noteType} onValueChange={setNoteType}>
          <SelectTrigger id="note-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="call">{t('customerNotes.types.call')}</SelectItem>
            <SelectItem value="meeting">{t('customerNotes.types.meeting')}</SelectItem>
            <SelectItem value="followup">{t('customerNotes.types.followup')}</SelectItem>
            <SelectItem value="general">{t('customerNotes.types.general')}</SelectItem>
            <SelectItem value="important">{t('customerNotes.types.important')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="content">{t('customerNotes.content')}</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleVoiceRecord}
            className={cn(
              "h-7 px-2",
              isRecording && "text-red-600 animate-pulse"
            )}
          >
            <Mic className="h-4 w-4 mr-1" />
            {isRecording ? t('customerNotes.saving') : t('voice.record')}
          </Button>
        </div>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('customerNotes.contentPlaceholder')}
          className="min-h-[120px] resize-none"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {t('customerNotes.charCount', { count: content.length })}
        </p>
      </div>

      {/* Tags */}
      <div>
        <Label htmlFor="tags">{t('customerNotes.tags')}</Label>
        <div className="space-y-2">
          {/* Current Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                >
                  #{tag}
                  <X
                    className="ml-1 h-3 w-3"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}

          {/* Tag Input */}
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('customerNotes.tagPlaceholder')}
          />

          {/* Suggested Tags */}
          <div className="flex flex-wrap gap-1">
            {suggestedTags.filter((tag) => !tags.includes(tag)).map(
              (tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleAddTag(tag)}
                >
                  #{tag}
                </Badge>
              )
            )}
          </div>
        </div>
      </div>

      {/* Follow-up Date */}
      <div>
        <Label>{t('customerNotes.followupDate')}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !followupDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {followupDate ? (
                format(followupDate, "d MMMM yyyy", { locale: t('format.date') === '{date}' ? th : undefined })
              ) : (
                <span>{t('customerNotes.selectDate')}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={followupDate}
              onSelect={setFollowupDate}
              locale={t('format.date') === '{date}' ? th : undefined}
            />
          </PopoverContent>
        </Popover>
        {followupDate && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setFollowupDate(undefined)}
            className="mt-1 h-7 text-xs"
          >
            {t('customerNotes.clearDate')}
          </Button>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="pinned" className="cursor-pointer">
            {t('customerNotes.pin')}
          </Label>
          <Switch
            id="pinned"
            checked={isPinned}
            onCheckedChange={setIsPinned}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="private" className="cursor-pointer">
            {t('customerNotes.private')}
          </Label>
          <Switch
            id="private"
            checked={isPrivate}
            onCheckedChange={setIsPrivate}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t('customerNotes.saving')}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t('customerNotes.saveNote')}
            </>
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
        )}
      </div>
    </form>
  );
}

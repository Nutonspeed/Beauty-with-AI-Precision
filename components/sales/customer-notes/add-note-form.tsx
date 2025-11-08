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

const QUICK_TEMPLATES = [
  {
    id: "call",
    icon: Phone,
    label: "📞 โทรศัพท์",
    content: "โทรติดต่อลูกค้า:\n- เรื่อง: \n- ผลการติดต่อ: \n- ข้อตกลง: ",
  },
  {
    id: "meeting",
    icon: CalendarIcon,
    label: "💬 นัดหมาย",
    content: "พบลูกค้า:\n- สถานที่: \n- หัวข้อสนทนา: \n- สิ่งที่ลูกค้าสนใจ: ",
  },
  {
    id: "interest",
    icon: Star,
    label: "🎯 ความสนใจ",
    content: "ระดับความสนใจ:\n- บริการที่สนใจ: \n- งบประมาณ: \n- ความพร้อม: ",
  },
  {
    id: "budget",
    icon: Sparkles,
    label: "💰 งบประมาณ",
    content: "อภิปรายงบประมาณ:\n- ช่วงราคา: \n- วิธีชำระ: \n- โปรโมชั่น: ",
  },
  {
    id: "followup",
    icon: AlertCircle,
    label: "⏰ ติดตาม",
    content: "ติดตามลูกค้า:\n- เหตุผล: \n- กำหนดติดตาม: \n- สิ่งที่ต้องเตรียม: ",
  },
  {
    id: "custom",
    icon: StickyNote,
    label: "📝 กำหนดเอง",
    content: "",
  },
];

const SUGGESTED_TAGS = [
  "ให้ข้อมูล",
  "สนใจ",
  "รอตัดสินใจ",
  "เปรียบเทียบราคา",
  "ติดตามแล้ว",
  "นัดหมายแล้ว",
  "ร้อนแรง",
  "เย็นชา",
];

export function AddNoteForm({
  customer_id,
  onSubmit,
  onCancel,
}: AddNoteFormProps) {
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [followupDate, setFollowupDate] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Handle template selection
  const handleTemplateSelect = (template: typeof QUICK_TEMPLATES[0]) => {
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
      alert("กรุณาใส่เนื้อหาบันทึก");
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
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Quick Templates */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          เทมเพลตด่วน
        </Label>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            {QUICK_TEMPLATES.map((template) => (
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
        <Label htmlFor="note-type">ประเภทบันทึก</Label>
        <Select value={noteType} onValueChange={setNoteType}>
          <SelectTrigger id="note-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="call">โทรศัพท์</SelectItem>
            <SelectItem value="meeting">นัดหมาย</SelectItem>
            <SelectItem value="followup">ติดตาม</SelectItem>
            <SelectItem value="general">ทั่วไป</SelectItem>
            <SelectItem value="important">สำคัญ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="content">เนื้อหา</Label>
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
            {isRecording ? "กำลังบันทึก..." : "พูด"}
          </Button>
        </div>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="พิมพ์บันทึกของคุณ..."
          className="min-h-[120px] resize-none"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {content.length} ตัวอักษร
        </p>
      </div>

      {/* Tags */}
      <div>
        <Label htmlFor="tags">แท็ก</Label>
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
            placeholder="พิมพ์แท็กแล้วกด Enter"
          />

          {/* Suggested Tags */}
          <div className="flex flex-wrap gap-1">
            {SUGGESTED_TAGS.filter((tag) => !tags.includes(tag)).map(
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
        <Label>วันที่ติดตาม</Label>
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
                format(followupDate, "d MMMM yyyy", { locale: th })
              ) : (
                <span>เลือกวันที่</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={followupDate}
              onSelect={setFollowupDate}
              locale={th}
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
            ล้างวันที่
          </Button>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="pinned" className="cursor-pointer">
            ปักหมุดบันทึก
          </Label>
          <Switch
            id="pinned"
            checked={isPinned}
            onCheckedChange={setIsPinned}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="private" className="cursor-pointer">
            บันทึกส่วนตัว (เห็นเฉพาะคุณ)
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
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              บันทึก
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
            ยกเลิก
          </Button>
        )}
      </div>
    </form>
  );
}

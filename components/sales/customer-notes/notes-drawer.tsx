"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCustomerNotes, CustomerNote } from "@/hooks/useCustomerNotes";
import { AddNoteForm } from "./add-note-form";
import { formatDistanceToNow, format } from "date-fns";
import { th } from "date-fns/locale";
import {
  StickyNote,
  Phone,
  Calendar,
  Star,
  Lock,
  MoreVertical,
  Edit,
  Trash2,
  Pin,
  PinOff,
  Plus,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

interface NotesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer_id: string;
  customer_name?: string;
}

const NOTE_TYPE_CONFIG = {
  call: { icon: Phone, label: "โทรศัพท์", color: "bg-blue-100 text-blue-700" },
  meeting: { icon: Calendar, label: "นัดหมาย", color: "bg-purple-100 text-purple-700" },
  followup: { icon: AlertCircle, label: "ติดตาม", color: "bg-orange-100 text-orange-700" },
  general: { icon: StickyNote, label: "ทั่วไป", color: "bg-gray-100 text-gray-700" },
  important: { icon: Star, label: "สำคัญ", color: "bg-red-100 text-red-700" },
};

export function NotesDrawer({
  open,
  onOpenChange,
  customer_id,
  customer_name,
}: NotesDrawerProps) {
  const { notes, loading, error, refresh, deleteNote, pinNote, unpinNote, addNote } =
    useCustomerNotes(customer_id);

  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Toggle note expansion
  const toggleNote = (noteId: string) => {
    setExpandedNotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  // Handle delete confirmation
  const handleDeleteClick = (noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (noteToDelete) {
      await deleteNote(noteToDelete);
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  // Handle pin/unpin
  const handleTogglePin = async (note: CustomerNote) => {
    if (note.is_pinned) {
      await unpinNote(note.id);
    } else {
      await pinNote(note.id);
    }
  };

  // Handle note submission
  const handleAddNote = async (data: any) => {
    const result = await addNote(data);
    if (result) {
      setShowAddForm(false);
    }
  };

  // Separate pinned and unpinned notes
  const pinnedNotes = notes.filter((n) => n.is_pinned);
  const unpinnedNotes = notes.filter((n) => !n.is_pinned);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {showAddForm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  className="h-7 w-7 p-0 mr-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <StickyNote className="h-5 w-5" />
              {showAddForm ? "เพิ่มบันทึกใหม่" : "บันทึกลูกค้า"}
            </SheetTitle>
            {customer_name && !showAddForm && (
              <SheetDescription>{customer_name}</SheetDescription>
            )}
          </SheetHeader>

          <div className="mt-4 space-y-4">
            {showAddForm ? (
              /* Add Note Form */
              <ScrollArea className="h-[calc(100vh-120px)]">
                <AddNoteForm
                  customer_id={customer_id}
                  onSubmit={handleAddNote}
                  onCancel={() => setShowAddForm(false)}
                />
              </ScrollArea>
            ) : (
              <>
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="flex-1"
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    เพิ่มบันทึก
                  </Button>
                  <Button
                    onClick={refresh}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Error State */}
                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Notes List */}
                <ScrollArea className="h-[calc(100vh-200px)]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <StickyNote className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">ยังไม่มีบันทึก</p>
                  <p className="text-xs text-gray-400 mt-1">
                    คลิก "เพิ่มบันทึก" เพื่อเริ่มต้น
                  </p>
                </div>
              ) : (
                <div className="space-y-3 pb-4">
                  {/* Pinned Notes */}
                  {pinnedNotes.length > 0 && (
                    <>
                      {pinnedNotes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          expanded={expandedNotes.has(note.id)}
                          onToggle={() => toggleNote(note.id)}
                          onDelete={() => handleDeleteClick(note.id)}
                          onTogglePin={() => handleTogglePin(note)}
                        />
                      ))}
                      {unpinnedNotes.length > 0 && (
                        <Separator className="my-3" />
                      )}
                    </>
                  )}

                  {/* Unpinned Notes */}
                  {unpinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      expanded={expandedNotes.has(note.id)}
                      onToggle={() => toggleNote(note.id)}
                      onDelete={() => handleDeleteClick(note.id)}
                      onTogglePin={() => handleTogglePin(note)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบบันทึกนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Note Card Component
interface NoteCardProps {
  note: CustomerNote;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

function NoteCard({
  note,
  expanded,
  onToggle,
  onDelete,
  onTogglePin,
}: NoteCardProps) {
  const config = NOTE_TYPE_CONFIG[note.note_type] || NOTE_TYPE_CONFIG.general;
  const Icon = config.icon;

  // Truncate content for preview
  const previewContent =
    note.content.length > 100
      ? note.content.substring(0, 100) + "..."
      : note.content;

  return (
    <div
      className={`relative rounded-lg border p-3 transition-all ${
        note.is_pinned ? "border-yellow-300 bg-yellow-50" : "border-gray-200 bg-white"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1">
          <Badge variant="secondary" className={config.color}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>

          {note.is_private && (
            <Badge variant="outline" className="text-xs">
              <Lock className="h-3 w-3 mr-1" />
              ส่วนตัว
            </Badge>
          )}

          {note.is_pinned && (
            <Pin className="h-3 w-3 text-yellow-600" />
          )}
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onTogglePin}>
              {note.is_pinned ? (
                <>
                  <PinOff className="mr-2 h-4 w-4" />
                  ยกเลิกปักหมุด
                </>
              ) : (
                <>
                  <Pin className="mr-2 h-4 w-4" />
                  ปักหมุด
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              แก้ไข
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              ลบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <button
        onClick={onToggle}
        className="cursor-pointer text-sm text-gray-700 mb-2 w-full text-left"
        type="button"
      >
        {expanded ? (
          <p className="whitespace-pre-wrap">{note.content}</p>
        ) : (
          <p>{previewContent}</p>
        )}
      </button>

      {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {note.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{note.created_by_name}</span>
        <span>
          {formatDistanceToNow(new Date(note.created_at), {
            addSuffix: true,
            locale: th,
          })}
        </span>
      </div>

      {/* Follow-up Date */}
      {note.followup_date && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-orange-600">
            <Calendar className="h-3 w-3" />
            ติดตาม: {format(new Date(note.followup_date), "d MMM yyyy", { locale: th })}
          </div>
        </div>
      )}
    </div>
  );
}

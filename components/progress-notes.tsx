"use client"

/**
 * Progress Notes Component
 * 
 * Note-taking and documentation for treatment sessions.
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { FileText, Plus, Edit, Trash2, Lock, User } from "lucide-react"
import { useTreatmentNotes } from "@/hooks/useTreatment"

interface ProgressNotesProps {
  treatmentId: string
  currentUserId?: string
  currentUserName?: string
  currentUserRole?: string
}

export default function ProgressNotes({
  treatmentId,
  currentUserId = "DOC001",
  currentUserName = "Dr. Lisa Wong",
  currentUserRole = "Dermatologist",
}: ProgressNotesProps) {
  const { notes, loading, addNote, updateNote, deleteNote } = useTreatmentNotes(treatmentId, {
    includePrivate: true,
  })

  const [isAdding, setIsAdding] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteContent, setNoteContent] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)

  const handleAddNote = () => {
    if (!noteContent.trim()) return

    addNote({
      treatmentId,
      authorId: currentUserId,
      authorName: currentUserName,
      authorRole: currentUserRole,
      content: noteContent,
      isPrivate,
      attachments: [],
    })

    setNoteContent("")
    setIsPrivate(false)
    setIsAdding(false)
  }

  const handleUpdateNote = (noteId: string) => {
    if (!noteContent.trim()) return

    updateNote(noteId, {
      content: noteContent,
      isPrivate,
    })

    setNoteContent("")
    setIsPrivate(false)
    setEditingNoteId(null)
  }

  const handleEditClick = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId)
    if (note) {
      setNoteContent(note.content)
      setIsPrivate(note.isPrivate)
      setEditingNoteId(noteId)
      setIsAdding(false)
    }
  }

  const handleCancel = () => {
    setNoteContent("")
    setIsPrivate(false)
    setIsAdding(false)
    setEditingNoteId(null)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading notes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Add Note Button */}
      {!isAdding && !editingNoteId && (
        <Button onClick={() => setIsAdding(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add New Note
        </Button>
      )}

      {/* Add/Edit Note Form */}
      {(isAdding || editingNoteId) && (
        <Card className="border-blue-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {editingNoteId ? "Edit Note" : "New Note"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Textarea
                placeholder="Enter your note here..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="private"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
              />
              <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                <Lock className="w-4 h-4" />
                Private note (visible to doctors only)
              </Label>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() =>
                  editingNoteId ? handleUpdateNote(editingNoteId) : handleAddNote()
                }
                disabled={!noteContent.trim()}
              >
                {editingNoteId ? "Update Note" : "Add Note"}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No notes yet</p>
                <p className="text-sm text-gray-400 mt-2">Add your first note to start documenting</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          notes.map((note) => (
            <Card key={note.id} className={note.isPrivate ? "border-yellow-200 bg-yellow-50/30" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{note.authorName}</p>
                      <p className="text-gray-500">{note.authorRole}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {note.isPrivate && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        <Lock className="w-3 h-3 mr-1" />
                        Private
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
                  </div>
                </div>

                <p className="text-gray-700 whitespace-pre-wrap mb-3">{note.content}</p>

                {note.updatedAt && note.updatedAt.getTime() !== note.createdAt.getTime() && (
                  <p className="text-xs text-gray-400 mb-3">
                    Edited {formatDate(note.updatedAt)}
                  </p>
                )}

                {note.authorId === currentUserId && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClick(note.id)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this note?")) {
                          deleteNote(note.id)
                        }
                      }}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

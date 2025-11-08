"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StickyNote } from "lucide-react";
import { NotesDrawer } from "./notes-drawer";
import { useCustomerNotes } from "@/hooks/useCustomerNotes";
import { cn } from "@/lib/utils";

interface FloatingNotesButtonProps {
  customer_id: string;
  customer_name?: string;
  className?: string;
  position?: "bottom-right" | "bottom-left";
}

export function FloatingNotesButton({
  customer_id,
  customer_name,
  className,
  position = "bottom-right",
}: FloatingNotesButtonProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { notes = [] } = useCustomerNotes(customer_id);

  // Count unread reminders (follow-ups due today or past)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueReminders = notes?.filter((note) => {
    if (!note.followup_date || note.reminder_sent) return false;
    const followupDate = new Date(note.followup_date);
    followupDate.setHours(0, 0, 0, 0);
    return followupDate <= today;
  }).length ?? 0;

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
  };

  return (
    <>
      {/* Floating Button */}
      <div
        className={cn(
          "fixed z-50",
          positionClasses[position],
          className
        )}
      >
        <Button
          onClick={() => setDrawerOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all relative"
        >
          <StickyNote className="h-6 w-6" />
          
          {/* Badge for overdue reminders */}
          {overdueReminders > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {overdueReminders}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notes Drawer */}
      <NotesDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        customer_id={customer_id}
        customer_name={customer_name}
      />
    </>
  );
}

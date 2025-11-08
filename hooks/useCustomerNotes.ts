import { useState, useEffect, useCallback } from 'react';

export interface CustomerNote {
  id: string;
  customer_id: string;
  sales_staff_id: string;
  clinic_id: string;
  content: string;
  note_type: 'call' | 'meeting' | 'followup' | 'general' | 'important';
  tags: string[];
  is_private: boolean;
  is_pinned: boolean;
  followup_date?: string;
  reminder_sent: boolean;
  related_scan_id?: string;
  related_proposal_id?: string;
  attachments?: Array<{
    type: 'image' | 'audio' | 'document';
    url: string;
    filename: string;
  }>;
  created_at: string;
  updated_at: string;
  created_by_name: string;
  updated_by_name?: string;
}

interface UseCustomerNotesOptions {
  include_private?: boolean;
  pinned_only?: boolean;
  auto_refresh?: boolean;
  refresh_interval?: number;
}

interface UseCustomerNotesReturn {
  notes: CustomerNote[];
  loading: boolean;
  error: string | null;
  count: number;
  
  // Actions
  addNote: (data: {
    content: string;
    note_type?: string;
    tags?: string[];
    is_private?: boolean;
    is_pinned?: boolean;
    followup_date?: string;
    related_scan_id?: string;
    related_proposal_id?: string;
  }) => Promise<CustomerNote | null>;
  
  updateNote: (id: string, data: {
    content?: string;
    note_type?: string;
    tags?: string[];
    is_private?: boolean;
    is_pinned?: boolean;
    followup_date?: string;
  }) => Promise<CustomerNote | null>;
  
  deleteNote: (id: string) => Promise<boolean>;
  
  pinNote: (id: string) => Promise<boolean>;
  unpinNote: (id: string) => Promise<boolean>;
  
  refresh: () => Promise<void>;
}

/**
 * Hook for managing customer notes
 * 
 * @param customer_id - Customer UUID
 * @param options - Hook options
 */
export function useCustomerNotes(
  customer_id: string | null | undefined,
  options: UseCustomerNotesOptions = {}
): UseCustomerNotesReturn {
  const {
    include_private = true,
    pinned_only = false,
    auto_refresh = false,
    refresh_interval = 30000
  } = options;

  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    if (!customer_id) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        customer_id,
        include_private: include_private.toString(),
        pinned_only: pinned_only.toString()
      });

      const response = await fetch(`/api/customer-notes?${params}`);
      
      // Handle non-JSON responses (e.g., HTML error pages)
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.warn('Customer notes API returned non-JSON response, table may not exist yet');
        setNotes([]);
        setError('Customer notes feature not available');
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        // Graceful degradation for missing table/feature
        if (response.status === 500 && result.details?.includes('relation "customer_notes" does not exist')) {
          console.warn('customer_notes table does not exist yet - feature disabled');
          setNotes([]);
          setError(null); // Don't show error to user
          return;
        }
        
        throw new Error(result.error || 'Failed to fetch notes');
      }

      setNotes(result.data || []);
    } catch (err) {
      console.error('Error fetching customer notes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Don't show errors for missing features
      if (errorMessage.includes('does not exist')) {
        setError(null);
      } else {
        setError(errorMessage);
      }
      
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [customer_id, include_private, pinned_only]);

  // Initial fetch
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Auto refresh
  useEffect(() => {
    if (!auto_refresh || !customer_id) return;

    const interval = setInterval(() => {
      fetchNotes();
    }, refresh_interval);

    return () => clearInterval(interval);
  }, [auto_refresh, customer_id, refresh_interval, fetchNotes]);

  // Add note
  const addNote = useCallback(async (data: {
    content: string;
    note_type?: string;
    tags?: string[];
    is_private?: boolean;
    is_pinned?: boolean;
    followup_date?: string;
    related_scan_id?: string;
    related_proposal_id?: string;
  }): Promise<CustomerNote | null> => {
    if (!customer_id) return null;

    try {
      const response = await fetch('/api/customer-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id,
          ...data
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create note');
      }

      // Add to local state
      setNotes(prev => [result.data, ...prev]);
      
      return result.data;
    } catch (err) {
      console.error('Error adding note:', err);
      setError(err instanceof Error ? err.message : 'Failed to add note');
      return null;
    }
  }, [customer_id]);

  // Update note
  const updateNote = useCallback(async (id: string, data: {
    content?: string;
    note_type?: string;
    tags?: string[];
    is_private?: boolean;
    is_pinned?: boolean;
    followup_date?: string;
  }): Promise<CustomerNote | null> => {
    try {
      const response = await fetch('/api/customer-notes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update note');
      }

      // Update local state
      setNotes(prev => prev.map(note => 
        note.id === id ? result.data : note
      ));

      return result.data;
    } catch (err) {
      console.error('Error updating note:', err);
      setError(err instanceof Error ? err.message : 'Failed to update note');
      return null;
    }
  }, []);

  // Delete note
  const deleteNote = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/customer-notes?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete note');
      }

      // Remove from local state
      setNotes(prev => prev.filter(note => note.id !== id));

      return true;
    } catch (err) {
      console.error('Error deleting note:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      return false;
    }
  }, []);

  // Pin note
  const pinNote = useCallback(async (id: string): Promise<boolean> => {
    const result = await updateNote(id, { is_pinned: true });
    return result !== null;
  }, [updateNote]);

  // Unpin note
  const unpinNote = useCallback(async (id: string): Promise<boolean> => {
    const result = await updateNote(id, { is_pinned: false });
    return result !== null;
  }, [updateNote]);

  return {
    notes,
    loading,
    error,
    count: notes.length,
    addNote,
    updateNote,
    deleteNote,
    pinNote,
    unpinNote,
    refresh: fetchNotes
  };
}

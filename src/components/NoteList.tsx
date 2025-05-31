// src/components/NoteList.tsx
import React, { useEffect, useState } from 'react';

import { subscribeToNotes } from '../services/noteService';
import { Note, Notes } from '../types/Note';
import NoteItem from './NoteItem';

interface NoteListProps {
  onEditNote?: (note: Note) => void;
}

const NoteList: React.FC<NoteListProps> = ({ onEditNote }) => {
  // State for notes, loading status, and error message
  const [notes, setNotes] = useState<Notes>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notes using subscribeToNotes from noteService
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToNotes(
        (loadedNotes) => {
          setNotes(loadedNotes);
          setIsLoading(false);
        },
        (err) => {
          setError(err.message || 'Failed to load notes');
          setIsLoading(false);
        },
      );

      // Return cleanup function to unsubscribe when component unmounts
      return () => {
        unsubscribe();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
      setIsLoading(false);
    }
  }, []); // Empty dependency array ensures this runs once on mount

  // Show loading state
  if (isLoading) {
    return (
      <div className="note-list">
        <h2>Notes</h2>
        <p>Loading notes...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="note-list">
        <h2>Notes</h2>
        <div className="error-message" style={{ color: 'red' }}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="note-list">
      <h2>Notes</h2>
      {Object.values(notes).length === 0 ? (
        <p>No notes yet. Create your first note!</p>
      ) : (
        <div className="notes-container">
          {Object.values(notes)
            // Sort by lastUpdated (most recent first)
            .sort((a, b) => b.lastUpdated - a.lastUpdated)
            .map((note) => (
              <NoteItem key={note.id} note={note} onEdit={onEditNote} />
            ))}
        </div>
      )}
    </div>
  );
};

export default NoteList;

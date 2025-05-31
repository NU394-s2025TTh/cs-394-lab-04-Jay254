// src/components/NoteEditor.tsx
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { saveNote } from '../services/noteService';
import { Note } from '../types/Note';

interface NoteEditorProps {
  initialNote?: Note;
  onSave?: (note: Note) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ initialNote, onSave }) => {
  // State for the current note being edited
  const [note, setNote] = useState<Note>(() => {
    return (
      initialNote || {
        id: uuidv4(),
        title: '',
        content: '',
        lastUpdated: Date.now(),
      }
    );
  });

  // State for saving status
  const [isSaving, setIsSaving] = useState(false);

  // State for error handling
  const [error, setError] = useState<string | null>(null);

  // Update local state when initialNote changes
  useEffect(() => {
    if (initialNote) {
      setNote(initialNote);
    } else {
      setNote({
        id: uuidv4(),
        title: '',
        content: '',
        lastUpdated: Date.now(),
      });
    }
  }, [initialNote]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission with empty fields
    if (!note.title.trim() || !note.content.trim()) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await saveNote(note);

      // Call the onSave callback if provided
      if (onSave) {
        onSave(note);
      }

      // Clear form after saving a new note (not when updating existing note)
      if (!initialNote) {
        setNote({
          id: uuidv4(),
          title: '',
          content: '',
          lastUpdated: Date.now(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNote((prev) => ({
      ...prev,
      title: e.target.value,
      lastUpdated: Date.now(),
    }));
  };

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote((prev) => ({
      ...prev,
      content: e.target.value,
      lastUpdated: Date.now(),
    }));
  };

  return (
    <form className="note-editor" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={note.title}
          onChange={handleTitleChange}
          disabled={isSaving}
          required
          placeholder="Enter note title"
        />
      </div>
      <div className="form-group">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          value={note.content}
          onChange={handleContentChange}
          disabled={isSaving}
          rows={5}
          required
          placeholder="Enter note content"
        />
      </div>
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      <div className="form-actions">
        <button
          type="submit"
          disabled={isSaving || !note.title.trim() || !note.content.trim()}
        >
          {isSaving ? 'Saving...' : initialNote ? 'Update Note' : 'Save Note'}
        </button>
      </div>
    </form>
  );
};

export default NoteEditor;

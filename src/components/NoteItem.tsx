// src/components/NoteItem.tsx
import React, { useState } from 'react';

import { deleteNote } from '../services/noteService';
import { Note } from '../types/Note';

interface NoteItemProps {
  note: Note;
  onEdit?: (note: Note) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onEdit }) => {
  // State for deleting status and error message
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle delete action
  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this note?');

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteNote(note.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note.');
      setIsDeleting(false);
    }
    // Note: We don't set isDeleting to false on success because the component
    // will likely be unmounted when the note is deleted from the list
  };

  // Handle edit action
  const handleEdit = () => {
    if (onEdit) {
      onEdit(note);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);

    // Format: "Jan 1, 2023, 3:45 PM"
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  // Calculate time ago for display
  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    let interval = Math.floor(seconds / 31536000); // years
    if (interval >= 1) {
      return `${interval} year${interval === 1 ? '' : 's'} ago`;
    }

    interval = Math.floor(seconds / 2592000); // months
    if (interval >= 1) {
      return `${interval} month${interval === 1 ? '' : 's'} ago`;
    }

    interval = Math.floor(seconds / 86400); // days
    if (interval >= 1) {
      return `${interval} day${interval === 1 ? '' : 's'} ago`;
    }

    interval = Math.floor(seconds / 3600); // hours
    if (interval >= 1) {
      return `${interval} hour${interval === 1 ? '' : 's'} ago`;
    }

    interval = Math.floor(seconds / 60); // minutes
    if (interval >= 1) {
      return `${interval} minute${interval === 1 ? '' : 's'} ago`;
    }

    return 'just now';
  };

  return (
    <div className="note-item">
      <div className="note-header">
        <h3>{note.title}</h3>
        <div className="note-actions">
          {onEdit && (
            <button className="edit-button" onClick={handleEdit} disabled={isDeleting}>
              Edit
            </button>
          )}
          <button className="delete-button" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
      <div className="note-content">{note.content}</div>
      <div className="note-footer">
        <span title={formatDate(note.lastUpdated)}>
          Last updated: {getTimeAgo(note.lastUpdated)}
        </span>
      </div>
      {error && (
        <div className="error-message" style={{ color: 'red', marginTop: '0.5rem' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default NoteItem;

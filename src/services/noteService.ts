// src/services/noteService.ts
import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  onSnapshot,
  QuerySnapshot,
  setDoc,
  Unsubscribe,
} from 'firebase/firestore';

import { db } from '../firebase-config';
import { Note, Notes } from '../types/Note';

const NOTES_COLLECTION = 'notes';

/**
 * Creates or updates a note in Firestore
 * @param note Note object to save
 * @returns Promise that resolves when the note is saved
 */
export async function saveNote(note: Note): Promise<void> {
  // Create a document reference using the collection and note ID
  const noteRef = doc(collection(db, NOTES_COLLECTION), note.id);

  // Save the note to Firestore
  await setDoc(noteRef, note);
}

/**
 * Deletes a note from Firestore
 * @param noteId ID of the note to delete
 * @returns Promise that resolves when the note is deleted
 */
export async function deleteNote(noteId: string): Promise<void> {
  // Create a document reference using the collection and note ID
  const noteRef = doc(collection(db, NOTES_COLLECTION), noteId);

  // Delete the note from Firestore
  await deleteDoc(noteRef);
}

/**
 * Transforms a Firestore snapshot into a Notes object
 * @param snapshot Firestore query snapshot
 * @returns Notes object with note ID as keys
 */
export function transformSnapshot(snapshot: QuerySnapshot<DocumentData>): Notes {
  const notes: Notes = {};

  snapshot.docs.forEach((doc) => {
    const noteData = doc.data() as Note;
    notes[doc.id] = noteData;
  });

  return notes;
}

/**
 * Subscribes to changes in the notes collection
 * @param onNotesChange Callback function to be called when notes change
 * @param onError Optional error handler for testing
 * @returns Unsubscribe function to stop listening for changes
 */
export function subscribeToNotes(
  onNotesChange: (notes: Notes) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  try {
    // Get a reference to the notes collection
    const notesCollection = collection(db, NOTES_COLLECTION);

    // Subscribe to the collection using onSnapshot
    const unsubscribe = onSnapshot(
      notesCollection,
      (snapshot) => {
        // Transform the snapshot and call the callback
        const notes = transformSnapshot(snapshot);
        onNotesChange(notes);
      },
      (error) => {
        // Handle errors by calling the error callback if provided
        if (onError) {
          onError(error);
        } else {
          // If no error handler provided, re-throw the error
          throw error;
        }
      },
    );

    // Return the unsubscribe function
    return unsubscribe;
  } catch (error) {
    // Handle synchronous errors (e.g., invalid collection reference)
    if (onError) {
      onError(error instanceof Error ? error : new Error('Unknown error'));
    } else {
      throw error;
    }

    // Return a no-op unsubscribe function
    return () => {};
  }
}

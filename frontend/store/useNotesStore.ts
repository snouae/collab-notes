import { create } from 'zustand';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type NoteVisibility = 'PRIVATE' | 'SHARED' | 'PUBLIC';

export interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  tags: Tag[];
  visibility: NoteVisibility;
  owner_id: number;
  shared_with?: string[];
  public_token?: string | null;
}

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  visibilityFilter: string;
  selectedTags: string[];
  setSearchQuery: (query: string) => void;
  setVisibilityFilter: (visibility: string) => void;
  setSelectedTags: (tags: string[]) => void;
  fetchNotes: () => Promise<void>;
  createNote: (noteData: { title: string; content: string; visibility: NoteVisibility; tags: string[] }) => Promise<void>;
  updateNote: (id: number, noteData: { title: string; content: string; visibility: NoteVisibility; tags: string[] }) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  shareNote: (id: number, userEmail: string) => Promise<void>;
  generatePublicLink: (id: number) => Promise<{ public_url: string; public_token: string }>;
  revokePublicLink: (id: number) => Promise<void>;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  visibilityFilter: 'all',
  selectedTags: [],

  setSearchQuery: (query) => set({ searchQuery: query }),
  setVisibilityFilter: (visibility) => set({ visibilityFilter: visibility }),
  setSelectedTags: (tags) => set({ selectedTags: tags }),

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const { searchQuery, visibilityFilter, selectedTags } = get();
      
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (visibilityFilter !== 'all') params.append('visibility', visibilityFilter);
      if (selectedTags.length > 0) {
        selectedTags.forEach(tag => params.append('tags', tag));
      }

      const response = await fetch(`${API_BASE_URL}/api/notes?${params}`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }

      const notes = await response.json();
      set({ notes });
    } catch (error) {
      if (error instanceof Error && error.message.includes('authentication token')) {

        window.location.href = '/login';
        return;
      }
      set({ error: 'Failed to fetch notes' });
      console.error('Error fetching notes:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createNote: async (noteData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(noteData),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create note');
      }

      const newNote = await response.json();
      set((state) => ({ notes: [newNote, ...state.notes] }));
    } catch (error) {
      if (error instanceof Error && error.message.includes('authentication token')) {
        window.location.href = '/login';
        return;
      }
      set({ error: 'Failed to create note' });
      console.error('Error creating note:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateNote: async (id, noteUpdate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(noteUpdate),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update note');
      }

      const updatedNote = await response.json();
      set((state) => ({
        notes: state.notes.map((note) =>
          note.id === id ? updatedNote : note
        ),
      }));
    } catch (error) {
      if (error instanceof Error && error.message.includes('authentication token')) {
        window.location.href = '/login';
        return;
      }
      set({ error: 'Failed to update note' });
      console.error('Error updating note:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteNote: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete note');
      }

      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
      }));
    } catch (error) {
      if (error instanceof Error && error.message.includes('authentication token')) {
        window.location.href = '/login';
        return;
      }
      set({ error: 'Failed to delete note' });
      console.error('Error deleting note:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  shareNote: async (id, userEmail) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes/${id}/share`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_email: userEmail }),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to share note');
      }

      const updatedNote = await response.json();
      set((state) => ({
        notes: state.notes.map((note) =>
          note.id === id ? updatedNote : note
        ),
      }));
    } catch (error) {
      if (error instanceof Error && error.message.includes('authentication token')) {
        window.location.href = '/login';
        return;
      }
      set({ error: 'Failed to share note' });
      console.error('Error sharing note:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  generatePublicLink: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes/${id}/public-link`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate public link');
      }

      const linkData = await response.json();
      return linkData;
    } catch (error) {
      if (error instanceof Error && error.message.includes('authentication token')) {
        window.location.href = '/login';
        return;
      }
      set({ error: 'Failed to generate public link' });
      console.error('Error generating public link:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  revokePublicLink: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes/${id}/public-link`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to revoke public link');
      }

      
      set((state) => ({
        notes: state.notes.map((note) =>
          note.id === id ? { ...note, public_token: null } : note
        ),
      }));
    } catch (error) {
      if (error instanceof Error && error.message.includes('authentication token')) {
        window.location.href = '/login';
        return;
      }
      set({ error: 'Failed to revoke public link' });
      console.error('Error revoking public link:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
})); 
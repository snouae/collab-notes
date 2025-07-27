'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useNotesStore, type NoteVisibility } from '@/store/useNotesStore';
import { useAuth } from '@/components/providers/AuthProvider';
import NoteEditor from '@/components/NoteEditor';
import { toast } from 'react-hot-toast';

export default function EditNotePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { notes, updateNote } = useNotesStore();
  const [isLoading, setIsLoading] = useState(false);

  const note = notes.find((n) => n.id === parseInt(params.id as string, 10));
  const isOwner = user && note && note.owner_id === user.id;

  useEffect(() => {
    if (!note) {
      router.push('/dashboard/notes');
      return;
    }

    // Check if user owns the note
    if (!isOwner) {
      toast.error('Vous n\'avez pas la permission de modifier cette note');
      router.push('/dashboard/notes');
      return;
    }
  }, [note, isOwner, router]);

  const handleSubmit = async (data: {
    title: string;
    content: string;
    visibility: NoteVisibility;
    tags: string[];
  }) => {
    setIsLoading(true);
    try {
      await updateNote(parseInt(params.id as string, 10), data);
      toast.success('Note mise à jour avec succès');
      router.push('/dashboard/notes');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Erreur lors de la mise à jour de la note');
    } finally {
      setIsLoading(false);
    }
  };

  if (!note || !isOwner) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-2">Modifier la note</h1>
        <p className="mt-1 text-muted-foreground">
          Modifiez votre note et cliquez sur Mettre à jour pour sauvegarder les changements.
        </p>
      </div>

      <div className="card">
        <NoteEditor
          initialData={{
            title: note.title,
            content: note.content,
            visibility: note.visibility,
            tags: note.tags.map(tag => tag.name),
          }}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Mettre à jour"
        />
      </div>
    </div>
  );
} 
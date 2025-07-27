'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotesStore, type NoteVisibility } from '@/store/useNotesStore';
import NoteEditor from '@/components/NoteEditor';
import { toast } from 'react-hot-toast';

export default function NewNotePage() {
  const router = useRouter();
  const { createNote } = useNotesStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: {
    title: string;
    content: string;
    visibility: NoteVisibility;
    tags: string[];
  }) => {
    setIsLoading(true);
    try {
      await createNote(data);
      toast.success('Note créée avec succès');
      router.push('/dashboard/notes');
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Erreur lors de la création de la note');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-2">Nouvelle note</h1>
        <p className="mt-1 text-muted-foreground">
          Créez une nouvelle note avec support Markdown et options de partage.
        </p>
      </div>

      <div className="card">
        <NoteEditor
          initialData={{
            title: '',
            content: '',
            visibility: 'PRIVATE',
            tags: [],
          }}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Créer"
        />
      </div>
    </div>
  );
} 
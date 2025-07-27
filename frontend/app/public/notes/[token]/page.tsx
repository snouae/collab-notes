'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface PublicNote {
  id: number;
  title: string;
  content: string;
  visibility: string;
  created_at: string;
  updated_at?: string;
  tags: Array<{ id: number; name: string; created_at: string }>;
  public_token: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function PublicNotePage() {
  const params = useParams();
  const [note, setNote] = useState<PublicNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicNote = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/public/notes/${params.token}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Note non trouvée ou lien expiré');
          } else {
            setError('Erreur lors du chargement de la note');
          }
          return;
        }

        const noteData = await response.json();
        setNote(noteData);
      } catch (error) {
        console.error('Error fetching public note:', error);
        setError('Erreur lors du chargement de la note');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.token) {
      fetchPublicNote();
    }
  }, [params.token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement de la note...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-1 text-red-600 mb-4">Erreur</h1>
          <p className="text-muted-foreground mb-6">{error || 'Note non trouvée'}</p>
          <Link href="/" className="button-primary">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="heading-1">{note.title}</h1>
            <Link href="/" className="button-secondary">
              Retour à l&apos;accueil
            </Link>
          </div>
          
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-x-4">
            <span className="badge badge-outline">
              Note publique
            </span>
            <span className="text-sm text-muted-foreground">
              Créée le{' '}
              {format(new Date(note.created_at), 'dd MMM yyyy à HH:mm', {
                locale: fr,
              })}
              {note.updated_at && (
                <>
                  {' • '}
                  Modifiée le{' '}
                  {format(new Date(note.updated_at), 'dd MMM yyyy à HH:mm', {
                    locale: fr,
                  })}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span key={tag.id} className="badge badge-outline">
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Note content */}
        <div className="card">
          <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {note.content || '*Aucun contenu*'}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Cette note est partagée publiquement via CollabNotes
          </p>
        </div>
      </div>
    </div>
  );
} 
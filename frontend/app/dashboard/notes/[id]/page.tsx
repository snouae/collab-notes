'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useNotesStore, type NoteVisibility } from '@/store/useNotesStore';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'react-hot-toast';

const getVisibilityBadgeClass = (visibility: NoteVisibility) => {
  switch (visibility) {
    case 'PRIVATE':
      return 'badge badge-secondary';
    case 'SHARED':
      return 'badge badge-primary';
    case 'PUBLIC':
      return 'badge badge-outline';
    default:
      return 'badge badge-outline';
  }
};

const getVisibilityLabel = (visibility: NoteVisibility) => {
  switch (visibility) {
    case 'PRIVATE':
      return 'Privé';
    case 'SHARED':
      return 'Partagé';
    case 'PUBLIC':
      return 'Public';
    default:
      return visibility;
  }
};

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { notes, shareNote, generatePublicLink, revokePublicLink } = useNotesStore();
  const [isSharing, setIsSharing] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isRevokingLink, setIsRevokingLink] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  const note = notes.find((n) => n.id === parseInt(params.id as string, 10));
  const isOwner = user && note && note.owner_id === user.id;

  useEffect(() => {
    if (!note) {
      router.push('/dashboard/notes');
    }
  }, [note, router]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail.trim()) return;

    // Prevent sharing with yourself
    if (user && shareEmail.trim().toLowerCase() === user.email.toLowerCase()) {
      toast.error('Vous ne pouvez pas partager une note avec vous-même');
      return;
    }

    setIsSharing(true);
    try {
      await shareNote(parseInt(params.id as string, 10), shareEmail);
      toast.success('Note partagée avec succès');
      setShareEmail('');
    } catch (error: any) {
      console.error('Error sharing note:', error);
      // Show specific error messages
      if (error.message?.includes('User not found')) {
        toast.error('Utilisateur non trouvé. Vérifiez l\'adresse email.');
      } else if (error.message?.includes('Cannot share with yourself')) {
        toast.error('Vous ne pouvez pas partager une note avec vous-même');
      } else {
        toast.error('Erreur lors du partage de la note');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleGeneratePublicLink = async () => {
    if (!note) return;
    
    setIsGeneratingLink(true);
    try {
      const linkData = await generatePublicLink(note.id);
      const fullUrl = `${window.location.origin}/public/notes/${linkData.public_token}`;
      setPublicUrl(fullUrl);
      toast.success('Lien public généré avec succès');
    } catch (error: any) {
      console.error('Error generating public link:', error);
      toast.error('Erreur lors de la génération du lien public');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleRevokePublicLink = async () => {
    if (!note) return;
    
    setIsRevokingLink(true);
    try {
      await revokePublicLink(note.id);
      setPublicUrl(null);
      toast.success('Lien public révoqué avec succès');
    } catch (error: any) {
      console.error('Error revoking public link:', error);
      toast.error('Erreur lors de la révocation du lien public');
    } finally {
      setIsRevokingLink(false);
    }
  };

  const handleCopyPublicLink = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      toast.success('Lien copié dans le presse-papiers');
    }
  };

  // Set public URL if note has a public token
  useEffect(() => {
    if (note && note.public_token && !publicUrl) {
      const fullUrl = `${window.location.origin}/public/notes/${note.public_token}`;
      setPublicUrl(fullUrl);
    }
  }, [note, publicUrl]);

  if (!note) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="heading-2">{note.title}</h1>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-x-2">
            <span className={getVisibilityBadgeClass(note.visibility)}>
              {getVisibilityLabel(note.visibility)}
            </span>
            <span className="text-sm text-muted-foreground">
              Modifié le{' '}
              {(() => {
                const updateDate = note.updated_at || note.created_at;
                if (updateDate) {
                  try {
                    return format(new Date(updateDate), 'dd MMM yyyy à HH:mm', {
                      locale: fr,
                    });
                  } catch (error) {
                    return 'Date inconnue';
                  }
                }
                return 'Date inconnue';
              })()}
            </span>
          </div>
        </div>
        {isOwner && (
          <Link
            href={`/dashboard/notes/${note.id}/edit`}
            className="button-primary w-fit"
          >
            Modifier
          </Link>
        )}
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <span key={tag.id} className="badge badge-outline">
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Share form - only show for owners */}
      {isOwner && note.visibility !== 'PUBLIC' && (
        <div className="card">
          <h2 className="heading-3 mb-4">Partager la note</h2>
          <form onSubmit={handleShare} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="Email de l'utilisateur"
              className="input-primary flex-1"
              required
            />
            <button
              type="submit"
              disabled={isSharing || !shareEmail.trim()}
              className="button-primary"
            >
              {isSharing ? 'Partage...' : 'Partager'}
            </button>
          </form>
        </div>
      )}

      {/* Public link section - only show for owners */}
      {isOwner && (
        <div className="card">
          <h2 className="heading-3 mb-4">Lien public</h2>
          {publicUrl ? (
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={publicUrl}
                  readOnly
                  className="input-primary flex-1 text-sm"
                />
                <button
                  onClick={handleCopyPublicLink}
                  className="button-secondary"
                >
                  Copier
                </button>
                <button
                  onClick={handleRevokePublicLink}
                  disabled={isRevokingLink}
                  className="button-secondary text-red-600 hover:text-red-700"
                >
                  {isRevokingLink ? '...' : 'Révoquer'}
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Ce lien permet à quiconque d&apos;accéder à votre note en lecture seule.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleGeneratePublicLink}
                disabled={isGeneratingLink}
                className="button-primary"
              >
                {isGeneratingLink ? '...' : 'Générer un lien public'}
              </button>
              <p className="text-sm text-muted-foreground">
                Créez un lien public pour partager cette note avec n&apos;importe qui.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Note content */}
      <div className="card">
        <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
} 
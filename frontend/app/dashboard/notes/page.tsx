'use client';

import { useNotesStore } from '@/store/useNotesStore';
import { useAuth } from '@/components/providers/AuthProvider';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  EyeSlashIcon,
  GlobeAltIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function NotesPage() {
  const { notes, fetchNotes, deleteNote, isLoading, searchQuery, setSearchQuery, visibilityFilter, setVisibilityFilter } = useNotesStore();
  const { user } = useAuth();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'visibility'>('date');

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);


  const allTags = Array.from(new Set(notes.flatMap(note => note.tags.map(tag => tag.name))));

  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesVisibility = visibilityFilter === 'all' || note.visibility === visibilityFilter;
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => note.tags.some(noteTag => noteTag.name === tag));
      
      return matchesSearch && matchesVisibility && matchesTags;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'visibility':
          return a.visibility.localeCompare(b.visibility);
        case 'date':
        default:
          return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
      }
    });

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      try {
        await deleteNote(id);
        toast.success('Note supprimée avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'PRIVATE':
        return <EyeSlashIcon className="h-4 w-4 text-gray-500" />;
      case 'SHARED':
        return <ShareIcon className="h-4 w-4 text-blue-500" />;
      case 'PUBLIC':
        return <GlobeAltIcon className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getVisibilityLabel = (visibility: string) => {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="heading-2">Mes Notes</h1>
          <p className="text-muted-foreground">
            Gérez et organisez vos notes personnelles et partagées
          </p>
        </div>
        <Link href="/dashboard/notes/new" className="button-primary">
          <PlusIcon className="h-4 w-4" />
          Nouvelle note
        </Link>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card space-y-4"
      >
        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre, contenu ou tags..."
            className="input-primary pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Visibility Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-muted-foreground" />
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="input-primary text-sm"
            >
              <option value="all">Toutes les visibilités</option>
              <option value="PRIVATE">Privé</option>
              <option value="SHARED">Partagé</option>
              <option value="PUBLIC">Public</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Trier par:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'visibility')}
              className="input-primary text-sm"
            >
              <option value="date">Date</option>
              <option value="title">Titre</option>
              <option value="visibility">Visibilité</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchQuery || visibilityFilter !== 'all' || selectedTags.length > 0) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setVisibilityFilter('all');
                setSelectedTags([]);
              }}
              className="button-ghost text-sm"
            >
              Effacer les filtres
            </button>
          )}
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TagIcon className="h-4 w-4" />
              Filtrer par tags:
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`badge transition-all duration-200 ${
                    selectedTags.includes(tag)
                      ? 'badge-primary'
                      : 'badge-outline hover:badge-primary'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between text-sm text-muted-foreground"
      >
        <span>
          {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} trouvée{filteredNotes.length !== 1 ? 's' : ''}
        </span>
        {filteredNotes.length !== notes.length && (
          <span>sur {notes.length} total</span>
        )}
      </motion.div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded mb-4"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredNotes.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                variants={itemVariants}
                layout
                className="card-hover group relative"
              >
                <Link href={`/dashboard/notes/${note.id}`} className="block">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {note.title}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {note.public_token && (
                          <GlobeAltIcon className="h-4 w-4 text-green-500" title="Lien public" />
                        )}
                        {getVisibilityIcon(note.visibility)}
                      </div>
                    </div>

                    {/* Content Preview */}
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {note.content.replace(/[#*`]/g, '').substring(0, 120)}...
                    </p>

                    {/* Tags */}
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="badge badge-outline text-xs"
                          >
                            {tag.name}
                          </span>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{note.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>
                          {(() => {
                            const updateDate = note.updated_at || note.created_at;
                            if (updateDate) {
                              try {
                                return new Date(updateDate).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                });
                              } catch (error) {
                                return 'Date inconnue';
                              }
                            }
                            return 'Date inconnue';
                          })()}
                        </span>
                      </div>
                      <span className="badge badge-outline text-xs">
                        {getVisibilityLabel(note.visibility)}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1">
                    {note.owner_id === user?.id && (
                      <>
                        <Link
                          href={`/dashboard/notes/${note.id}/edit`}
                          className="p-1 rounded hover:bg-accent transition-colors"
                          title="Modifier"
                        >
                          <PencilIcon className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(note.id);
                          }}
                          className="p-1 rounded hover:bg-accent transition-colors"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </>
                    )}
                    {note.owner_id !== user?.id && (
                      <span className="text-xs text-muted-foreground">Lecture seule</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center py-12"
        >
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Aucune note trouvée
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || visibilityFilter !== 'all' || selectedTags.length > 0
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Commencez par créer votre première note.'}
              </p>
              {!searchQuery && visibilityFilter === 'all' && selectedTags.length === 0 && (
                <Link href="/dashboard/notes/new" className="button-primary">
                  <PlusIcon className="h-4 w-4" />
                  Créer ma première note
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 
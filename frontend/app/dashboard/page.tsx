'use client';

import { useNotesStore } from '@/store/useNotesStore';
import { useAuth } from '@/components/providers/AuthProvider';
import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  DocumentTextIcon,
  EyeIcon,
  ShareIcon,
  GlobeAltIcon,
  ClockIcon,
  TagIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { notes, fetchNotes, isLoading } = useNotesStore();
  const { user } = useAuth();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const stats = {
    total: notes.length,
    private: notes.filter(note => note.visibility === 'PRIVATE').length,
    shared: notes.filter(note => note.visibility === 'SHARED').length,
    public: notes.filter(note => note.visibility === 'PUBLIC').length,
    withPublicLinks: notes.filter(note => note.public_token).length,
    totalTags: new Set(notes.flatMap(note => note.tags.map(tag => tag.name))).size,
    recentNotes: notes
      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
      .slice(0, 3),
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'PRIVATE':
        return <EyeIcon className="h-4 w-4 text-blue-500" title="Privée" />;
      case 'SHARED':
        return <ShareIcon className="h-4 w-4 text-blue-500" title="Partagée" />;
      case 'PUBLIC':
        return <GlobeAltIcon className="h-4 w-4 text-green-500" title="Publique" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden space-y-6 sm:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="heading-1 animate-pulse-glow">
          Bienvenue, {user?.name || user?.email?.split('@')[0]} ! 👋
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Votre espace de travail pour organiser, partager et collaborer sur vos notes
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full min-w-0 max-w-full overflow-x-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
      >
        <motion.div variants={itemVariants} className="w-full min-w-0 max-w-full overflow-hidden">
          <Link
            href="/dashboard/notes/new"
            className="group w-full min-w-0 max-w-full"
          >
            <div className="flex items-center gap-3 sm:gap-4 w-full min-w-0 max-w-full">
              <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-500 to-purple-600  group-hover:scale-110 transition-transform">
                <PlusIcon className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1 max-w-full">
                <h3 className="font-semibold text-foreground truncate">Nouvelle note</h3>
                <p className="text-sm text-muted-foreground truncate">Créer rapidement</p>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full min-w-0 max-w-full overflow-hidden">
          <Link
            href="/dashboard/notes"
            className=" group w-full min-w-0 max-w-full"
          >
            <div className="flex items-center gap-3 sm:gap-4 w-full min-w-0 max-w-full">
              <div className="flex-shrink-0 p-3 bg-gradient-to-br from-green-500 to-blue-600 group-hover:scale-110 transition-transform">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1 max-w-full">
                <h3 className="font-semibold text-foreground truncate">Voir toutes</h3>
                <p className="text-sm text-muted-foreground truncate">Gérer vos notes</p>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full min-w-0 max-w-full overflow-hidden">
          <div className="card-hover w-full min-w-0 max-w-full">
            <div className="flex items-center gap-3 sm:gap-4 w-full min-w-0 max-w-full">
              <div className="flex-shrink-0 p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1 max-w-full">
                <h3 className="font-semibold text-foreground truncate">Activité</h3>
                <p className="text-sm text-muted-foreground truncate">Suivre l&apos;activité</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full min-w-0 max-w-full overflow-hidden">
          <div className="card-hover w-full min-w-0 max-w-full">
            <div className="flex items-center gap-3 sm:gap-4 w-full min-w-0 max-w-full">
              <div className="flex-shrink-0 p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                <TagIcon className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1 max-w-full">
                <h3 className="font-semibold text-foreground truncate">Tags</h3>
                <p className="text-sm text-muted-foreground truncate">{stats.totalTags} utilisés</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <motion.div variants={cardVariants}>
          <div className="card text-center">
            <div className="p-3 bg-blue-500/10 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">{stats.total}</h3>
            <p className="text-sm text-muted-foreground">Total des notes</p>
          </div>
        </motion.div>

        <motion.div variants={cardVariants}>
          <div className="card text-center">
            <div className="p-3 bg-green-500/10 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <EyeIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">{stats.private}</h3>
            <p className="text-sm text-muted-foreground">Notes privées</p>
          </div>
        </motion.div>

        <motion.div variants={cardVariants}>
          <div className="card text-center">
            <div className="p-3 bg-purple-500/10 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <ShareIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">{stats.shared}</h3>
            <p className="text-sm text-muted-foreground">Notes partagées</p>
          </div>
        </motion.div>

        <motion.div variants={cardVariants}>
          <div className="card text-center">
            <div className="p-3 bg-orange-500/10 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <GlobeAltIcon className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">{stats.public}</h3>
            <p className="text-sm text-muted-foreground">Notes publiques</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="heading-3 flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Notes récentes
          </h2>
          <Link
            href="/dashboard/notes"
            className="text-sm text-primary hover:text-primary/90 transition-colors"
          >
            Voir toutes →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stats.recentNotes.length > 0 ? (
            stats.recentNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="card-hover group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {note.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    {note.public_token && (
                      <GlobeAltIcon className="h-4 w-4 text-green-500" title="Lien public" />
                    )}
                    {getVisibilityIcon(note.visibility)}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {note.content?.replace(/[#*`]/g, '').substring(0, 100)}...
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Modifié le{' '}
                    {new Date(note.updated_at || note.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  {note.tags.length > 0 && (
                    <span className="flex items-center gap-1">
                      <TagIcon className="h-3 w-3" />
                      {note.tags.length}
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Aucune note</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par créer votre première note
              </p>
              <Link
                href="/dashboard/notes/new"
                className="button-primary"
              >
                Créer une note
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="heading-3 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            Activité récente
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Activité récente</h3>
            <div className="space-y-4">
              {stats.recentNotes.length > 0 ? (
                stats.recentNotes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        Note modifiée: <span className="text-primary">{note.title}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(note.updated_at || note.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {note.public_token && (
                        <GlobeAltIcon className="h-4 w-4 text-green-500" title="Lien public" />
                      )}
                      {getVisibilityIcon(note.visibility)}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Aucune activité récente</p>
                  <p className="text-sm text-muted-foreground">Commencez par créer votre première note</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Score de productivité</h3>
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-muted/20"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-primary"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${Math.min(stats.total * 10, 100)} 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {Math.min(stats.total * 10, 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Basé sur {stats.total} notes créées
                </p>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <Link
                  href="/dashboard/notes/new"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <PlusIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nouvelle note</p>
                    <p className="text-xs text-muted-foreground">Créer rapidement</p>
                  </div>
                </Link>
                
                <Link
                  href="/dashboard/notes"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <DocumentTextIcon className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Voir toutes</p>
                    <p className="text-xs text-muted-foreground">Gérer vos notes</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Engagement</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Notes partagées</span>
                  <span className="text-sm font-semibold text-blue-600">{stats.shared}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Liens publics</span>
                  <span className="text-sm font-semibold text-green-600">{stats.withPublicLinks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tags utilisés</span>
                  <span className="text-sm font-semibold text-purple-600">{stats.totalTags}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 
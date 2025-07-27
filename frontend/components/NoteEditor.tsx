'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, EyeIcon, EyeSlashIcon, ShareIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface NoteEditorProps {
  initialData?: {
    title: string;
    content: string;
    visibility: 'PRIVATE' | 'SHARED' | 'PUBLIC';
    tags: string[];
  };
  onSubmit: (data: {
    title: string;
    content: string;
    visibility: 'PRIVATE' | 'SHARED' | 'PUBLIC';
    tags: string[];
  }) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export default function NoteEditor({ 
  initialData, 
  onSubmit, 
  isLoading = false, 
  submitLabel = 'Enregistrer' 
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [visibility, setVisibility] = useState<'PRIVATE' | 'SHARED' | 'PUBLIC'>(initialData?.visibility || 'PRIVATE');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  const visibilityOptions = [
    { value: 'PRIVATE', label: 'Privé', icon: EyeSlashIcon, description: 'Visible uniquement par vous' },
    { value: 'SHARED', label: 'Partagé', icon: ShareIcon, description: 'Visible par vous et les utilisateurs partagés' },
    { value: 'PUBLIC', label: 'Public', icon: GlobeAltIcon, description: 'Visible par tous les utilisateurs' },
  ];

  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (title || content) {
      setAutoSaveStatus('saving');
      autoSaveTimeoutRef.current = setTimeout(() => {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }, 1000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, content]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        visibility,
        tags: tags.filter(tag => tag.trim()),
      });
    } catch (error) {
      console.error('Error submitting note:', error);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
              Titre
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-primary w-full"
              placeholder="Titre de votre note..."
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="content" className="block text-sm font-medium text-foreground">
                Contenu
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPreview ? 'Éditer' : 'Aperçu'}
                </button>
                {autoSaveStatus === 'saving' && (
                  <span className="text-xs text-blue-600">Sauvegarde...</span>
                )}
                {autoSaveStatus === 'saved' && (
                  <span className="text-xs text-green-600">Sauvegardé</span>
                )}
              </div>
            </div>
            
            {showPreview ? (
              <div className="min-h-[300px] p-4 border border-border rounded-lg bg-card">
                <div className="prose prose-sm max-w-none">
                  <h1>{title}</h1>
                  <div className="whitespace-pre-wrap">{content}</div>
                </div>
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="input-primary w-full min-h-[300px] resize-none"
                placeholder="Écrivez votre note en Markdown..."
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="badge badge-primary flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="input-primary flex-1"
                placeholder="Ajouter un tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="button-secondary"
              >
                Ajouter
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Visibilité
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {visibilityOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setVisibility(option.value as any)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      visibility === option.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Utilisez Cmd+Entrée pour sauvegarder rapidement
          </div>
          <motion.button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="button-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Enregistrement...
              </div>
            ) : (
              submitLabel
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
} 
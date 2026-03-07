import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, MessageCircle, Share2, User, Award, Calendar } from 'lucide-react';
import { ArenaPost } from '../types';
import { Link } from 'react-router-dom';

interface PostModalProps {
  post: ArenaPost | null;
  onClose: () => void;
  onLike?: (postId: string, authorId: string) => void;
}

export const PostModal: React.FC<PostModalProps> = ({ post, onClose, onLike }) => {
  if (!post) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[var(--surface)] w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-[var(--border-ui)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Media Section */}
          <div className="flex-1 bg-black flex items-center justify-center relative min-h-[300px] md:min-h-0">
            {post.media_url ? (
              (() => {
                let urls: string[] = [];
                try {
                  if (post.media_url.startsWith('[')) {
                    urls = JSON.parse(post.media_url);
                  } else {
                    urls = [post.media_url];
                  }
                } catch (e) {
                  urls = [post.media_url];
                }

                if (urls.length > 1) {
                  return (
                    <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full h-full">
                      {urls.map((url, i) => (
                        <div key={i} className="flex-shrink-0 w-full h-full snap-center flex items-center justify-center">
                          <img src={url} alt="" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                  );
                }

                return post.type === 'video' ? (
                  <video src={urls[0]} controls className="max-h-full max-w-full" autoPlay />
                ) : (
                  <img src={urls[0]} alt="" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                );
              })()
            ) : (
              <div className="p-12 text-center">
                <p className="text-[var(--text-main)] text-xl leading-relaxed italic">{post.content}</p>
              </div>
            )}
            
            <button 
              onClick={onClose}
              className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full hover:bg-rose-500 transition-all md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Info Section */}
          <div className="w-full md:w-[400px] flex flex-col bg-[var(--surface)] border-l border-[var(--border-ui)]">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-ui)] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link to={`/user/@${post.author?.username}`} className="w-10 h-10 rounded-full bg-[var(--bg)] overflow-hidden block">
                  {(post.author?.profile_photo || post.author?.avatar_url) && (
                    <img src={post.author.profile_photo || post.author.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  )}
                </Link>
                <div>
                  <Link to={`/user/@${post.author?.username}`} className="font-bold text-sm text-[var(--text-main)] hover:text-[var(--primary)] transition-colors block">
                    {post.author?.full_name || 'Atleta'}
                  </Link>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">@{post.author?.username || 'user'}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hidden md:block">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="space-y-4">
                <p className="text-[var(--text-main)] text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                <div className="flex items-center space-x-2 text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">
                  <Calendar size={12} />
                  <span>{new Date(post.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="pt-6 border-t border-[var(--border-ui)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button 
                      onClick={() => onLike?.(post.id, post.author_id)}
                      className="flex items-center space-x-2 text-[var(--text-muted)] hover:text-rose-500 transition-colors"
                    >
                      <Heart size={20} />
                      <span className="text-sm font-bold">{post.likes_count}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                      <MessageCircle size={20} />
                      <span className="text-sm font-bold">{post.comments_count}</span>
                    </button>
                  </div>
                  <button className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Comments Placeholder */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Comentários</h4>
                <div className="py-8 text-center">
                  <p className="text-xs text-[var(--text-muted)] font-bold italic">Nenhum comentário ainda. Seja o primeiro!</p>
                </div>
              </div>
            </div>

            {/* Footer / Add Comment */}
            <div className="p-4 border-t border-[var(--border-ui)]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[var(--bg)] flex-shrink-0" />
                <input 
                  type="text" 
                  placeholder="Adicione um comentário..." 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]"
                />
                <button className="text-[var(--primary)] font-black text-[10px] uppercase tracking-widest">Publicar</button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { BookOpen, Calendar, User as UserIcon, Tag, ArrowRight, X, Loader2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getMyPosts, getPublicPosts, getPostDetail } from '../services/postService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function EssayHistory({ mode = 'myEssays', onSelectEssay }) {
  const { t } = useLanguage();
  const { getToken, isSignedIn } = useAuth();
  
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Selected post for detail modal
  const [selectedPost, setSelectedPost] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetcher = mode === 'myEssays' ? getMyPosts : getPublicPosts;
      const data = await fetcher(getToken, { skip: 0, limit: 30 });
      setPosts(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(`Error fetching ${mode}:`, err);
      setError(err.message || t('essaySaveError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'myEssays' && !isSignedIn) {
      setLoading(false);
      return;
    }
    fetchPosts();
  }, [mode, isSignedIn]);

  const handleOpenDetail = async (postId) => {
    setLoadingDetail(true);
    try {
      const detail = await getPostDetail(getToken, postId);
      setSelectedPost(detail);
    } catch (err) {
      console.error("Failed to load essay detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // If user is not logged in and viewing "My Essays"
  if (mode === 'myEssays' && !isSignedIn) {
    return (
      <Card className="p-12 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-dashed border-2 rounded-3xl">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen size={32} />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">{t('essayLoginToSave')}</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          {t('essaySub')}
        </p>
        <Button asChild className="rounded-2xl font-bold px-6 shadow-lg shadow-primary/20">
          <a href="/login">{t('loginBtn')}</a>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            {mode === 'myEssays' ? (
              <>
                <BookOpen className="text-primary w-5 h-5" />
                {t('essayTabMyEssays')}
              </>
            ) : (
              <>
                <Sparkles className="text-amber-500 w-5 h-5" />
                {t('essayTabFeed')}
              </>
            )}
            <Badge variant="secondary" className="ml-2 font-mono text-xs">
              {total}
            </Badge>
          </h2>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchPosts}
          disabled={loading}
          className="rounded-xl gap-2 text-xs font-semibold cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {t('essayRetry')}
        </Button>
      </div>

      {/* Error State with Retry Button */}
      {error && (
        <div className="p-5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={fetchPosts} className="rounded-xl font-bold">
            {t('essayRetry')}
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-40 rounded-3xl bg-secondary/30 animate-pulse border border-border/40" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="p-12 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-dashed border-2 rounded-3xl">
          <p className="text-muted-foreground text-sm">
            {mode === 'myEssays' ? t('essayEmptyHistory') : t('essayEmptyFeed')}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {posts.map((post) => {
            const dateStr = post.created_at
              ? new Date(post.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'N/A';

            return (
              <Card
                key={post.id}
                className="group hover:border-primary/40 hover:shadow-xl transition-all duration-300 rounded-3xl bg-card/70 backdrop-blur-md flex flex-col justify-between overflow-hidden"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <CardTitle className="text-base sm:text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0 font-mono">
                      <Calendar size={12} />
                      {dateStr}
                    </span>
                  </div>

                  {/* Categories Tags */}
                  {post.categories && post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.categories.map((cat) => (
                        <Badge
                          key={cat.id}
                          variant="outline"
                          className="text-[11px] font-semibold bg-primary/5 text-primary border-primary/20 rounded-lg"
                        >
                          <Tag size={10} className="mr-1" />
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {post.content}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-border/40">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDetail(post.id)}
                      className="rounded-xl text-xs font-bold gap-1.5 hover:text-primary hover:bg-primary/10 cursor-pointer p-0 h-auto"
                    >
                      {t('essayViewDetail')}
                      <ArrowRight size={13} />
                    </Button>

                    {onSelectEssay && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onSelectEssay(post)}
                        className="rounded-xl text-xs font-semibold px-3 h-8 cursor-pointer"
                      >
                        {t('essayTabWrite')}
                      </Button>
                    )}
                  </div>
                  {mode !== 'myEssays' && post.author_email && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <UserIcon size={12} />
                      {t('essayAuthor')}: {post.author_email}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-background/95 border border-border/80 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <div className="min-w-0 pr-4">
                <h3 className="text-lg font-bold text-foreground truncate">{selectedPost.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedPost.created_at ? new Date(selectedPost.created_at).toLocaleString() : ''}
                </p>
                {selectedPost.author_email && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <UserIcon size={12} /> {t('essayAuthor')}: {selectedPost.author_email}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedPost(null)}
                className="rounded-full shrink-0"
              >
                <X size={18} />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Categories */}
              {selectedPost.categories?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedPost.categories.map((cat) => (
                    <Badge key={cat.id} variant="secondary" className="text-xs font-bold">
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Essay Full Text */}
              <div className="bg-secondary/30 p-5 rounded-2xl border border-border/50 text-foreground/90 leading-relaxed text-sm sm:text-base whitespace-pre-wrap font-serif">
                {selectedPost.content}
              </div>
              {selectedPost.evaluation?.overallScore && (
                <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4 text-sm dark:border-amber-900/50 dark:bg-amber-950/20">
                  <span className="font-bold text-amber-700 dark:text-amber-300">{t('essayBandScore')}: </span>
                  {selectedPost.evaluation.overallScore}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-border/50 flex justify-end">
              <Button onClick={() => setSelectedPost(null)} className="rounded-xl px-5 font-bold">
                {t('closeBtn')}
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

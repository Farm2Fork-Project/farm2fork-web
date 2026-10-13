"use client";

import { useEffect, useMemo, useState } from "react";
import { LuImagePlus, LuMessageCircle, LuTrash2, LuX } from "react-icons/lu";
import { useLanguage } from "./LanguageContext";
import {
  CommunityRepository,
  MAX_POST_PHOTOS,
  parseTags,
  type CommunityComment,
  type CommunityPost,
} from "@/lib/community/community-repository.ts";

type FeedState =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "ready"; posts: CommunityPost[] };

/**
 * The shared community feed (same posts farmers and buyers see in the app).
 */
export default function FarmFeed({
  repository,
  currentUserId,
}: {
  repository?: CommunityRepository;
  currentUserId?: string;
}) {
  const { t, language } = useLanguage();
  const community = useMemo(() => repository ?? new CommunityRepository(), [repository]);
  const [tag, setTag] = useState<string | null>(null);
  const [state, setState] = useState<FeedState>({ kind: "loading" });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    community.feed(tag ?? undefined).then(
      (posts) => !cancelled && setState({ kind: "ready", posts }),
      () => !cancelled && setState({ kind: "error" }),
    );
    return () => {
      cancelled = true;
    };
  }, [community, tag, reload]);

  const date = new Intl.DateTimeFormat(language === "ur" ? "ur-PK" : "en-PK", {
    dateStyle: "medium",
  });

  return (
    <div className="feed-page">
      <Composer
        community={community}
        onPosted={(post) =>
          setState((s) => (s.kind === "ready" ? { kind: "ready", posts: [post, ...s.posts] } : s))
        }
      />

      {tag ? (
        <button type="button" className="feed-tag-filter" onClick={() => setTag(null)}>
          #{tag} <LuX size={14} aria-hidden="true" />
          <span className="sr-only">{t("feed.clearTag")}</span>
        </button>
      ) : null}

      {state.kind === "loading" ? (
        <p className="text-muted">…</p>
      ) : state.kind === "error" ? (
        <div className="card" role="alert">
          <p>{t("feed.loadFailed")}</p>
          <button type="button" className="btn btn-outline" onClick={() => setReload((n) => n + 1)}>
            {t("feed.retry")}
          </button>
        </div>
      ) : state.posts.length === 0 ? (
        <div className="card">
          <h3>{t("feed.post.noPosts")}</h3>
          <p className="text-muted">{t("feed.post.noPostsDesc")}</p>
        </div>
      ) : (
        state.posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            community={community}
            date={date}
            canRemove={post.author.id === currentUserId}
            onTag={setTag}
            onRemoved={() =>
              setState((s) =>
                s.kind === "ready" ? { kind: "ready", posts: s.posts.filter((p) => p.id !== post.id) } : s,
              )
            }
          />
        ))
      )}
    </div>
  );
}

function Composer({
  community,
  onPosted,
}: {
  community: CommunityRepository;
  onPosted: (post: CommunityPost) => void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setOpen(false);
    setTitle("");
    setContent("");
    setTags("");
    setPhotos([]);
    setError("");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = parseTags(tags);
    if (parsed.length > 5) {
      setError(t("feed.tooManyTags"));
      return;
    }
    setPosting(true);
    setError("");
    try {
      onPosted(await community.create({ title: title.trim(), content: content.trim(), tags: parsed, photos }));
      reset();
    } catch {
      setError(t("feed.postFailed"));
    } finally {
      setPosting(false);
    }
  };

  if (!open) {
    return (
      <button type="button" className="card feed-composer-prompt" onClick={() => setOpen(true)}>
        {t("feed.composer.placeholder")}
      </button>
    );
  }

  return (
    <form className="card feed-composer" onSubmit={(e) => void submit(e)}>
      <h3>{t("feed.composer.title")}</h3>
      <input
        className="input"
        required
        maxLength={140}
        placeholder={t("feed.composer.titlePlaceholder")}
        aria-label={t("feed.composer.titlePlaceholder")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="input"
        required
        rows={4}
        maxLength={5000}
        placeholder={t("feed.composer.contentPlaceholder")}
        aria-label={t("feed.composer.contentPlaceholder")}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input
        className="input"
        placeholder={t("feed.composer.tagsPlaceholder")}
        aria-label={t("feed.composer.tagsPlaceholder")}
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <div className="feed-photos">
        {photos.map((photo) => (
          <span key={photo.name + photo.size} className="feed-photo-chip">
            {photo.name}
            <button
              type="button"
              aria-label={t("feed.removePhoto")}
              onClick={() => setPhotos((list) => list.filter((p) => p !== photo))}
            >
              <LuX size={12} />
            </button>
          </span>
        ))}
        {photos.length < MAX_POST_PHOTOS ? (
          <label className="btn btn-outline feed-photo-add">
            <LuImagePlus size={16} aria-hidden="true" /> {t("feed.addPhoto")}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPhotos((list) => [...list, file].slice(0, MAX_POST_PHOTOS));
                e.target.value = "";
              }}
            />
          </label>
        ) : null}
      </div>
      {error ? <p role="alert" className="text-error">{error}</p> : null}
      <div className="feed-actions">
        <button type="button" className="btn btn-outline" onClick={reset}>
          {t("feed.composer.cancel")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={posting || !title.trim() || !content.trim()}>
          {t("feed.composer.post")}
        </button>
      </div>
    </form>
  );
}

function PostCard({
  post,
  community,
  date,
  canRemove,
  onTag,
  onRemoved,
}: {
  post: CommunityPost;
  community: CommunityRepository;
  date: Intl.DateTimeFormat;
  canRemove: boolean;
  onTag: (tag: string) => void;
  onRemoved: () => void;
}) {
  const { t } = useLanguage();
  const [comments, setComments] = useState<CommunityComment[] | null>(null);
  const [count, setCount] = useState(post.commentCount);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const toggleComments = () => {
    if (comments) {
      setComments(null);
      return;
    }
    community.comments(post.id).then(setComments, () => setComments([]));
  };

  const addComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setBusy(true);
    try {
      const comment = await community.addComment(post.id, draft.trim());
      setComments((list) => [...(list ?? []), comment]);
      setCount((n) => n + 1);
      setDraft("");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(t("feed.removeConfirm"))) return;
    await community.remove(post.id);
    onRemoved();
  };

  const role = post.author.role === "farmer" ? t("signupRole.farmerRole") : post.author.role === "buyer" ? t("signupRole.buyerRole") : "";

  return (
    <article className="card feed-post">
      <header className="feed-post-head">
        <span className="feed-avatar" aria-hidden="true">
          {post.author.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <strong>{post.author.name}</strong>
          <span className="text-muted">
            {[role, post.author.city, date.format(new Date(post.createdAt))].filter(Boolean).join(" · ")}
          </span>
        </div>
        {canRemove ? (
          <button type="button" className="topbar-icon-btn" aria-label={t("feed.remove")} onClick={() => void remove()}>
            <LuTrash2 size={16} />
          </button>
        ) : null}
      </header>
      <h3>{post.title}</h3>
      <p className="feed-post-body">{post.content}</p>
      {post.images.length ? (
        <div className="feed-post-photos">
          {post.images.map((src) => (
            // User photos from Cloudinary or the API; not optimisable by next/image.
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" loading="lazy" />
          ))}
        </div>
      ) : null}
      {post.tags.length ? (
        <div className="feed-post-tags">
          {post.tags.map((tag) => (
            <button key={tag} type="button" className="badge badge-soft-blue" onClick={() => onTag(tag)}>
              #{tag}
            </button>
          ))}
        </div>
      ) : null}
      <button type="button" className="feed-comments-toggle" onClick={toggleComments} aria-expanded={comments !== null}>
        <LuMessageCircle size={16} aria-hidden="true" /> {t("feed.post.commentsCount").replace("{count}", String(count))}
      </button>
      {comments ? (
        <div className="feed-comments">
          {comments.map((c) => (
            <div key={c.id} className="feed-comment">
              <strong>{c.author.name}</strong>
              <p>{c.content}</p>
            </div>
          ))}
          <form className="feed-comment-form" onSubmit={(e) => void addComment(e)}>
            <input
              className="input"
              maxLength={2000}
              placeholder={t("feed.post.writeComment")}
              aria-label={t("feed.post.writeComment")}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={busy || !draft.trim()}>
              {t("feed.post.comment")}
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}

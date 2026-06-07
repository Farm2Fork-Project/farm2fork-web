"use client";

import React, { useState } from "react";
import { Heart, MessageSquare, Tag, Plus, Send, X, Rss } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  date: string;
  content: string;
}

export interface FeedPost {
  id: string;
  author: string;
  avatar: string;
  avatarBg: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  commentsCount: number;
  likedByUser: boolean;
  comments: Comment[];
}

export default function FarmFeed() {
  const { t, language } = useLanguage();
  const [posts, setPosts] = useState<FeedPost[]>([
    {
      id: "feed_1",
      author: "Fatima Bibi",
      avatar: "F",
      avatarBg: "bg-emerald-100 text-emerald-800",
      date: "3/6/2026",
      title: "Sindh Mango Crop Advice",
      content: "Due to early heatwaves in Sindh, ensure light watering every 3 days. Focus on organic pest repellents for grade A quality exports!",
      tags: ["Mangoes", "FarmingTips", "Organic"],
      likes: 12,
      commentsCount: 2,
      likedByUser: false,
      comments: [
        {
          id: "c_1",
          author: "Rahim Yar",
          avatar: "R",
          date: "3/6/2026",
          content: "Thank you Fatima, this advice is very timely. Our orchards in Mirpur Khas are seeing high temperatures already.",
        },
        {
          id: "c_2",
          author: "Zainab Shah",
          avatar: "Z",
          date: "4/6/2026",
          content: "Which pest repellents do you recommend specifically for exports? Neem oil mixtures?",
        },
      ],
    },
    {
      id: "feed_2",
      author: "Tariq Mehmood",
      avatar: "T",
      avatarBg: "bg-amber-100 text-amber-800",
      date: "2/6/2026",
      title: "Basmati Rice Price Trends",
      content: "Expect price stabilization for Basmati Rice (1121) this season. Direct listings here are cutting out middleman cuts by 20%!",
      tags: ["MarketTrends", "Rice", "DirectMarket"],
      likes: 8,
      commentsCount: 1,
      likedByUser: false,
      comments: [
        {
          id: "c_3",
          author: "Ali Raza",
          avatar: "A",
          date: "2/6/2026",
          content: "Agreed, direct prices are much better than selling in local mandi this month.",
        },
      ],
    },
  ]);

  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [newCommentText, setNewCommentText] = useState("");

  // Toggle Like
  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const liked = !post.likedByUser;
          return {
            ...post,
            likedByUser: liked,
            likes: liked ? post.likes + 1 : post.likes - 1,
          };
        }
        return post;
      })
    );
  };

  // Submit Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const parsedTags = newPostTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newFeedItem: FeedPost = {
      id: `feed_${Date.now()}`,
      author: "Hassan (You)",
      avatar: "H",
      avatarBg: "bg-[var(--primary-green-soft)] text-[var(--primary-green)]",
      date: "Today",
      title: newPostTitle,
      content: newPostContent,
      tags: parsedTags.length > 0 ? parsedTags : ["General"],
      likes: 0,
      commentsCount: 0,
      likedByUser: false,
      comments: [],
    };

    setPosts([newFeedItem, ...posts]);
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostTags("");
  };

  // Submit Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !newCommentText.trim()) return;

    const newComment: Comment = {
      id: `c_${Date.now()}`,
      author: "Hassan (You)",
      avatar: "H",
      date: "Just now",
      content: newCommentText,
    };

    const updatedPosts = posts.map((post) => {
      if (post.id === selectedPost.id) {
        const updatedPost = {
          ...post,
          comments: [...post.comments, newComment],
          commentsCount: post.commentsCount + 1,
        };
        setSelectedPost(updatedPost);
        return updatedPost;
      }
      return post;
    });

    setPosts(updatedPosts);
    setNewCommentText("");
  };

  const translatedPosts = posts.map(post => {
    if (language !== "en") {
      if (post.id === "feed_1") {
        return {
          ...post,
          author: "فاطمہ بی بی",
          title: "سندھ میں آم کی فصل کا مشورہ",
          content: "سندھ میں ابتدائی گرمی کی لہروں کی وجہ سے، ہر 3 دن بعد ہلکا پانی دینا یقینی بنائیں۔ گریڈ اے کوالٹی کی برآمدات کے لیے نامیاتی کیڑے مار ادویات پر توجہ دیں!",
          tags: ["آم", "کھیتی_باڑی_مشورہ", "نامیاتی"],
          comments: post.comments.map(c => {
             if (c.id === "c_1") return { ...c, author: "رحیم یار", content: "فاطمہ، آپ کا بہت شکریہ، یہ مشورہ بہت بروقت ہے۔ میرپورخاص میں ہمارے باغات میں پہلے ہی زیادہ درجہ حرارت دیکھا جا رہا ہے۔" };
             if (c.id === "c_2") return { ...c, author: "زینب شاہ", content: "آپ خاص طور پر برآمدات کے لیے کون سی کیڑے مار دوا تجویز کرتی ہیں؟ نیم کے تیل کا آمیزہ؟" };
             return c;
          })
        };
      }
      if (post.id === "feed_2") {
        return {
          ...post,
          author: "طارق محمود",
          title: "باسمتی چاول کی قیمت کے رجحانات",
          content: "اس سیزن میں باسمتی چاول (1121) کی قیمتوں میں استحکام کی توقع کریں۔ یہاں براہ راست لسٹنگ مڈل مین کے کٹوتی کو 20 فیصد تک کم کر رہی ہے!",
          tags: ["مارکیٹ_رجحانات", "چاول", "براہ_راست_مارکیٹ"],
          comments: post.comments.map(c => {
             if (c.id === "c_3") return { ...c, author: "علی رضا", content: "متفق، اس ماہ مقامی منڈی میں فروخت کرنے کے مقابلے میں براہ راست قیمتیں بہت بہتر ہیں۔" };
             return c;
          })
        };
      }
    }
    return post;
  });

  const filteredPosts = activeTagFilter
    ? translatedPosts.filter((post) => post.tags.includes(activeTagFilter))
    : translatedPosts;

  // Extract all unique tags
  const allTags = Array.from(new Set(translatedPosts.flatMap((p) => p.tags)));

  const displaySelectedPost = selectedPost 
    ? translatedPosts.find(p => p.id === selectedPost.id) || selectedPost 
    : null;

  return (
    <>
      <div className="animate-in w-full">
        {/* Page Header — consistent with all other screens */}
      <div className="page-header mb-8">
        <h1>{t("farmer.feed.title")}</h1>
        <p>{t("farmer.feed.subtitle")}</p>
      </div>

      {/* Two Column Grid Layout */}
      <div className="feed-web-layout">
        {/* Left Column: Feed List */}
        <div className="feed-list">
          {filteredPosts.length === 0 ? (
            <div className="card py-16 text-center">
              <div
                style={{
                  width: 56, height: 56,
                  borderRadius: "var(--radius-xl)",
                  background: "var(--primary-green-soft)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Rss size={24} color="var(--primary-green)" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-dark)] mb-1">No posts yet</h3>
              <p className="text-sm text-[var(--text-muted)]">Be the first to share an update with the community.</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="card border border-[var(--surface-medium)] flex flex-col gap-4"
              >
                {/* Post Author Header */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${post.avatarBg}`}
                  >
                    {post.avatar}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-dark)] leading-tight">
                      {post.author}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{post.date}</p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="space-y-2">
                  <h2 className="text-base font-bold text-[var(--text-dark)] leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>
                </div>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => setActiveTagFilter(tag === activeTagFilter ? null : tag)}
                        style={{ cursor: "pointer" }}
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border transition-colors ${activeTagFilter === tag
                          ? "bg-[var(--primary-green-soft)] text-[var(--primary-green)] border-[var(--primary-green)]"
                          : "bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100"
                          }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center gap-6 border-t border-[var(--surface-medium)] pt-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 text-xs font-semibold select-none border-none bg-transparent cursor-pointer transition-colors ${post.likedByUser
                      ? "text-red-600 hover:text-red-700"
                      : "text-[var(--text-muted)] hover:text-red-500"
                      }`}
                  >
                    <Heart
                      size={16}
                      className={post.likedByUser ? "fill-red-500 text-red-500" : ""}
                    />
                    <span>{post.likes}</span>
                  </button>
                  <button
                    onClick={() => setSelectedPost(post)}
                    className="flex items-center gap-2 text-xs font-semibold select-none border-none bg-transparent cursor-pointer text-[var(--text-muted)] hover:text-[var(--primary-green)] transition-colors"
                  >
                    <MessageSquare size={16} />
                    <span>
                      {post.commentsCount}{" "}
                      {post.commentsCount === 1
                        ? t("farmer.feed.comments").replace("s", "")
                        : t("farmer.feed.comments")}
                    </span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Sticky Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-lg)", position: "sticky", top: "24px" }}>
          {/* Create Post Card */}
          <div className="feed-sidebar-card">
            <h3 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b border-[var(--surface-medium)]">
              <Plus size={14} className="text-[var(--primary-green)]" />
              <span>{t("farmer.feed.createPost")}</span>
            </h3>
            <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-dark)] tracking-wide">
                  {language === "en" ? "Post Title" : "پوسٹ کا عنوان"}
                  <span className="text-[var(--error-red)] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t("farmer.feed.postTitlePlaceholder")}
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-dark)] tracking-wide">
                  {language === "en" ? "Post Content" : "پوسٹ کا مواد"}
                  <span className="text-[var(--error-red)] ml-0.5">*</span>
                </label>
                <textarea
                  placeholder={t("farmer.feed.postContentPlaceholder")}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="input py-2 resize-none"
                  rows={4}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-dark)] tracking-wide">
                  {language === "en" ? "Tags" : "ٹیگز"}
                </label>
                <input
                  type="text"
                  placeholder={t("farmer.feed.postTags")}
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                  className="input"
                />
                <p className="text-[11px] text-[var(--text-muted)]">Separate tags with commas</p>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full justify-center"
                style={{ padding: "12px" }}
              >
                {t("farmer.feed.post")}
              </button>
            </form>
          </div>

          {/* Tag Filter Sidebar Card */}
          {allTags.length > 0 && (
            <div className="feed-sidebar-card">
              <h3 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b border-[var(--surface-medium)]">
                <Tag size={13} className="text-[var(--primary-green)]" />
                <span>{t("farmer.feed.filterTags")}</span>
              </h3>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setActiveTagFilter(null)}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold border-none cursor-pointer transition-colors ${activeTagFilter === null
                    ? "bg-[var(--primary-green-soft)] text-[var(--primary-green)]"
                    : "bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-light)]"
                    }`}
                >
                  {t("marketplace.all")}
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTagFilter(tag)}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold border-none cursor-pointer transition-colors ${activeTagFilter === tag
                      ? "bg-[var(--primary-green-soft)] text-[var(--primary-green)]"
                      : "bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-light)]"
                      }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Feed Comments Modal */}
      {displaySelectedPost && (
        <div className="modal-overlay">
          <div className="modal max-w-lg w-full flex flex-col max-h-[85vh]">
            <div className="modal-header border-b border-[var(--surface-medium)] pb-3">
              <div>
                <h2 className="text-lg font-bold">{t("farmer.feed.comments")}</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {t("farmer.feed.discussing").replace("{title}", displaySelectedPost.title)}
                </p>
              </div>
              <button className="modal-close" onClick={() => setSelectedPost(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 pr-1">
              {displaySelectedPost.comments.length === 0 ? (
                <div className="py-8 text-center text-sm text-[var(--text-muted)]">
                  {t("farmer.feed.noComments")}
                </div>
              ) : (
                displaySelectedPost.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-3 bg-[var(--surface-light)] p-3 rounded-xl border border-[var(--surface-medium)] text-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {comment.avatar}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-dark)]">{comment.author}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {comment.date}
                        </span>
                      </div>
                      <p className="text-[var(--text-muted)] leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Submit Comment Input Form */}
            <form
              onSubmit={handleAddComment}
              className="border-t border-[var(--surface-medium)] pt-5 mt-4 flex items-center gap-4"
            >
              <input
                type="text"
                placeholder={t("farmer.feed.writeComment")}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="input py-3 text-sm flex-1"
                required
              />
              <button type="submit" className="btn btn-primary p-0 flex-shrink-0 justify-center items-center" style={{ width: "48px", height: "48px" }}>
                <Send size={22} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
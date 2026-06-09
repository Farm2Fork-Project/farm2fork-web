"use client";

import React, { useState } from "react";
import { Heart, MessageSquare, Tag, Plus, Send, X, Rss, Edit3 } from "lucide-react";
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
  const [composerExpanded, setComposerExpanded] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newCommentTexts, setNewCommentTexts] = useState<Record<string, string>>({});

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

  // Toggle Comments
  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  // Submit Comment
  const handleAddComment = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const text = newCommentTexts[postId];
    if (!text || !text.trim()) return;

    const newComment: Comment = {
      id: `c_${Date.now()}`,
      author: "Hassan (You)",
      avatar: "H",
      date: "Just now",
      content: text,
    };

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment],
          commentsCount: post.commentsCount + 1,
        };
      }
      return post;
    }));
    
    setNewCommentTexts(prev => ({ ...prev, [postId]: "" }));
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

  return (
    <>
      <div className="animate-in w-full min-h-screen pb-10">

        {/* Premium Social Feed Layout */}
        <div className="flex justify-center w-full gap-8 items-start max-w-7xl mx-auto pt-4">
          {/* Left Sidebar */}
          <div className="hidden lg:flex flex-col gap-4 w-[280px] shrink-0 sticky top-[100px]">
            {/* User Profile Card */}
            <div className="card flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl bg-[var(--primary-green)] text-white mb-4">
                H
              </div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">Hassan</h3>
              <p className="text-sm text-gray-500 font-medium">@hassan_farm</p>
            </div>

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-1 mt-2">
              <button className="flex items-center gap-3 text-sm font-semibold py-3 px-4 rounded-xl bg-[var(--primary-green-soft)] text-[var(--primary-green-dark)] border-none text-left cursor-pointer transition-colors">
                <Rss size={18} />
                Community Feed
              </button>
              <button className="flex items-center gap-3 text-sm font-semibold py-3 px-4 rounded-xl bg-transparent text-gray-600 hover:bg-gray-100 border-none text-left cursor-pointer transition-colors">
                <Heart size={18} />
                Liked Posts
              </button>
            </nav>
          </div>

          {/* Center Feed */}
          <div className="flex flex-col gap-6 w-full max-w-[600px] shrink-0">
            {/* Inline Composer Card */}
            <div className="card mb-6 !p-5">
              <div className="flex gap-4 items-center cursor-pointer" onClick={() => setComposerExpanded(true)}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-[var(--primary-green)] text-white flex-shrink-0">
                  H
                </div>
                {!composerExpanded ? (
                  <div className="flex-1 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200 rounded-full px-5 py-3 flex items-center gap-3">
                    <Edit3 size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-500">{language === "en" ? "What's on your mind, Hassan?" : "آپ کے ذہن میں کیا ہے؟"}</span>
                  </div>
                ) : (
                  <span className="font-bold text-gray-900 ml-2 text-lg">
                    {language === "en" ? "Create Post" : "پوسٹ بنائیں"}
                  </span>
                )}
              </div>
              
              {composerExpanded && (
                <form onSubmit={(e) => { handleCreatePost(e); setComposerExpanded(false); }} className="flex flex-col gap-4 mt-4 pt-4 border-t border-[var(--surface-medium)] animate-in fade-in duration-200">
                  <input
                    type="text"
                    placeholder={t("farmer.feed.postTitlePlaceholder")}
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="input border-none bg-[var(--surface-light)] text-sm font-bold"
                    required
                  />
                  <textarea
                    placeholder={t("farmer.feed.postContentPlaceholder")}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="input border-none bg-[var(--surface-light)] resize-none text-sm"
                    rows={3}
                    required
                  />
                  <input
                    type="text"
                    placeholder={t("farmer.feed.postTags") + " (comma separated)"}
                    value={newPostTags}
                    onChange={(e) => setNewPostTags(e.target.value)}
                    className="input border-none bg-[var(--surface-light)] text-xs"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button type="button" onClick={() => setComposerExpanded(false)} className="btn bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-light)] text-sm px-4">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary text-sm px-6">
                      Post
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Feed Posts */}
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
                  className="card"
                >
                  {/* Post Author Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-[var(--primary-green-soft)] text-[var(--primary-green-dark)] flex-shrink-0">
                      {post.avatar}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 leading-tight hover:text-[var(--primary-green)] transition-colors cursor-pointer">
                        {post.author}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{post.date}</p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mb-5">
                    <h4 className="font-bold text-lg text-gray-900 mb-2 leading-snug">{post.title}</h4>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">{post.content}</p>
                  </div>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
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

                  {/* Likes/Comments Counter */}
                  <div className="flex items-center justify-between text-[13px] text-[var(--text-muted)] py-2 border-t border-[var(--surface-medium)]">
                    <span className="flex items-center gap-1">
                      <Heart size={14} className="text-red-500 fill-red-500" /> {post.likes}
                    </span>
                    <span>
                      {post.commentsCount} {post.commentsCount === 1 ? "Comment" : "Comments"}
                    </span>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-2">
                    <button
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors border-none ${
                        post.likedByUser ? "text-[var(--primary-green)] bg-[var(--primary-green-soft)]" : "text-gray-500 bg-transparent hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart size={18} className={post.likedByUser ? "fill-[var(--primary-green)] text-[var(--primary-green)]" : ""} />
                      <span>Like</span>
                    </button>
                    <button
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[15px] font-bold text-gray-500 bg-transparent cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-95 border-none hover:bg-gray-50 hover:text-gray-900 ml-2"
                      onClick={() => toggleComments(post.id)}
                    >
                      <MessageSquare size={20} />
                      <span>Comment</span>
                    </button>
                  </div>

                  {/* Inline Comments Section */}
                  {expandedComments.has(post.id) && (
                    <div className="border-t border-gray-100 pt-4 mt-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      {post.comments.length > 0 && (
                        <div className="flex flex-col gap-3 mb-4">
                          {post.comments.map(comment => (
                            <div key={comment.id} className="flex gap-3 items-start">
                              <div className="w-8 h-8 rounded-full bg-[var(--primary-green-soft)] text-[var(--primary-green-dark)] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-1">
                                {comment.avatar}
                              </div>
                              <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-none px-4 py-2 flex-1">
                                <span className="font-bold text-gray-900 block text-sm mb-0.5">{comment.author}</span>
                                <span className="text-gray-700 text-sm leading-relaxed">{comment.content}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-[var(--primary-green)] text-white flex-shrink-0">
                          H
                        </div>
                        <input 
                          type="text" 
                          placeholder="Write a comment..." 
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 outline-none transition-colors focus:bg-white focus:border-[#236B44]"
                          value={newCommentTexts[post.id] || ""}
                          onChange={(e) => setNewCommentTexts(prev => ({...prev, [post.id]: e.target.value}))}
                        />
                        <button type="submit" disabled={!newCommentTexts[post.id]?.trim()} className="bg-[var(--primary-green)] text-white hover:bg-[var(--primary-green-dark)] rounded-full p-2 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center cursor-pointer transition-colors border-none">
                          <Send size={16} className="ml-0.5" />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Right Sidebar */}
          <div className="hidden xl:flex flex-col gap-4 w-[280px] shrink-0 sticky top-[100px]">
            {allTags.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2 pb-3 border-b border-gray-100">
                  <Tag size={16} className="text-[var(--primary-green)]" />
                  <span>{t("farmer.feed.filterTags")}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveTagFilter(null)}
                    className={`py-1.5 px-4 rounded-full text-sm font-semibold border cursor-pointer transition-colors ${activeTagFilter === null
                      ? "bg-gray-900 text-white border-transparent"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    {t("marketplace.all")}
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveTagFilter(tag)}
                      className={`py-1.5 px-4 rounded-full text-sm font-semibold border cursor-pointer transition-colors ${activeTagFilter === tag
                        ? "bg-[var(--primary-green)] text-white border-transparent"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
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
    </>
  );
}
import { ApiClient } from "../api/client.ts";
import { resolveApiUrl } from "../loans/loan-repository.ts";

export interface CommunityAuthor {
  id: string;
  name: string;
  role: string;
  city?: string;
}

export interface CommunityPost {
  id: string;
  author: CommunityAuthor;
  title: string;
  content: string;
  images: string[];
  tags: string[];
  commentCount: number;
  createdAt: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  author: CommunityAuthor;
  content: string;
  createdAt: string;
}

export const MAX_POST_PHOTOS = 4;

export class CommunityRepository {
  private readonly client: Pick<ApiClient, "request">;

  constructor({ client }: { client?: Pick<ApiClient, "request"> } = {}) {
    this.client = client ?? new ApiClient();
  }

  async feed(tag?: string): Promise<CommunityPost[]> {
    const query = new URLSearchParams({ limit: "50" });
    if (tag) query.set("tag", tag);
    const page = await this.client.request<{ data: CommunityPost[] }>(
      `/community/posts?${query.toString()}`,
    );
    return page.data.map(withResolvedImages);
  }

  async create(input: {
    title: string;
    content: string;
    tags: string[];
    photos: File[];
  }): Promise<CommunityPost> {
    const form = new FormData();
    form.set("title", input.title);
    form.set("content", input.content);
    if (input.tags.length) form.set("tags", input.tags.join(","));
    for (const photo of input.photos) form.append("images", photo);
    return withResolvedImages(
      await this.client.request<CommunityPost>("/community/posts", { method: "POST", body: form }),
    );
  }

  remove(postId: string): Promise<unknown> {
    return this.client.request(`/community/posts/${encodeURIComponent(postId)}`, {
      method: "DELETE",
    });
  }

  comments(postId: string): Promise<CommunityComment[]> {
    return this.client.request<CommunityComment[]>(
      `/community/posts/${encodeURIComponent(postId)}/comments`,
    );
  }

  addComment(postId: string, content: string): Promise<CommunityComment> {
    return this.client.request<CommunityComment>(
      `/community/posts/${encodeURIComponent(postId)}/comments`,
      { method: "POST", body: { content } },
    );
  }
}

function withResolvedImages(post: CommunityPost): CommunityPost {
  return { ...post, images: post.images.map(resolveApiUrl) };
}

/** "#Wheat, sowing" -> ["wheat", "sowing"], as the backend normalises them. */
export function parseTags(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[,\s]+/)
        .map((tag) => tag.trim().replace(/^#/, "").toLowerCase())
        .filter(Boolean),
    ),
  ];
}

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "../LanguageContext";
import FarmFeed from "./FarmFeed";
import type { CommunityPost, CommunityRepository } from "@/lib/community/community-repository.ts";

afterEach(cleanup);

const post: CommunityPost = {
  id: "p1",
  author: { id: "farmer-1", name: "Green Valley Farm", role: "farmer", city: "Multan" },
  title: "Best time to sow wheat?",
  content: "After cotton picking?",
  images: [],
  tags: ["wheat"],
  commentCount: 0,
  createdAt: "2026-09-20T10:00:00.000Z",
};

test("the feed is the shared community API, with posting, tags and comments", async () => {
  const repository = {
    feed: vi.fn().mockResolvedValue([post]),
    create: vi.fn(async (input: { title: string; tags: string[] }) => ({
      ...post,
      id: "p2",
      title: input.title,
      tags: input.tags,
    })),
    comments: vi.fn().mockResolvedValue([]),
    addComment: vi.fn(async (_id: string, content: string) => ({
      id: "c1",
      postId: "p1",
      author: { id: "farmer-1", name: "Green Valley Farm", role: "farmer" },
      content,
      createdAt: new Date().toISOString(),
    })),
    remove: vi.fn(),
  } as unknown as CommunityRepository;

  render(
    <LanguageProvider>
      <FarmFeed repository={repository} currentUserId="someone-else" />
    </LanguageProvider>,
  );

  expect(await screen.findByText("Best time to sow wheat?")).toBeTruthy();
  expect(screen.queryByText(/like/i)).toBeNull();
  expect(screen.queryByRole("button", { name: "Remove post" })).toBeNull();

  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /Share an update/ }));
  await user.type(screen.getByLabelText(/What's on your mind/), "Kinnow ready");
  await user.type(screen.getByLabelText(/Share your thoughts/), "Harvesting this week");
  await user.type(screen.getByLabelText(/Add tags/), "#Kinnow, harvest");
  await user.click(screen.getByRole("button", { name: "Post" }));
  expect(repository.create).toHaveBeenCalledWith(
    expect.objectContaining({ title: "Kinnow ready", tags: ["kinnow", "harvest"] }),
  );
  expect(await screen.findByText("Kinnow ready")).toBeTruthy();

  await user.click(screen.getAllByRole("button", { name: /0 Comments/ })[1]);
  await user.type(await screen.findByLabelText("Write a comment..."), "Try early November");
  await user.click(screen.getByRole("button", { name: "Comment" }));
  expect(repository.addComment).toHaveBeenCalledWith("p1", "Try early November");
  expect(await screen.findByText("Try early November")).toBeTruthy();
  expect(screen.getByRole("button", { name: /1 Comments/ })).toBeTruthy();

  await user.click(screen.getAllByRole("button", { name: "#wheat" })[0]);
  expect(repository.feed).toHaveBeenLastCalledWith("wheat");
});

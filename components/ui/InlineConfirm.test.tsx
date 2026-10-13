import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { LanguageProvider } from "@/components/LanguageContext";
import { InlineConfirm } from "./InlineConfirm";

afterEach(cleanup);

function setup(onConfirm = vi.fn()) {
  render(
    <LanguageProvider>
      <InlineConfirm label="Sign out" prompt="Sign out of Farm2Fork?" confirmLabel="Yes, sign out" onConfirm={onConfirm} />
    </LanguageProvider>,
  );
  return onConfirm;
}

test("the button turns into a two-step confirm in place, with focus on Cancel", async () => {
  const user = userEvent.setup();
  const onConfirm = setup();

  await user.click(screen.getByRole("button", { name: "Sign out" }));

  expect(screen.getByRole("group", { name: "Sign out of Farm2Fork?" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Sign out" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  expect(onConfirm).not.toHaveBeenCalled();

  await user.click(screen.getByRole("button", { name: "Yes, sign out" }));
  expect(onConfirm).toHaveBeenCalledTimes(1);
});

test("Escape and Cancel put the original button back and return focus to it", async () => {
  const user = userEvent.setup();
  const onConfirm = setup();

  await user.click(screen.getByRole("button", { name: "Sign out" }));
  await user.keyboard("{Escape}");
  expect(screen.getByRole("button", { name: "Sign out" })).toHaveFocus();

  await user.click(screen.getByRole("button", { name: "Sign out" }));
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.getByRole("button", { name: "Sign out" })).toHaveFocus();
  expect(onConfirm).not.toHaveBeenCalled();
});

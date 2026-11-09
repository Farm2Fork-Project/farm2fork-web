import { act, screen } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

/** Types into a react-select combobox and picks the first match. */
export async function chooseOption(user: UserEvent, label: string | RegExp, text: string) {
  const input = screen.getByLabelText(label);
  await user.click(input);
  await user.type(input, `${text}{Enter}`);
}

/** Pretends the user dragged the map so the centre pin sits on `point`. */
export function dragMapTo(point: { lat: number; lng: number }) {
  const move = (globalThis as Record<string, unknown>).__mapUserMove as
    | ((p: { lat: number; lng: number }) => void)
    | undefined;
  if (!move) throw new Error("map is not mounted");
  act(() => move(point));
}

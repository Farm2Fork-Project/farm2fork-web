import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { LanguageProvider } from "./LanguageContext";
import LoginScreen from "./LoginScreen";

test("LoginScreen exposes Google sign-in and Firebase password reset actions", async () => {
  const user = userEvent.setup();
  const onGoogleLogin = vi.fn().mockResolvedValue(undefined);
  const onForgotPassword = vi.fn().mockResolvedValue(undefined);
  render(
    <LanguageProvider>
      <LoginScreen
        onLogin={vi.fn()}
        onGoogleLogin={onGoogleLogin}
        onForgotPassword={onForgotPassword}
        onGoSignup={vi.fn()}
      />
    </LanguageProvider>,
  );

  await user.click(screen.getByRole("button", { name: /continue with google/i }));
  expect(onGoogleLogin).toHaveBeenCalledTimes(1);

  await user.click(screen.getByRole("link", { name: /forgot password/i }));
  expect(onForgotPassword).toHaveBeenCalledTimes(1);
});

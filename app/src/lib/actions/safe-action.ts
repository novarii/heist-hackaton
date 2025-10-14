import { createSafeActionClient } from "next-safe-action";

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

export const safeAction = createSafeActionClient({
  handleServerError(error) {
    console.error("[safe-action]", error);

    return {
      error: "Unexpected server error. Please try again.",
    };
  },
});

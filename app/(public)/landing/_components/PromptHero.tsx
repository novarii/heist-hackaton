"use client";

import { useCallback } from "react";
import PromptInput from "components/PromptInput";

export default function PromptHero() {
  const handleSubmit = useCallback(async (prompt: string) => {
    console.log("Prompt submitted:", prompt);
  }, []);

  return (
    <PromptInput
      label="Ask the builder"
      placeholder="What can I automate with Heist?"
      submitLabel="Generate workflow"
      onSubmit={handleSubmit}
    />
  );
}

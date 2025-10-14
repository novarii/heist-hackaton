"use client";

import { FormEvent, useState } from "react";

type PromptInputProps = {
  label?: string;
  placeholder?: string;
  submitLabel?: string;
  defaultValue?: string;
  onSubmit?: (value: string) => void | Promise<void>;
};

export default function PromptInput({
  label,
  placeholder,
  submitLabel = "Submit",
  defaultValue = "",
  onSubmit,
}: PromptInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!value.trim() || !onSubmit) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(value.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-xs backdrop-blur-sm md:flex-row md:items-center md:gap-4"
    >
      {label ? (
        <label htmlFor="prompt-input" className="text-sm font-medium text-zinc-200">
          {label}
        </label>
      ) : null}
      <div className="flex w-full flex-1 items-center gap-3">
        <input
          id="prompt-input"
          className="flex-1 rounded-md border border-transparent bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-zinc-600"
          placeholder={placeholder}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting || !value.trim()}
        >
          {isSubmitting ? "Working…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";

type PromptInputProps = {
  placeholder?: string;
  submitLabel?: string;
  defaultValue?: string;
  showAgentSelector?: boolean;
  onSubmit?: (value: string) => void | Promise<void>;
};

export default function PromptInput({
  placeholder = "Ask Merak to hire you your new accountant...",
  submitLabel = "Send prompt",
  defaultValue = "",
  showAgentSelector = false,
  onSubmit,
}: PromptInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

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
    <form onSubmit={handleSubmit} className="relative mx-auto w-full max-w-3xl">
      <div className="rounded-[34px] border border-black bg-white/5 px-8 py-10 shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.08)] backdrop-blur-[2.5px]">
        <div className="relative flex items-center gap-4">
          <div className="relative size-8 shrink-0">
            <div className="absolute inset-[-26%] overflow-hidden rounded-full">
              <Image src="/landing/ellipse-4.png" alt="" fill className="object-cover" />
            </div>
          </div>

          {showAgentSelector ? (
            <button
              type="button"
              className="shrink-0 transition hover:opacity-100"
              onClick={() =>
                setSelectedAgent((previous) => (previous ? null : "Random Agent"))
              }
            >
              <Image
                src="/landing/arrow-chevron-down.svg"
                alt="Select agent"
                width={24}
                height={24}
                className="opacity-80"
              />
            </button>
          ) : null}

          <input
            className="flex-1 bg-transparent font-saprona text-xl text-neutrals-6 placeholder:text-neutrals-6 focus:text-white focus:outline-none"
            placeholder={placeholder}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={isSubmitting}
          />

          {showAgentSelector ? (
            <div className="shrink-0 rounded-2xl border border-neutral-500 bg-[rgba(221,221,222,0.2)] px-4 py-1.5 shadow-[inset_1px_1px_2.1px_1px_rgba(255,255,255,0.25)]">
              <span className="font-saprona text-base text-neutrals-4">
                {selectedAgent ?? "Random Agent"}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <button type="submit" className="sr-only">
        {submitLabel}
      </button>

      <div className="pointer-events-none absolute -left-32 -top-16 size-80">
        <Image src="/landing/chain-left.png" alt="" fill className="object-contain" />
      </div>
      <div className="pointer-events-none absolute -right-32 -top-16 size-80">
        <Image
          src="/landing/chain-right.png"
          alt=""
          fill
          className="object-contain"
        />
      </div>
    </form>
  );
}

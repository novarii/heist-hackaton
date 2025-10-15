import Image from "next/image";
import PromptInput from "components/PromptInput";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-orange-900 to-neutrals-13" />

      <div className="absolute inset-0">
        <div
          className="absolute left-0 right-0 top-[-266px] h-[1045px] rounded-[40px] bg-dust-pattern bg-cover blur-0"
          style={{ backgroundSize: "545.64px 408.65px" }}
        />
        <div
          className="absolute bottom-[-266px] left-0 right-0 h-[1045px] rounded-[40px] bg-dust-pattern bg-cover blur-0"
          style={{ backgroundSize: "545.64px 408.65px" }}
        />
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[295px] -translate-x-1/2 translate-y-1/2">
        <div className="relative size-full">
          <div className="absolute inset-[-170%]">
            <Image src="/landing/ellipse-18.png" alt="" fill className="object-contain" />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h1 className="mb-8 font-garamond text-[95px] leading-none text-neutrals-2 text-shadow-hero">
          <span>Find your </span>
          <span className="bg-red-white-gradient bg-clip-text">
            Intelligence
          </span>
        </h1>

        <p className="mb-16 font-garamond text-[22px] leading-normal text-white">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
        </p>

        <PromptInput showAgentSelector />
      </div>

    </section>
  );
}

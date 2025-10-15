export default function BottomSection() {
  return (
    <section className="relative">
      <div className="min-h-[769px] rounded-tl-[100px] rounded-tr-[100px] border-2 border-white bg-white/5 px-8 py-16 shadow-[inset_0px_5px_20.3px_6px_rgba(255,255,255,0.08)] backdrop-blur-[10px]">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 font-saprona text-4xl font-semibold text-neutrals-2">
            Explore Intelligence Agents
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{/* Agent cards */}</div>
        </div>
      </div>
    </section>
  );
}

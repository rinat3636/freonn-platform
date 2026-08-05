/**
 * Плейсхолдер секции калькулятора при lazy-load: стабильная высота и якорь #calculator.
 */
export default function CalculatorSectionSkeleton() {
  return (
    <section
      id="calculator"
      aria-label="Загрузка калькулятора"
      aria-busy="true"
      className="relative py-14 sm:py-20 lg:py-28 overflow-hidden"
      style={{ background: "#FFFFFF" }}
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `linear-gradient(rgba(26,26,46,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(26,26,46,0.04) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <div className="container relative z-10 max-w-5xl mx-auto px-4">
        <div className="mx-auto mb-10 max-w-xl h-6 rounded-md bg-[rgba(26,26,46,0.08)] animate-pulse" />
        <div className="mx-auto mb-8 max-w-md h-4 rounded-md bg-[rgba(26,26,46,0.06)] animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-[7.5rem] sm:h-[8.5rem] rounded-xl bg-[rgba(26,26,46,0.06)] animate-pulse"
              style={{ animationDelay: `${i * 40}ms` }}
            />
          ))}
        </div>
        <div className="mt-10 flex justify-center gap-3">
          <div className="h-11 w-32 rounded-full bg-[rgba(26,26,46,0.08)] animate-pulse" />
          <div className="h-11 w-32 rounded-full bg-[rgba(26,26,46,0.06)] animate-pulse" />
        </div>
      </div>
    </section>
  );
}

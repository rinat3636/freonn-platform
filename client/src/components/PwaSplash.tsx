export function PwaSplash() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-background">
      <img
        src="/icon-192x192.png"
        alt="Freonn"
        className="h-24 w-24 rounded-2xl shadow-lg"
      />
      <div className="text-xl font-bold tracking-tight text-foreground">
        Freonn Platform
      </div>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  );
}

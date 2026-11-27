export default function TokoLoading() {
  return (
    <div className="kss-container py-8" aria-busy="true">
      <p className="sr-only">Memuat toko</p>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <li key={index} className="aspect-[3/4] rounded-md bg-zinc-100 motion-safe:animate-pulse" />
        ))}
      </ul>
    </div>
  );
}

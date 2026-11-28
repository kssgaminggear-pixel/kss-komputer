import type { PublicPrebuiltPCDTO } from '@/lib/sanitizer';

/** Pill ringkas kartu paket: socket, jenis RAM, dan total daya. */
export function getSpecPills(pkg: PublicPrebuiltPCDTO): string[] {
  const part = (category: string) => pkg.parts.find((item) => item.category === category)?.part;
  const wattage = pkg.parts.reduce((sum, item) => sum + (item.part.wattage || 0) * item.quantity, 0);
  return [part('cpu')?.specs.socket, part('ram')?.specs.ramType, wattage > 0 ? `${wattage}W` : undefined]
    .filter(Boolean)
    .map(String);
}

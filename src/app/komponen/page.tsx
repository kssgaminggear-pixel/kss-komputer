import KomponenClient from './KomponenClient';
import { getPublicHardwareParts } from '@/lib/server-catalog';

export default function KomponenPage() {
  return <KomponenClient parts={getPublicHardwareParts()} />;
}

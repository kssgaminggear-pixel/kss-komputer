import SimulasiClient from './SimulasiClient';
import { getPublicHardwareParts } from '@/lib/server-catalog';

export default function SimulasiPage() {
  return <SimulasiClient parts={getPublicHardwareParts()} />;
}

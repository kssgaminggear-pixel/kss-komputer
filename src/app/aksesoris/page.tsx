import AksesorisClient from './AksesorisClient';
import { getPublicAccessories } from '@/lib/server-catalog';

export default function AksesorisPage() {
  return <AksesorisClient accessories={getPublicAccessories()} />;
}

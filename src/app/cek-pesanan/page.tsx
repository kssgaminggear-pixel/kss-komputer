import CekPesananClient from './CekPesananClient';
import { getPublicBuildTrackings } from '@/lib/server-catalog';

export default function CekPesananPage() {
  return <CekPesananClient trackings={getPublicBuildTrackings()} />;
}

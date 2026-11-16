import PaketRakitanClient from './PaketRakitanClient';
import { getPublicPrebuilts } from '@/lib/server-catalog';

export default function PaketRakitanPage() {
  return <PaketRakitanClient packages={getPublicPrebuilts()} />;
}

import HomeClient from './HomeClient';
import { getTopSellers } from '@/lib/marketplace/server';
import { getPublicPrebuilts, getPublicServices } from '@/lib/server-catalog';

export default function HomePage() {
  return (
    <HomeClient
      prebuilts={getPublicPrebuilts()}
      topSellers={getTopSellers(6)}
      services={getPublicServices()}
    />
  );
}

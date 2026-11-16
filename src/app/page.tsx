import HomeClient from './HomeClient';
import {
  getPublicAccessories,
  getPublicPrebuilts,
  getPublicServices,
} from '@/lib/server-catalog';

export default function HomePage() {
  return (
    <HomeClient
      prebuilts={getPublicPrebuilts()}
      accessories={getPublicAccessories()}
      services={getPublicServices()}
    />
  );
}

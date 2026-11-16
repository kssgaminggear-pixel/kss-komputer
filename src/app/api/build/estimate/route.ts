import { NextResponse } from 'next/server';
import { estimateBuildPrice, sanitizeEstimateInput } from '@/lib/server-pricing';

/**
 * Endpoint estimasi harga rakitan.
 * Harga satuan komponen tidak pernah dikirim ke client — hanya total dan delta.
 */
export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid.' }, { status: 400 });
  }

  const input = sanitizeEstimateInput(body);
  const result = estimateBuildPrice(input);

  return NextResponse.json(result);
}

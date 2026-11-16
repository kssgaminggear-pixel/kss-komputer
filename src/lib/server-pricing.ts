import { PARTS_BY_ID } from './mock-data';
import { ProductCategory } from './types';

export interface BuildEstimateItem {
  category: ProductCategory;
  partId: string;
  quantity: number;
}

export interface BuildEstimateInput {
  items: BuildEstimateItem[];
  assemblyFee: number;
  category?: ProductCategory;
  candidateIds?: string[];
}

export interface BuildEstimateResult {
  subtotal: number;
  totalPrice: number;
  deltas: Record<string, number>;
}

const MAX_QUANTITY = 20;
const MAX_ASSEMBLY_FEE = 10_000_000;

function isCategory(value: unknown): value is ProductCategory {
  return typeof value === 'string' && value in PARTS_BY_CATEGORY;
}

// Set kategori valid diturunkan dari data, tanpa perlu enum manual.
const PARTS_BY_CATEGORY: Record<string, true> = Object.values(PARTS_BY_ID).reduce(
  (acc, part) => {
    acc[part.category] = true;
    return acc;
  },
  {} as Record<string, true>
);

export function sanitizeEstimateInput(raw: unknown): BuildEstimateInput {
  const body = (raw ?? {}) as Record<string, unknown>;
  const rawItems = Array.isArray(body.items) ? body.items : [];

  const items: BuildEstimateItem[] = [];
  for (const entry of rawItems) {
    if (!entry || typeof entry !== 'object') continue;
    const item = entry as Record<string, unknown>;
    const category = item.category;
    const partId = item.partId;
    if (!isCategory(category) || typeof partId !== 'string') continue;

    const part = PARTS_BY_ID[partId];
    if (!part || part.category !== category) continue;

    const quantity = Math.min(
      MAX_QUANTITY,
      Math.max(1, Math.round(Number(item.quantity) || 1))
    );
    items.push({ category, partId, quantity });
  }

  const assemblyFee = Math.min(
    MAX_ASSEMBLY_FEE,
    Math.max(0, Math.round(Number(body.assemblyFee) || 0))
  );

  const category = isCategory(body.category) ? body.category : undefined;
  const candidateIds = Array.isArray(body.candidateIds)
    ? body.candidateIds.filter((id): id is string => typeof id === 'string')
    : undefined;

  return { items, assemblyFee, category, candidateIds };
}

export function estimateBuildPrice(input: BuildEstimateInput): BuildEstimateResult {
  let subtotal = 0;
  for (const item of input.items) {
    const part = PARTS_BY_ID[item.partId];
    if (!part) continue;
    subtotal += part.sellPrice * item.quantity;
  }

  const deltas: Record<string, number> = {};

  if (input.category && input.candidateIds && input.candidateIds.length > 0) {
    const baseItem = input.items.find((item) => item.category === input.category);
    const basePart = baseItem ? PARTS_BY_ID[baseItem.partId] : undefined;

    if (basePart) {
      for (const candidateId of input.candidateIds) {
        const candidate = PARTS_BY_ID[candidateId];
        if (!candidate || candidate.category !== input.category) continue;
        deltas[candidateId] = candidate.sellPrice - basePart.sellPrice;
      }
    }
  }

  return {
    subtotal,
    totalPrice: subtotal + input.assemblyFee,
    deltas,
  };
}

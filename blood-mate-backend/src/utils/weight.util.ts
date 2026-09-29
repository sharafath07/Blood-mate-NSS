import { WeightCategory } from "../generated/prisma/client";

export function normalizeWeight(
    value: unknown
): WeightCategory | null {
    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }

    const normalized = String(value)
        .trim()
        .toUpperCase();

    if (normalized.includes("ABOVE")) {
        return WeightCategory.ABOVE_45_KG;
    }

    if (normalized.includes("BELOW")) {
        return WeightCategory.BELOW_45_KG;
    }

    return null;
}
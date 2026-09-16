import { BloodGroup } from "../generated/prisma/client";

export function normalizeBloodGroup(
    value: unknown
): BloodGroup | null {
    if (value === null || value === undefined) {
        return null;
    }

    const normalized = String(value)
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "")
        .replace("POSITIVE", "+")
        .replace("NEGATIVE", "-");

    const bloodGroups: Record<string, BloodGroup> = {
        "A+": BloodGroup.A_POSITIVE,
        "A-": BloodGroup.A_NEGATIVE,
        "B+": BloodGroup.B_POSITIVE,
        "B-": BloodGroup.B_NEGATIVE,
        "AB+": BloodGroup.AB_POSITIVE,
        "AB-": BloodGroup.AB_NEGATIVE,
        "O+": BloodGroup.O_POSITIVE,
        "O-": BloodGroup.O_NEGATIVE,
    };

    return bloodGroups[normalized] ?? null;
}
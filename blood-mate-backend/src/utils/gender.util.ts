import { Gender } from "../generated/prisma/client";

export function normalizeGender(
    value: unknown
): Gender | null {
    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }

    const normalized = String(value)
        .trim()
        .toUpperCase();

    if (normalized === "MALE") {
        return Gender.MALE;
    }

    if (normalized === "FEMALE") {
        return Gender.FEMALE;
    }

    if (
        normalized === "OTHER" ||
        normalized === "OTHERS"
    ) {
        return Gender.OTHER;
    }

    return null;
}
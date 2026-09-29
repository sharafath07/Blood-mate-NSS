export function normalizePhone(
    value: unknown
): string | null {
    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }

    let phone = String(value).trim();

    if (!phone) {
        return null;
    }

    // Keep + and digits only
    phone = phone.replace(/[^\d+]/g, "");

    // Already international
    if (phone.startsWith("+")) {
        return phone;
    }

    // Indian number without country code
    if (
        phone.length === 10 &&
        phone.startsWith("0") === false
    ) {
        return `+91${phone}`;
    }

    // Indian number with 91 but without +
    if (
        phone.length === 12 &&
        phone.startsWith("91")
    ) {
        return `+${phone}`;
    }

    // Preserve unknown formats rather than
    // corrupting them.
    return phone;
}
export function normalizeDonationConsent(
    value: unknown
): boolean {
    if (
        value === null ||
        value === undefined
    ) {
        return false;
    }

    const normalized = String(value)
        .trim()
        .toLowerCase();

    return (
        normalized === "yes" ||
        normalized === "y" ||
        normalized === "true"
    );
}
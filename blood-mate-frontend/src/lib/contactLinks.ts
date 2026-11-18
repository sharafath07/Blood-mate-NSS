function internationalPhone(phone: string | null | undefined) {
    const compact = phone?.replace(/[\s().-]/g, '') ?? ''
    const international = compact.startsWith('00')
        ? '+' + compact.slice(2)
        : /^[1-9]\d{9}$/.test(compact) ? '+91' + compact
            : compact.startsWith('+') ? compact : '+' + compact

    return /^\+[1-9]\d{7,14}$/.test(international) ? international : null
}

export function callLink(phone: string | null | undefined) {
    const number = internationalPhone(phone)
    return number ? `tel:${number}` : null
}

export function whatsAppLink(phone: string | null | undefined, message: string) {
    const number = internationalPhone(phone)
    return number ? `https://wa.me/${number.slice(1)}?text=${encodeURIComponent(message)}` : undefined
}

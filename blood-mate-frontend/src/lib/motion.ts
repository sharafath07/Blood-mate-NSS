export const pageMotion = {
    initial: {
        opacity: 0,
        y: 12,
    },

    animate: {
        opacity: 1,
        y: 0,
    },

    transition: {
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1] as const,
    },
}


export const fadeMotion = {
    initial: {
        opacity: 0,
    },

    animate: {
        opacity: 1,
    },

    transition: {
        duration: 0.3,
    },
}

export const cardMotion = {
    whileHover: {
        y: -2,
    },

    transition: {
        duration: 0.2,
    },
}

export const listContainer = {
    hidden: {},

    show: {
        transition: {
            staggerChildren: 0.05,
        },
    },
}

export const listItem = {
    hidden: {
        opacity: 0,
        y: 8,
    },

    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1] as const,
        },
    },
}

export const cardHover = {
    y: -2,
    transition: {
        duration: 0.2,
    },
}
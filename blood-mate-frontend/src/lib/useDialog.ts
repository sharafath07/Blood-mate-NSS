import { useEffect, useRef } from 'react'

export function useDialog<T extends HTMLElement>(onClose: () => void, canClose = true) {
    const dialogRef = useRef<T>(null)
    const callbacks = useRef({ onClose, canClose })

    useEffect(() => { callbacks.current = { onClose, canClose } }, [onClose, canClose])

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        const previous = document.activeElement
        const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]',
        )).filter((element) => element.getClientRects().length > 0)
        dialog.focus()
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape' && callbacks.current.canClose) {
                event.preventDefault()
                callbacks.current.onClose()
            }
            if (event.key !== 'Tab' || !dialog) return
            const tabs = focusable()
            const first = tabs[0]
            const last = tabs[tabs.length - 1]
            if (!first || !last) {
                event.preventDefault()
            } else if (!dialog.contains(document.activeElement) || document.activeElement === dialog) {
                event.preventDefault()
                ;(event.shiftKey ? last : first).focus()
            } else if (event.shiftKey && document.activeElement === first) {
                event.preventDefault()
                last.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault()
                first.focus()
            }
        }
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('keydown', onKeyDown)
            if (previous instanceof HTMLElement && previous.isConnected) previous.focus()
        }
    }, [])

    return dialogRef
}

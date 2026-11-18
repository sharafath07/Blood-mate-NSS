import Badge from '../ui/Badge'
import type {
    RequestStatus,
    Urgency,
} from '../../data/bloodRequests'

export function RequestStatusBadge({
    status,
}: {
    status: RequestStatus
}) {
    const variant =
        status === 'FULFILLED'
            ? 'success'
            : status === 'CANCELLED'
                ? 'danger'
                : status === 'MATCHING'
                    ? 'warning'
                    : 'neutral'

    return (
        <Badge variant={variant} dot>
            {status}
        </Badge>
    )
}

export function UrgencyBadge({
    urgency,
}: {
    urgency: Urgency
}) {
    const variant =
        urgency === 'CRITICAL'
            ? 'danger'
            : urgency === 'URGENT'
                ? 'warning'
                : 'neutral'

    return (
        <Badge variant={variant} dot>
            {urgency ? urgency.charAt(0) + urgency.slice(1).toLowerCase() : "Normal"}
        </Badge>
    )
}

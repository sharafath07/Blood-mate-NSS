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
        status === 'Fulfilled'
            ? 'success'
            : status === 'Cancelled'
                ? 'danger'
                : status === 'Searching' ||
                    status === 'Donors Contacted' ||
                    status === 'Partially Fulfilled'
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
        urgency === 'Critical'
            ? 'danger'
            : urgency === 'Urgent'
                ? 'warning'
                : 'neutral'

    return (
        <Badge variant={variant} dot>
            {urgency}
        </Badge>
    )
}
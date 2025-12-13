import { useParams } from '@tanstack/react-router'

import UserAccountDetail from '@/shared/components/account/UserAccountDetail'

const AdminUserAccountDetailPage = () => {
    const params = useParams({ strict: false }) as { accountId?: string }

    return (
        <UserAccountDetail
            accountId={params.accountId ?? ''}
            title="Customer Insight"
            description="Review this customer’s contact info, loyalty balance, and ticket history to support operations decisions."
            backHref="/admin/user-accounts"
        />
    )
}

export default AdminUserAccountDetailPage

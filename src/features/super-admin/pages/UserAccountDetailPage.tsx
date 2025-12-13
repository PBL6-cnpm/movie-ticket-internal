import { useParams } from '@tanstack/react-router'

import UserAccountDetail from '@/shared/components/account/UserAccountDetail'

const SuperAdminUserAccountDetailPage = () => {
    const params = useParams({ strict: false }) as { accountId?: string }

    return (
        <UserAccountDetail
            accountId={params.accountId ?? ''}
            title="Customer Insight"
            description="Dive into the customer’s profile and track every ticket they have ever purchased across the entire chain."
            backHref="/super-admin/user-accounts"
        />
    )
}

export default SuperAdminUserAccountDetailPage

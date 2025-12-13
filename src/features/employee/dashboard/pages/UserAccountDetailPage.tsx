import { useParams } from '@tanstack/react-router'

import UserAccountDetail from '@/shared/components/account/UserAccountDetail'

const StaffUserAccountDetailPage = () => {
    const params = useParams({ strict: false }) as { accountId?: string }

    return (
        <UserAccountDetail
            accountId={params.accountId ?? ''}
            title="Customer Insight"
            description="Preview full booking activity to answer customer questions at the counter with confidence."
            backHref="/staff/user-accounts"
        />
    )
}

export default StaffUserAccountDetailPage

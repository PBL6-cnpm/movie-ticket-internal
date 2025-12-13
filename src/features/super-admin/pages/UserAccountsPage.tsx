import UserAccountsManager from '@/shared/components/account/UserAccountsManager'

const SuperAdminUserAccountsPage = () => {
    return (
        <UserAccountsManager
            title="Customer Accounts"
            description="Search, review, and disable any customer account across all branches."
            detailRouteBase="/super-admin/user-accounts"
        />
    )
}

export default SuperAdminUserAccountsPage

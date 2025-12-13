import UserAccountsManager from '@/shared/components/account/UserAccountsManager'

const AdminUserAccountsPage = () => {
    return (
        <UserAccountsManager
            title="Customer Accounts"
            description="View and disable customer accounts within the system."
            detailRouteBase="/admin/user-accounts"
        />
    )
}

export default AdminUserAccountsPage

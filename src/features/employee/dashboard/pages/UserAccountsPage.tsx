import UserAccountsManager from '@/shared/components/account/UserAccountsManager'

const StaffUserAccountsPage = () => {
    return (
        <UserAccountsManager
            title="Customer Accounts"
            description="View and disable customer accounts assigned to your branch."
            detailRouteBase="/staff/user-accounts"
        />
    )
}

export default StaffUserAccountsPage

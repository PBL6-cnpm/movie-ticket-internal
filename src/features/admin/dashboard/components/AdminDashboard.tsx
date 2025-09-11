'use client'

import { useAuth } from '@/features/auth/hooks/auth.hook'
import Button from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

const AdminDashboard = () => {
    const { user, logout } = useAuth()

    const handleLogout = () => {
        logout()
        window.location.href = '/login'
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                    <h1 className="text-4xl font-bold text-red-600 mb-4">Hello A dmin! 👑</h1>
                    <p className="text-xl text-gray-600">Welcome back, {user?.name}</p>
                </div>
                <Button onClick={handleLogout} className="bg-gray-600 hover:bg-gray-700 text-white">
                    Logout
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-red-600 flex items-center gap-2">
                        <span className="text-2xl">🔧</span>
                        Admin Control Panel
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Button className="h-20 bg-red-600 hover:bg-red-700 flex flex-col items-center justify-center">
                            <span className="text-xl mb-1">👥</span>
                            <span className="text-sm">Manage Users</span>
                        </Button>

                        <Button className="h-20 bg-red-600 hover:bg-red-700 flex flex-col items-center justify-center">
                            <span className="text-xl mb-1">🎬</span>
                            <span className="text-sm">Manage Movies</span>
                        </Button>

                        <Button className="h-20 bg-red-600 hover:bg-red-700 flex flex-col items-center justify-center">
                            <span className="text-xl mb-1">📊</span>
                            <span className="text-sm">View Reports</span>
                        </Button>

                        <Button className="h-20 bg-red-600 hover:bg-red-700 flex flex-col items-center justify-center">
                            <span className="text-xl mb-1">⚙️</span>
                            <span className="text-sm">System Settings</span>
                        </Button>

                        <Button className="h-20 bg-red-600 hover:bg-red-700 flex flex-col items-center justify-center">
                            <span className="text-xl mb-1">🏢</span>
                            <span className="text-sm">Branch Management</span>
                        </Button>

                        <Button className="h-20 bg-red-600 hover:bg-red-700 flex flex-col items-center justify-center">
                            <span className="text-xl mb-1">💰</span>
                            <span className="text-sm">Revenue Analytics</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-gray-600">
                        <p className="mb-2">You have full administrative access</p>
                        <div className="flex justify-center gap-4 text-sm">
                            <span>Account: {user?.account_id}</span>
                            <span>•</span>
                            <span>Branch: {user?.branch_id}</span>
                            <span>•</span>
                            <span>Coins: {user?.coin}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AdminDashboard

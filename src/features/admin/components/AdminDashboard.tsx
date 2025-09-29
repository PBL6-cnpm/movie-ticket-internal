import { Outlet } from '@tanstack/react-router'
import React from 'react'
import AdminHeader from './AdminHeader'

const AdminDashboard: React.FC = () => {
    // const dashboardStats = [
    //     {
    //         title: 'Tổng số Users',
    //         value: '1,234',
    //         description: 'Người dùng đăng ký',
    //         color: 'bg-secondary',
    //         iconColor: 'bg-secondary'
    //     },
    //     {
    //         title: 'Phim đang chiếu',
    //         value: '48',
    //         description: 'Phim hiện tại',
    //         color: 'bg-primary',
    //         iconColor: 'bg-primary'
    //     },
    //     {
    //         title: 'Rạp hoạt động',
    //         value: '12',
    //         description: 'Rạp chiếu phim',
    //         color: 'bg-secondary',
    //         iconColor: 'bg-secondary'
    //     },
    //     {
    //         title: 'Doanh thu tháng',
    //         value: '2.4M',
    //         description: 'VND trong tháng',
    //         color: 'bg-primary',
    //         iconColor: 'bg-primary'
    //     }
    // ]

    // const quickActions = [
    //     {
    //         title: 'Quản lý Role & Permissions',
    //         description: 'Cấp phát và quản lý quyền hạn cho các role khác nhau',
    //         link: '/admin/roles',
    //         buttonText: 'Quản lý Role'
    //     },
    //     {
    //         title: 'Quản lý User',
    //         description: 'Thêm, sửa, xóa và phân quyền cho người dùng',
    //         link: '/admin/users',
    //         buttonText: 'Quản lý User'
    //     },
    //     {
    //         title: 'Quản lý Phim',
    //         description: 'Thêm phim mới, cập nhật thông tin và lịch chiếu',
    //         link: '/admin/movies',
    //         buttonText: 'Quản lý Phim'
    //     },
    //     {
    //         title: 'Báo cáo & Thống kê',
    //         description: 'Xem báo cáo doanh thu và thống kê hệ thống',
    //         link: '/admin/reports',
    //         buttonText: 'Xem báo cáo'
    //     }
    // ]

    return (
        <div className="min-h-screen bg-brand p-6">
            <div className="max-w-7xl mx-auto">
                <AdminHeader />

                {/* Dashboard Stats */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {dashboardStats.map((stat, index) => (
                        <Card
                            key={index}
                            className="bg-surface border-surface hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 hover:scale-105"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <div
                                        className={`w-12 h-12 rounded-lg ${stat.iconColor} bg-opacity-20 flex items-center justify-center mr-4`}
                                    >
                                        <div className={`w-6 h-6 rounded ${stat.iconColor}`}></div>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-primary">
                                            {stat.value}
                                        </p>
                                        <p className="text-sm font-medium text-primary">
                                            {stat.title}
                                        </p>
                                        <p className="text-xs text-secondary">{stat.description}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div> */}

                {/* Quick Actions */}
                {/* <div className="mb-8">
                    <h2 className="text-xl font-semibold text-primary mb-4">Thao tác nhanh</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {quickActions.map((action, index) => (
                            <Card
                                key={index}
                                className="bg-surface border-surface hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 hover:scale-105"
                            >
                                <CardHeader>
                                    <CardTitle className="text-lg text-primary">
                                        {action.title}
                                    </CardTitle>
                                    <CardDescription className="text-secondary">
                                        {action.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link to={action.link}>
                                        <Button className="w-full btn-primary hover:bg-[#e86d28] hover:shadow-lg hover:shadow-[#fe7e32]/30">
                                            {action.buttonText}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div> */}

                {/* Recent Activities */}
                {/* <Card className="bg-surface border-surface">
                    <CardHeader>
                        <CardTitle className="text-primary">Hoạt động gần đây</CardTitle>
                        <CardDescription className="text-secondary">
                            Các thay đổi và hoạt động mới nhất trong hệ thống
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                {
                                    action: 'Thêm phim mới',
                                    details: '"Avengers: Endgame" được thêm vào hệ thống',
                                    time: '2 giờ trước',
                                    type: 'success'
                                },
                                {
                                    action: 'Cập nhật quyền user',
                                    details: 'User john.doe được cấp quyền manager',
                                    time: '4 giờ trước',
                                    type: 'info'
                                },
                                {
                                    action: 'Bảo trì rạp',
                                    details: 'Rạp CGV Landmark tạm ngừng hoạt động',
                                    time: '6 giờ trước',
                                    type: 'warning'
                                }
                            ].map((activity, index) => (
                                <div
                                    key={index}
                                    className="flex items-center space-x-4 p-4 rounded-lg bg-brand hover:bg-[#1f2937] transition-colors duration-200"
                                >
                                    <div
                                        className={`w-3 h-3 rounded-full ${
                                            activity.type === 'success'
                                                ? 'bg-primary'
                                                : activity.type === 'info'
                                                  ? 'bg-secondary'
                                                  : 'bg-primary'
                                        }`}
                                    ></div>
                                    <div className="flex-1">
                                        <p className="font-medium text-primary">
                                            {activity.action}
                                        </p>
                                        <p className="text-sm text-secondary">{activity.details}</p>
                                    </div>
                                    <span className="text-xs text-secondary">{activity.time}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card> */}
            </div>

            <Outlet />
        </div>
    )
}

export default AdminDashboard

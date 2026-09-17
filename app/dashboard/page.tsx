import Link from 'next/link';
import MessageManager from '@/components/MessageManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DashboardPage() {
    return (
        <main className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">📊 Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">จัดการข้อความติดต่อจากผู้ใช้งาน (CRUD ครบ)</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/blog-spa?source=products"
                        className="rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm shadow-md"
                    >
                        <span className="text-white font-bold">🛍️ ดูสินค้า</span>
                    </Link>
                    <form action="/api/logout" method="POST">
                        <button
                            type="submit"
                            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-sm"
                        >
                            Logout
                        </button>
                    </form>
                </div>
            </div>

            {/* API Guide Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🔍</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Search</span>
                    </div>
                    <p className="text-xs text-slate-600">GET /api/contact?search=</p>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">👁️</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Read One</span>
                    </div>
                    <p className="text-xs text-slate-600">GET /api/messages/[id]</p>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50/50 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">✏️</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Update</span>
                    </div>
                    <p className="text-xs text-slate-600">PATCH /api/messages/[id]</p>
                </div>

                <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-pink-50/50 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🗑️</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-red-600">Delete</span>
                    </div>
                    <p className="text-xs text-slate-600">DELETE /api/messages/[id]</p>
                </div>
            </div>

            {/* Message Manager — เรียกใช้ API ทั้งหมด */}
            <MessageManager />
        </main>
    );
}
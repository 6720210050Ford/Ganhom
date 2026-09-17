import Link from 'next/link';
import { getMessages } from '@/lib/messages';
import ReplyButton from '@/components/ReplyButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DashboardPage() {
    const messages = getMessages();
    const sortedMessages = [...messages].reverse();

    return (
        <main className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">📊 Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">รายการข้อความติดต่อจากผู้ใช้งานทั้งหมด</p>
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">ข้อความทั้งหมด</span>
                        <span className="text-2xl">📬</span>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900">{messages.length}</p>
                    <p className="text-xs text-slate-500 mt-1">รายการติดต่อจากผู้ใช้งาน</p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">สถานะระบบ</span>
                        <span className="text-2xl">🟢</span>
                    </div>
                    <p className="text-xl font-bold text-slate-900 mt-1">พร้อมใช้งาน</p>
                    <p className="text-xs text-slate-500 mt-1">ระบบกรองอีเมลทำงานปกติ</p>
                </div>

                <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50/50 p-5 shadow-sm sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-sky-600">โดเมนที่รองรับ</span>
                        <span className="text-2xl">🔒</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 mt-1">@tsu.ac.th</p>
                    <p className="text-xs font-bold text-slate-700">@gmail.com</p>
                </div>
            </div>

            {sortedMessages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
                    <div className="text-4xl mb-3">📩</div>
                    <h3 className="font-bold text-slate-700 text-lg mb-1">ยังไม่มีข้อความที่ส่งเข้ามา</h3>
                    <p className="text-sm text-slate-500 mb-4">เมื่อมีผู้ใช้งานกรอกฟอร์มในหน้าติดต่อเรา รายการจะแสดงขึ้นที่นี่ทันที</p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm"
                    >
                        📞 ไปยังหน้าติดต่อเรา
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedMessages.map((msg) => (
                        <div key={msg.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition duration-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-base">
                                        {msg.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{msg.name}</p>
                                        <p className="text-xs text-blue-600 font-medium">✉️ {msg.email}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
                                    🕒 {new Date(msg.createdAt).toLocaleString('th-TH')}
                                </span>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 mb-3">
                                <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">ข้อความ:</p>
                                <p className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">{msg.message}</p>
                            </div>
                            
                            {/* ปุ่มตอบกลับสำหรับ Admin */}
                            <ReplyButton email={msg.email} name={msg.name} message={msg.message} />
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
import { getMessages } from '@/lib/messages';

export default function DashboardPage() {
    const messages = getMessages();

    return (
        <main className="p-8">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <form action="/api/logout" method="POST">
                    <button
                        type="submit"
                        className="rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
                    >
                        Logout
                    </button>
                </form>
            </div>
            <p>จํานวนข้อความที่ได้รับ: {messages.length}</p>
        </main>
    );
}
'use client';

import { useState } from 'react';

interface ReplyButtonProps {
    email: string;
    name: string;
    message: string;
}

export default function ReplyButton({ email, name, message }: ReplyButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [sentStatus, setSentStatus] = useState(false);

    const handleSend = () => {
        const bodyText = `สวัสดีคุณ ${name},\n\nขอบคุณสำหรับการติดต่อเรา:\n"${message}"\n\nคำตอบจากผู้ดูแลระบบ:\n${replyText}\n\nขอแสดงความนับถือ,\nทีมงาน My Blog`;
        const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(`ตอบกลับข้อความจาก My Blog ถึงคุณ ${name}`)}&body=${encodeURIComponent(bodyText)}`;
        window.location.href = mailtoUrl;
        setSentStatus(true);
        setTimeout(() => {
            setSentStatus(false);
            setIsOpen(false);
            setReplyText('');
        }, 2500);
    };

    return (
        <div className="mt-2">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 border border-blue-200 shadow-sm cursor-pointer"
            >
                💬 ตอบกลับ
            </button>

            {isOpen && (
                <div className="mt-3 p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-3 shadow-inner">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-700">
                            ✉️ ตอบกลับไปยัง: <span className="text-blue-600">{email}</span>
                        </p>
                        <span className="text-xs text-slate-400">ส่งผ่านแอปพลิเคชันอีเมล</span>
                    </div>
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`พิมพ์ข้อความตอบกลับถึงคุณ ${name}...`}
                        rows={3}
                        className="w-full p-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />
                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="button"
                            onClick={handleSend}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                        >
                            🚀 ส่งการตอบกลับ (Mailto)
                        </button>
                    </div>
                    {sentStatus && (
                        <p className="text-xs font-bold text-green-600 bg-green-50 p-2 rounded border border-green-200">
                            ✅ กำลังเปิดโปรแกรมอีเมลเพื่อส่งข้อความ...
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

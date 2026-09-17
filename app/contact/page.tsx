import ContactForm from '@/components/ContactForm';
import type { Metadata } from 'next';
import { createMessage, listMessages } from '@/lib/messageService'; 
  
export async function GET() { 
  return Response.json({ messages: listMessages() }); 
} 

export const metadata: Metadata = {
    title: 'ติดต่อเรา',
    description: 'ส่งข้อความติดต่อทีมงาน My Blog',
};

export default function ContactPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 mb-3 border border-blue-100">
                    <span>📞 Contact Us</span>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">ติดต่อเรา</h1>
                <p className="text-sm text-slate-500 mt-1">ส่งข้อความถึงเรา หรือสอบถามข้อมูลเพิ่มเติมได้ที่นี่</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-12 items-start">
                {/* Left Info Panel */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-500/10">
                        <h2 className="text-xl font-bold mb-2">ช่องทางการติดต่อ 💬</h2>
                        <p className="text-xs text-blue-100 mb-6 leading-relaxed">
                            ยินดีต้อนรับ! สามารถส่งข้อความคำถาม ข้อเสนอแนะ หรือข้อติชมถึงเราได้ตลอด 24 ชั่วโมง
                        </p>

                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                                <span className="text-xl">📧</span>
                                <div>
                                    <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">อีเมลที่รองรับ</p>
                                    <p className="font-medium text-white text-xs mt-0.5">เฉพาะ @tsu.ac.th และ @gmail.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                                <span className="text-xl">⚡</span>
                                <div>
                                    <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">ระยะเวลาตอบกลับ</p>
                                    <p className="font-medium text-white text-xs mt-0.5">ตอบกลับภายใน 24 ชั่วโมง</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                                <span className="text-xl">📍</span>
                                <div>
                                    <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">สถานที่</p>
                                    <p className="font-medium text-white text-xs mt-0.5">มหาวิทยาลัยทักษิณ (TSU)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                        <p className="text-xs font-semibold text-blue-700">💡 คำแนะนำ:</p>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            โปรดตรวจสอบว่าใส่อีเมลถูกต้อง เพื่อให้แอดมินสามารถตอบกลับข้อความของท่านไปยังอีเมลดังกล่าวได้
                        </p>
                    </div>
                </div>

                {/* Right Form Panel */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                        ส่งข้อความติดต่อ
                    </h2>
                    <ContactForm />
                </div>
            </div>
        </div>
    );
}
export async function POST(request: Request) { 
  const body = await request.json(); 
  try { 
    const saved = createMessage(body); 
    return Response.json({ ok: true, item: saved }, { status: 201 }); 
  } catch (err) { 
    return Response.json({ error: (err as Error).message }, { status: 400 }); 
  } 
} 
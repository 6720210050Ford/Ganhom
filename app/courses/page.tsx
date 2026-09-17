import { courses } from '@/lib/courses';
import Link from 'next/link';

export default function Courses() {
    return (
        <div className="space-y-6">
            <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 mb-2 border border-blue-100">
                    <span>📚 Course Catalog</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">รายวิชาที่เรียน</h1>
                <p className="text-sm text-slate-500 mt-1">ข้อมูลรายละเอียดรายวิชา ผู้สอน และหัวข้อการเรียนรู้ในหลักสูตร</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((c) => (
                    <div
                        key={c.id}
                        className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="rounded-xl bg-blue-100 text-blue-700 px-3 py-1 text-xs font-extrabold">
                                    {c.code}
                                </span>
                                <span className="text-xs font-semibold text-slate-400">
                                    {c.credits} หน่วยกิต
                                </span>
                            </div>

                            <h2 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                {c.name}
                            </h2>

                            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                                {c.description}
                            </p>

                            <p className="text-xs font-semibold text-blue-600 mb-4">
                                👨‍🏫 ผู้สอน: {c.instructor}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">หัวข้อหลัก:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {c.topics.map((topic, i) => (
                                    <span
                                        key={i}
                                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                                    >
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
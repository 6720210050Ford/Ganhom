// lib/courses.ts
export interface Course {
    id: string;
    code: string;
    name: string;
    credits: number;
    instructor: string;
    description: string;
    topics: string[];
}

export const courses: Course[] = [
    {
        id: 'cs101',
        code: 'CS101',
        name: 'Computer Programming I',
        credits: 3,
        instructor: 'ผศ.ดร. สมชาย ใจดี',
        description: 'ศึกษาพื้นฐานการเขียนโปรแกรม โครงสร้างการควบคุม ฟังก์ชัน อาร์เรย์',
        topics: ['Variables & Data Types', 'Control Structures', 'Functions', 'Arrays']
    },
    {
        id: 'cs202',
        code: 'CS202',
        name: 'Data Structures & Algorithms',
        credits: 3,
        instructor: 'อ.ดร. สุภาพร วิทยากุล',
        description: 'ศึกษาโครงสร้างข้อมูลพื้นฐาน Stack, Queue, Tree และ Sorting Algorithms',
        topics: ['Big-O Analysis', 'Stack & Queue', 'Binary Search Tree', 'Sorting']
    },
    {
        id: 'cs303',
        code: 'CS303',
        name: 'Web Development Technology',
        credits: 3,
        instructor: 'อ.วิชัย พัฒนซอฟต์',
        description: 'ศึกษาเทคโนโลยีเว็บ React, Next.js App Router และ REST API',
        topics: ['HTML/CSS & Tailwind', 'JavaScript/TypeScript', 'Next.js App Router', 'APIs']
    }
];
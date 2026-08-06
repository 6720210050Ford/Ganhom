'use client';
import { useState } from 'react';
export default function WarmupPage() {
    const [text, setText] = useState('');
    return (
        <div className="p-8">
            <input value={text} onChange={(e) => setText(e.target.value)} />
            <p>พิมพ์ว่า: {text}</p>
        </div>
    );
}
import { NextRequest, NextResponse } from 'next/server';
import { getMessageById } from '@/lib/messageService';
import { editMessage } from '@/lib/messageService';



export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const message = getMessageById(id);
  if (!message) {
    return NextResponse.json({ error: 'ไม่พบข้อความนี้' }, { status: 404 });
  }
  return NextResponse.json({ message });
} 
//เพิ่มเติม 
export async function PATCH( 
  request: Request, 
  { params }: { params: { id: string } } 
) { 
  const updates = await request.json(); 
  const updated = editMessage(params.id, updates); 
  if (!updated) { 
    return Response.json({ error: 'ไม่พบข้อความนี้' }, { status: 404 }); 
  } 
  return Response.json({ ok: true, item: updated }); 
} 

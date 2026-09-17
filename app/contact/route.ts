import { listMessages } from "@/lib/messageService";

export async function GET(request: Request) { 
  const url = new URL(request.url); 
  const search = url.searchParams.get('search') ?? ''; 
  
  const all = listMessages(); 
  const filtered = search 
    ? all.filter((m) => m.name.includes(search) || m.message.includes(search)) 
    : all; 
  
  return Response.json({ messages: filtered }); 
}
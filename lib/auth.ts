export function getSessionUserId(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function resolveImageUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${url}`;
}

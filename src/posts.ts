export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  body: string;
  readTime: number;
}

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, content: raw };
  const data: Record<string, unknown> = {};
  m[1].split('\n').forEach(line => {
    const colon = line.indexOf(':');
    if (colon < 0) return;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      data[key] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
    } else {
      data[key] = val.replace(/^["']|["']$/g, '');
    }
  });
  return { data, content: m[2] };
}

const modules = import.meta.glob('./posts/en/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const posts: Post[] = Object.entries(modules)
  .map(([path, raw]) => {
    const { data, content } = parseFrontmatter(raw);
    const slug = path.split('/').pop()!.replace('.md', '');
    const words = content.trim().split(/\s+/).length;
    return {
      slug,
      title:    (data.title   as string) ?? slug,
      date:     (data.date    as string) ?? '',
      tags:     (data.tags    as string[]) ?? [],
      excerpt:  (data.excerpt as string) ?? content.slice(0, 160) + '…',
      body:     content,
      readTime: Math.max(1, Math.round(words / 200)),
    };
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

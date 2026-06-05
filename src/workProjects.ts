export interface WorkProject {
  slug: string;
  title: string;
  company: string;
  tags: string[];
  period: string;
  body: string;
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

const modules = import.meta.glob('./projects/en/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const workProjects: WorkProject[] = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, raw]) => {
    const { data, content } = parseFrontmatter(raw);
    const slug = path.split('/').pop()!.replace('.md', '');
    return {
      slug,
      title:   (data.title   as string) ?? slug,
      company: (data.company as string) ?? '',
      tags:    (data.tags    as string[]) ?? [],
      period:  (data.period  as string) ?? '',
      body:    content.trim(),
    };
  });

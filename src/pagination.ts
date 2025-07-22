import { format } from 'util';

type Relative<T extends string = string> = `${T}/`;
type Base<B extends string> = B extends '' ? '' : B extends Relative ? B : Relative<B>;
type Path<B extends string> = `${Base<B>}${string}`;
type Link<B extends string> = '' | Path<B>;

export = function pagination<B extends string, P, L extends string | string[], D extends Object>(base: B, posts: P[], {
  format: _format = 'page/%d/',
  layout = ['archive', 'index'] as L,
  data = {} as D,
  perPage = 10,
  explicitPaging = false,
} = {}) {
  if (typeof base !== 'string') throw new TypeError('base must be a string!');
  if (!posts) throw new TypeError('posts is required!');

  let _base = base as Base<B>;
  if (_base && !_base.endsWith('/')) {
    _base = `${base}/` as Base<B>;
  }

  const urlCache = new Map<number, Path<B>>();
  function formatURL(i: number) {
    if (urlCache.has(i)) return urlCache.get(i)!;

    let url = _base as Path<B>;
    if (explicitPaging || i > 1) {
      url = `${_base}${format(_format, i)}` as Path<B>;
    }
    urlCache.set(i, url);

    return url;
  }

  const total = perPage ? Math.ceil(posts.length / perPage) : 1;
  function makeData(i: number) {
    const data = {
      base: _base,
      total,
      current: i,
      current_url: formatURL(i),
      posts: perPage ? posts.slice(perPage * (i - 1), perPage * i) : posts,
      prev: 0,
      prev_link: '' as Link<B>,
      next: 0,
      next_link: '' as Link<B>,
    };

    if (i > 1) {
      data.prev = i - 1;
      data.prev_link = formatURL(data.prev);
    }

    if (i < total) {
      data.next = i + 1;
      data.next_link = formatURL(data.next);
    }

    return data;
  }

  if (!perPage) return [
    {
      path: _base,
      layout,
      data: Object.assign(makeData(1), data),
    },
  ]

  const result: {
    path: Path<B>;
    layout: L;
    data: D & {
      base: Base<B>;
      total: number;
      current: number;
      current_url: Path<B>;
      posts: P[];
      prev: number;
      prev_link: Link<B>;
      next: number;
      next_link: Link<B>;
    };
  }[] = [];

  for (let i = 1; i <= total; i++) {
    result.push({
      path: formatURL(i),
      layout,
      data: Object.assign(makeData(i), data),
    });
  }

  return result;
}

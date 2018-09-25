'use strict';

const should = require('chai').should(); // eslint-disable-line

describe('pagination', () => {
  const pagination = require('..');

  // Make some fixtures
  const posts = [];

  for (let i = 0; i < 25; i++) {
    posts.push({id: i});
  }

  it('no base', () => {
    try {
      pagination();
    } catch (err) {
      err.should.have.property('message', 'base must be a string!');
    }
  });

  it('no posts', () => {
    try {
      pagination('/');
    } catch (err) {
      err.should.have.property('message', 'posts is required!');
    }
  });

  it('default', () => {
    const result = pagination('/', posts);

    result.should.eql([
      {
        path: '/',
        layout: ['archive', 'index'],
        data: {
          base: '/',
          total: 3,
          current: 1,
          current_url: '/',
          posts: posts.slice(0, 10),
          prev: 0,
          prev_link: '',
          next: 2,
          next_link: '/page/2/'
        }
      },
      {
        path: '/page/2/',
        layout: ['archive', 'index'],
        data: {
          base: '/',
          total: 3,
          current: 2,
          current_url: '/page/2/',
          posts: posts.slice(10, 20),
          prev: 1,
          prev_link: '/',
          next: 3,
          next_link: '/page/3/'
        }
      },
      {
        path: '/page/3/',
        layout: ['archive', 'index'],
        data: {
          base: '/',
          total: 3,
          current: 3,
          current_url: '/page/3/',
          posts: posts.slice(20, 30),
          prev: 2,
          prev_link: '/page/2/',
          next: 0,
          next_link: ''
        }
      }
    ]);
  });

  it('add trailing slash to base', () => {
    const result = pagination('tags', posts);

    result[0].path.should.eql('tags/');
    result[1].path.should.eql('tags/page/2/');
    result[2].path.should.eql('tags/page/3/');
  });

  it('perPage = 0', () => {
    const result = pagination('/', posts, {
      perPage: 0
    });

    result.should.eql([
      {
        path: '/',
        layout: ['archive', 'index'],
        data: {
          base: '/',
          total: 1,
          current: 1,
          current_url: '/',
          posts,
          prev: 0,
          prev_link: '',
          next: 0,
          next_link: ''
        }
      }
    ]);
  });

  it('format', () => {
    const result = pagination('/', posts, {
      format: 'index-%d.html'
    });

    result[0].path.should.eql('/');
    result[1].path.should.eql('/index-2.html');
    result[2].path.should.eql('/index-3.html');
  });

  it('layout', () => {
    const result = pagination('/', posts, {
      layout: 'test'
    });

    for (let i = 0, len = result.length; i < len; i++) {
      result[i].layout.should.eql('test');
    }
  });

  it('data', () => {
    const result = pagination('/', posts, {
      data: {tag: 'test'}
    });

    for (let i = 0, len = result.length; i < len; i++) {
      result[i].data.tag.should.eql('test');
    }
  });
});

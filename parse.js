'use strict';

const htmlparser = require('htmlparser2');
const qs = require('querystring');
const trans = require('./trans.js');

const decodeContent = content => {
  content = content.replace(/&amp;/g, '&');
  const re = /&#[0-9]+;/g;
  const m = content.match(re);
  if (m && m.length > 0) {
    m.forEach(x => {
      const c = String.fromCharCode(x.replace(/[&#;]/g, ''));
      content = content.replace(x, c);
    });
  }
  content = content.replace(/&lt;br\/&gt;/g, '\n');
  content = content.replace(/^\?\?\?/g, '');
  content = content.replace(/(^\s+)|(\s+$)/g, '');

  const m1 = content.match(/&[a-zA-Z]+;/g);
  if (m1 && m1.length > 0) {
    m1.forEach(x => {
      if (trans[x]) {
        content = content.replace(x, trans[x]);
      }
    });
  }
  return content;
};

const parseSearchResults = (data, cb) => {
  let items = [];
  let depth = 0;
  let entryDepth = null;
  let titleDepth = null;
  let idDepth = null;
  let contentDepth = null;
  const createItem = () => {
    return {
      title: '',
      id: '',
      content: '',
    };
  };
  let pendingItem = createItem();
  const parser = new htmlparser.Parser(
    {
      onopentag: (name, attrs) => {
        depth++;
        switch (name) {
          case 'entry':
            entryDepth = depth;
            break;
          case 'title':
            titleDepth = depth;
            break;
          case 'id':
            idDepth = depth;
            break;
          case 'content':
            contentDepth = depth;
            break;
          /*
          case 'link':
            if (entryDepth && entryDepth < depth) {
              if (attrs.href) {
                pendingItem.link = attrs.href;
              }
            }
            break;
*/
        }
      },
      ontext: text => {
        if (entryDepth === null) {
          return;
        }
        if (titleDepth && titleDepth === depth) {
          pendingItem.title = decodeContent(text);
        }
        if (idDepth && idDepth === depth) {
          pendingItem.id = decodeContent(text);
        }
        if (contentDepth && contentDepth === depth) {
          pendingItem.content = decodeContent(text);
        }
      },
      onclosetag: name => {
        if (titleDepth && titleDepth >= depth) {
          titleDepth = null;
        }
        if (idDepth && idDepth >= depth) {
          idDepth = null;
        }
        if (contentDepth && contentDepth >= depth) {
          contentDepth = null;
        }
        if (entryDepth && entryDepth >= depth) {
          items.push(pendingItem);
          pendingItem = createItem();
          entryDepth = null;
        }
        depth--;
      },
      onend: () => {
        cb(null, items);
      },
    },
    {decodeEntities: false},
  );
  parser.write(data);
  parser.end();
};

module.exports = {
  parseSearchResults,
};

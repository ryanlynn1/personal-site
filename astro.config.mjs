import { defineConfig } from 'astro/config';

/**
 * Open every link inside blog-post Markdown in a new tab.
 * Only Markdown content (src/content/blog) runs through this, so site
 * chrome (nav, footer, post rows) is unaffected. In-page "#" anchors
 * are left alone. rel="noopener" for safety; referrer is preserved.
 */
function rehypeLinksNewTab() {
  return (tree) => {
    const walk = (node) => {
      if (
        node.type === 'element' &&
        node.tagName === 'a' &&
        node.properties &&
        typeof node.properties.href === 'string' &&
        !node.properties.href.startsWith('#')
      ) {
        node.properties.target = '_blank';
        node.properties.rel = 'noopener';
      }
      if (node.children) node.children.forEach(walk);
    };
    walk(tree);
  };
}

export default defineConfig({
  site: 'https://ryanlynn.ai',
  markdown: {
    gfm: true,
    rehypePlugins: [rehypeLinksNewTab],
  },
});

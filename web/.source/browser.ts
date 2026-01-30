// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"faq.mdx": () => import("../content/docs/faq.mdx?collection=docs"), "getting-started.mdx": () => import("../content/docs/getting-started.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "cloud/api-keys.mdx": () => import("../content/docs/cloud/api-keys.mdx?collection=docs"), "cloud/pricing.mdx": () => import("../content/docs/cloud/pricing.mdx?collection=docs"), "samples/branch-opening.mdx": () => import("../content/docs/samples/branch-opening.mdx?collection=docs"), "samples/video-introduction.mdx": () => import("../content/docs/samples/video-introduction.mdx?collection=docs"), }),
};
export default browserCollections;
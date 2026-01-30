// @ts-nocheck
import * as __fd_glob_9 from "../content/docs/samples/video-introduction.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/samples/branch-opening.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/cloud/pricing.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/cloud/api-keys.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/index.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/getting-started.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/faq.mdx?collection=docs"
import { default as __fd_glob_2 } from "../content/docs/samples/meta.json?collection=docs"
import { default as __fd_glob_1 } from "../content/docs/cloud/meta.json?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_0, "cloud/meta.json": __fd_glob_1, "samples/meta.json": __fd_glob_2, }, {"faq.mdx": __fd_glob_3, "getting-started.mdx": __fd_glob_4, "index.mdx": __fd_glob_5, "cloud/api-keys.mdx": __fd_glob_6, "cloud/pricing.mdx": __fd_glob_7, "samples/branch-opening.mdx": __fd_glob_8, "samples/video-introduction.mdx": __fd_glob_9, });
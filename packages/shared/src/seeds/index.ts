/**
 * Barrel export for all seed data modules.
 *
 * @module @buzzy/shared/seeds
 */

export { SEED_ARTICLES, toFeedArticle } from './seedArticles.js';
export type { SeedArticleDetail, SeedFeedArticle } from './seedArticles.js';

export { SEED_COMMENTS } from './seedComments.js';
export type { SeedCommentDTO } from './seedComments.js';

export { SEED_DIGEST } from './seedDigest.js';
export type { SeedDigestDTO } from './seedDigest.js';

export { buildSeedHomepage } from './seedHomepage.js';
export type { SeedClumpStory, SeedContentClump, SeedTickerTag, SeedHomepageFeed } from './seedHomepage.js';

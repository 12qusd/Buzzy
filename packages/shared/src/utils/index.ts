/**
 * Barrel export for all Buzzy Today utilities.
 *
 * @module @buzzy/shared/utils
 */

export { generateSlug, isValidSlug } from './slug.js';

export {
  calculateFEScore,
  calculateRankingScore,
  calculateTagMatchScore,
  applyTimeDecay,
} from './scoring.js';

export { formatDateline } from './dateline.js';

export {
  BuzzyError,
  NotFoundError,
  ValidationError,
  DuplicateError,
  AuthenticationError,
  AuthorizationError,
  ExternalServiceError,
  RateLimitError,
} from './errors.js';

export { generateContentHash, generateUrlHash } from './contentHash.js';

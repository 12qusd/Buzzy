/**
 * Seed daily digest data for development without Firestore.
 *
 * @module @buzzy/shared/seeds/seedDigest
 */

/** Digest DTO (mirrors DigestDTO from digestService) */
export interface SeedDigestDTO {
  id: string;
  date: string;
  url: string;
  whatsNarrative: string;
  top5Stories: Array<{
    articleId: string;
    headline: string;
    whyItBlewUp: string;
    categoryName: string;
    categoryColor: string;
    thumbnailUrl: string;
  }>;
  whatPeopleAreSaying: string[];
  byCategory: Array<{
    categoryName: string;
    summary: string;
    articleId: string;
  }>;
  buzzyMoment: string;
  whyThisMatters: string;
  generatedAt: string;
  isPublic: boolean;
}

export const SEED_DIGEST: SeedDigestDTO = {
  id: 'digest-2026-03-02',
  date: '2026-03-02',
  url: '/digest',
  whatsNarrative:
    "Today's biggest story is the 7.1 earthquake in central Turkey, where rescue operations are racing against time. In tech, OpenAI shattered benchmarks with GPT-5 while Apple tried to make spatial computing affordable. The Fed signaled a June rate cut as inflation finally hit target, and Ethereum's Pectra upgrade slashed gas fees by 90%. Meanwhile, a CRISPR trial effectively cured sickle cell disease in 90% of patients, and Caitlin Clark broke the WNBA scoring record with 51 points.",
  top5Stories: [
    {
      articleId: 'seed-news-1',
      headline: 'Magnitude 7.1 Earthquake Hits Central Turkey — Rescue Operations Underway',
      whyItBlewUp: 'Major natural disaster with international humanitarian response.',
      categoryName: 'News',
      categoryColor: '#EF4040',
      thumbnailUrl: 'https://picsum.photos/seed/turkey-earthquake-71/400/225',
    },
    {
      articleId: 'seed-tech-1',
      headline: 'OpenAI Unveils GPT-5: Reasoning Benchmarks Shattered Overnight',
      whyItBlewUp: 'Doubled benchmark scores triggered AGI debate across the tech industry.',
      categoryName: 'Tech',
      categoryColor: '#3C82F6',
      thumbnailUrl: 'https://picsum.photos/seed/openai-gpt5/400/225',
    },
    {
      articleId: 'seed-sports-1',
      headline: 'Caitlin Clark Drops 51 Points as Fever Clinch Top Playoff Seed',
      whyItBlewUp: 'Broke WNBA single-game scoring record in a clinching game — peak drama.',
      categoryName: 'Sports',
      categoryColor: '#F59E09',
      thumbnailUrl: 'https://picsum.photos/seed/caitlin-clark-51/400/225',
    },
    {
      articleId: 'seed-money-1',
      headline: 'Fed Signals June Rate Cut as Inflation Hits 2.1% Target',
      whyItBlewUp: 'First clear rate cut signal in 18 months — affects every mortgage and loan in America.',
      categoryName: 'Money',
      categoryColor: '#059669',
      thumbnailUrl: 'https://picsum.photos/seed/fed-rate-cut-june/400/225',
    },
    {
      articleId: 'seed-science-1',
      headline: 'CRISPR Trial Reverses Sickle Cell Disease in 90% of Patients',
      whyItBlewUp: 'A functional cure for a devastating genetic disease — historic medical milestone.',
      categoryName: 'Science',
      categoryColor: '#10B981',
      thumbnailUrl: 'https://picsum.photos/seed/crispr-sickle-cell/400/225',
    },
  ],
  whatPeopleAreSaying: [
    '"The ARC-AGI jump is wild but I want to see real-world coding benchmarks before calling this AGI." — @samdev on the GPT-5 announcement',
    '"$75 starting price?? Beyoncé said Ticketmaster is NOT going to price out the fans this time." — @beyhive_jade on the Renaissance Tour II',
    '"As a hematologist — this is the most significant advance in sickle cell treatment since hydroxyurea in the 90s." — @drjohnson on the CRISPR trial',
    '"The fact that we need a law to prevent elected officials from insider trading tells you everything about the system." — @voter_first on the TRUST Act',
  ],
  byCategory: [
    {
      categoryName: 'Tech',
      summary: 'GPT-5 dominated the conversation with its benchmark-shattering debut, while Apple bet on price cuts and prescription lenses to save Vision Pro.',
      articleId: 'seed-tech-1',
    },
    {
      categoryName: 'Science',
      summary: 'A CRISPR trial showed 90% cure rates for sickle cell, and JWST detected potential biosignatures on an exoplanet 120 light-years away.',
      articleId: 'seed-science-1',
    },
    {
      categoryName: 'Money',
      summary: 'The Fed gave its clearest rate cut signal yet as inflation fell to 2.1%, and Gen Z data showed they\'re saving more than Millennials did.',
      articleId: 'seed-money-1',
    },
    {
      categoryName: 'Crypto',
      summary: 'Ethereum\'s Pectra upgrade slashed gas fees by 90%, and the SEC approved the first Solana spot ETF.',
      articleId: 'seed-crypto-1',
    },
  ],
  buzzyMoment:
    "Caitlin Clark's 51-point explosion didn't just break the WNBA scoring record — it broke social media. Her game was the #1 trending topic on every platform for 6 straight hours, with clips generating 200M views. The convergence of athletic excellence and cultural moment made this the day's can't-miss story.",
  whyThisMatters:
    'Three threads connect today\'s biggest stories: the acceleration of AI (GPT-5, EU regulation, virtual production), the ripple effects of monetary policy (Fed rate cut, oil prices, market records), and the power of individual human achievement (Clark\'s record, CRISPR scientists). Technology is moving faster than governance can keep up, money is about to get cheaper, and sometimes one person really can change everything.',
  generatedAt: '2026-03-02T06:00:00Z',
  isPublic: true,
};

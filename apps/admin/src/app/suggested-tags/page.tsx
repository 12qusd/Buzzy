/**
 * Suggested Tags review page.
 * Allows admins to approve or reject AI-suggested topic tags.
 *
 * @module @buzzy/admin/app/suggested-tags/page
 */

import { SuggestedTagsClient } from './SuggestedTagsClient';

export const metadata = {
  title: 'Suggested Tags — Buzzy Admin',
};

/**
 * Server component wrapper for the suggested tags page.
 */
export default function SuggestedTagsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Suggested Tags</h1>
      <SuggestedTagsClient />
    </div>
  );
}

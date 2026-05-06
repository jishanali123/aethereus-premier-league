/**
 * App-wide feature flags.
 *
 * AUCTION_LOCKED:
 *   - true  -> all auction edit surfaces are disabled across the app:
 *              SalePanel cannot mark sold/unsold or edit prices,
 *              the Export Auction Results button is hidden on PlayersPage.
 *              Existing auction results in localStorage are PRESERVED and
 *              still display normally.
 *   - false -> auction is editable again.
 *
 * To unlock for one-off corrections after the auction:
 *   1. Set AUCTION_LOCKED to false here.
 *   2. Hard-refresh the browser (Ctrl + Shift + R).
 *   3. Make the change in the UI.
 *   4. Set it back to true and reload to re-lock.
 *   5. (Optional) Re-export the auction results JSON to keep the saved
 *      snapshot in sync.
 */
export const AUCTION_LOCKED = true;

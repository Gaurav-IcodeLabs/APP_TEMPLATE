/**
 * AuthInfo object returned by SDK authInfo() method
 * Based on: https://sharetribe.github.io/flex-sdk-js/authentication.html#determine-if-user-is-logged-in
 */
export interface AuthInfo {
  /** Array containing the scopes associated with the currently stored token */
  scopes?: string[];

  /** Boolean denoting if the currently stored token only allows public read access */
  isAnonymous?: boolean;

  /** Boolean denoting if the marketplace operator is logged in as a marketplace user */
  isLoggedInAs?: boolean;
}

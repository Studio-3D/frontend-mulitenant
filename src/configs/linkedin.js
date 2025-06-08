/**
 * LinkedIn API configuration
 */
export const LinkedInConfig = {
  clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || '',
  redirectUri: process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI || 
    `${window.location.origin}/linkedin-callback`,
  scope: 'r_liteprofile r_emailaddress w_member_social',
  
  // Generate a random state for CSRF protection
  generateState() {
    return Math.random().toString(36).substring(2, 15) + 
      Math.random().toString(36).substring(2, 15);
  },
  
  // Build the authorization URL
  getAuthUrl(state) {
    return `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code` +
      `&client_id=${this.clientId}` +
      `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
      `&state=${state}` +
      `&scope=${encodeURIComponent(this.scope)}`;
  }
};

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=$/{env.GITHUB_CLIENT_ID}&scope=repo,user&redirect_uri=${url.origin}/decap-auth/callback`;
  return Response.redirect(redirectUrl, 302);
}

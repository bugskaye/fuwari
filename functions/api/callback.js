export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  // 1. 去向 GitHub 交換真正的 Access Token
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code: code
    })
  });
  
  const data = await response.json();
  const token = data.access_token;

  // 2. ⚡【終極大絕招】：不再喊話！直接在網址後方帶上鑰匙，強行將小視窗直接導航回到大後台！
  // 這樣一來，後台的 Decap CMS 就能在同一個網址內瞬間捕捉到通行證，直接解鎖！
  const redirectUrl = `${url.origin}/admin/#/tags?token=${token}&provider=github`;
  
  return Response.redirect(redirectUrl, 302);
}

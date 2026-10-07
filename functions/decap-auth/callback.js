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

  // 2. ⚡【不使用廣播，直接強行導航】：直接將小視窗轉發去帶有權限金鑰的後台入口！
  // 這樣一來，Decap CMS 會在同一個視窗內瞬間捕捉到通行證，立刻在原地解鎖展現後台！
  const redirectUrl = `${url.origin}/admin/#/?token=${token}&provider=github`;

  return Response.redirect(redirectUrl, 302);
}

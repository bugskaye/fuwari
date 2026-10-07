export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  // 1. 去向 GitHub 專屬櫃檯交換真正的 Access Token
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

  // 2. ⚡【終極規格重定向】：完全不使用 postMessage！
  // 直接將小視窗強行跳轉到精準符合官方底層規格的 #token= 網址！
  // 這樣一來，網頁會在小視窗內部當場解鎖，直接展現後台介面！
  const redirectUrl = `${url.origin}/admin/#token=${token}`;

  return Response.redirect(redirectUrl, 302);
}

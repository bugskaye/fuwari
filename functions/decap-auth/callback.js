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

  // 建立符合官方嚴格預期的 JSON 載荷
  const provider = "github";
  const authContent = JSON.stringify({ token: token, provider: provider });

  // 2. ⚡【官方嚴格對齊】：發送完全符合 Decap CMS 原始碼預期的標準暗號字串！
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><title>Authorizing...</title></head>
    <body>
      <script>
        (function() {
          if (window.opener) {
            // 🌟 嚴格對齊官方底層解碼格式：authorization:github:status:JSON字串
            window.opener.postMessage("authorization:github:success:${authContent}", "*");
            window.close();
          }
        })();
      </script>
    </body>
    </html>
  `;

  return new Response(htmlContent, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

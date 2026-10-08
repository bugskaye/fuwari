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

  // 2. ⚡【終極豁免網域通訊】：將接收網域改成萬用字元 "*"！
  // 這樣一來，不論大網頁處於多麼嚴格的無痕隱私模式，都百分之百能強制接收令牌並解鎖！
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><title>Authorizing...</title></head>
    <body>
      <script>
        (function() {
          if (window.opener) {
            // 🌟 核心關鍵：將 targetOrigin 改為 "*" 突破一切安全限制！
            window.opener.postMessage("authorizing:github|token=${token}|status:success", "*");
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

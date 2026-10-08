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

  // 2. ⚡【安全字串封裝方案】：只傳遞純 token 字串，由前端安全組裝官方指定的 JSON 格式！
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><title>Authorizing...</title></head>
    <body>
      <script>
        (function() {
          if (window.opener) {
            try {
              // 🌟 在前端安全的作用域內，以安全的物件形式組裝官方標準格式，徹底避免後端字串解析衝突
              const payload = JSON.stringify({ token: "${token}", provider: "github" });
              const messageStr = "authorization:github:success:" + payload;
              
              // 強送暗號並自我毀滅
              window.opener.postMessage(messageStr, "*");
            } catch (e) {
              console.error("CMS Auth Error:", e);
            }
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

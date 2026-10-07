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

  // 2. ⚡【終極 href 強制跳轉方案】：直接覆蓋大網頁的完整網址，直接跳過 Astro 路由攔截！
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><title>Authorizing...</title></head>
    <body>
      <script>
        (function() {
          if (window.opener) {
            // 用純字串完全鎖死目標暗號廣播，防範部分安全防護
            window.opener.postMessage("authorizing:github|token=${token}|status:success", "https://onepromisestudio.com");
            
            // 🌟 大絕招：直接強行重寫母網頁的完整網址，避開任何 Astro 自動添加斜線的機制，並強制大網頁重整！
            try {
              window.opener.location.href = "https://onepromisestudio.com{token}";
            } catch (e) {
              console.error(e);
            }
            
            // 關閉小視窗
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

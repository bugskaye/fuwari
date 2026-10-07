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

  // 2. ⚡【終極無bug解鎖】：完全不改網址，直接發送標準暗號！
  // 我們將目標網域（targetOrigin）用純字串嚴格死鎖為 "https://onepromisestudio.com"
  // 這樣母網頁一對照，網域完全合法，會瞬間收下密鑰並命令小視窗自我毀滅（關閉）！
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><title>Authorizing...</title></head>
    <body>
      <script>
        (function() {
          if (window.opener) {
            window.opener.postMessage("authorizing:github|token=${token}|status:success", "https://onepromisestudio.com");
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

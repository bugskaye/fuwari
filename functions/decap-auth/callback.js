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

  // 2. ⚡【雙重安全防禦與強制解鎖解鎖方案】
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><title>Authorizing...</title></head>
    <body>
      <script>
        (function() {
          if (window.opener) {
            // 第一層防禦：同時向純網域和帶有 auth_endpoint 的路徑廣播暗號，確保主網頁能聽到
            window.opener.postMessage("authorizing:github|token=${token}|status:success", "https://onepromisestudio.com");
            window.opener.postMessage("authorizing:github|token=${token}|status:success", "https://onepromisestudio.com/decap-auth");
            
            // 第二層防禦（大絕招）：強行跳轉大網頁的網址列，直接餵給它正確的 Token 路由，強制它在原地解鎖！
            try {
              window.opener.location.hash = "token=${token}";
            } catch (e) {
              console.error(e);
            }
            
            // 善後關閉小視窗
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

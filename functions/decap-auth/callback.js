export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

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

  // ⚡【終極字串安全方案】：徹底分離網址與變數，改用純字串拼接，杜絕任何被吞字的可能！
  const baseAdminUrl = "https://onepromisestudio.com";
  const finalRedirectUrl = baseAdminUrl + token;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><title>Authorizing...</title></head>
    <body>
      <script>
        (function() {
          if (window.opener) {
            try {
              // 🌟 直接用完全獨立的純字串覆蓋母網頁網址，避開任何 Astro 路由或變數解析衝突！
              window.opener.location.href = "${finalRedirectUrl}";
            } catch (e) {
              console.error(e);
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

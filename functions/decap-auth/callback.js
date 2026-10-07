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

  // 2. ⚡【終極對齊修正】：將 postMessage 的來源網域，強制精準對齊到 /decap-auth 結尾！
  // 這樣母網頁安全機制核對時，會發現路徑與 config.yml 的 auth_endpoint 完美契合，立刻放行！
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><title>Authorizing...</title></head>
    <body>
      <script>
        (function() {
          window.opener.postMessage("authorizing:github|token=${token}|status:success", "${url.origin}/decap-auth");
          window.close();
        })();
      </script>
    </body>
    </html>
  `;

  return new Response(htmlContent, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

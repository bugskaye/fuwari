export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  // ✅ 1. 正確的門禁櫃檯網址，去向 GitHub 交換真正的 Access Token
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

  // 2. 這是最核心的網頁暗號！負責將鑰匙丟回大網頁，並命令小視窗立刻自我毀滅（關閉）
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Authorizing...</title>
    </head>
    <body>
      <script>
        (function() {
          function receiveMessage(e) {
            console.log("Sending token back to admin panel...");
            window.opener.postMessage("authorizing:github|token:${token}|status:success", window.location.origin);
            window.close();
          }
          receiveMessage();
        })();
      </script>
    </body>
    </html>
  `;
  
  return new Response(htmlContent, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

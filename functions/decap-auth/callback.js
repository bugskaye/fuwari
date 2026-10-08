export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  // 1. 去向 GitHub 交換真正的 Access Token
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

  // 2. ⚡【小視窗獨立接管方案】：徹底拋棄 opener 廣播！
  // 直接在小視窗內部儲存權限，並就地加載出完整的 Decap CMS 界面！
  const htmlContent = [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    '  <meta charset="utf-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '  <title>One Promise Studio - Content Manager</title>',
    '</head>',
    '<body>',
    '  <script>',
    '    (function() {',
    '      try {',
    '        // 🌟 1. 直接把拿到金鑰存進當前小視窗的瀏覽器保險箱裡',
    '        localStorage.setItem("decap-cms-user", JSON.stringify({ token: "' + token + '", provider: "github" }));',
    '        ',
    '        // 🌟 2. 核心大絕招：直接在小視窗裡加載 Decap CMS 核心腳本！',
    '        var script = document.createElement("script");',
    '        script.src = "https://unpkg.com@^3.0.0/dist/decap-cms.js";',
    '        document.body.appendChild(script);',
    '      } catch (e) {',
    '        console.error(e);',
    '      }',
    '    })();',
    '  </script>',
    '</body>',
    '</html>'
  ].join('\n');

  return new Response(htmlContent, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

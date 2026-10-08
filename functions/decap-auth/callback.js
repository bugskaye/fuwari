export async function onRequest({ request }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  // 🌟【終極純字串封裝】：完全不使用 env 變數！直接將密鑰鎖在程式碼中，杜絕任何加載卡死衝突！
  const clientID = "Ov23liC2BtxZwb2w8fmB"; // 🔗 請在此直接填入你的 Client ID 字串
  const clientSecret = "8fc0a8780504ddb0f09402e8313cb4f55032b984"; // 🔗 請在此直接填入你的 Client Secret 密鑰字串

  // 1. 去向 GitHub 專屬櫃檯交換真正的 Access Token
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      client_id: clientID,
      client_secret: clientSecret,
      code: code
    })
  });

  const data = await response.json();
  const token = data.access_token;

  // 2. ⚡【小視窗獨立接管】：直接在小視窗內部就地加載出完整的 Decap CMS 界面！
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
    '        localStorage.setItem("decap-cms-user", JSON.stringify({ token: "' + token + '", provider: "github" }));',
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

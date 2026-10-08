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

  const htmlContent = [
    '<!DOCTYPE html>',
    '<html>',
    '<head><title>Authorizing...</title></head>',
    '<body>',
    '  <script>',
    '    (function() {',
    '      if (window.opener) {',
    '        try {',
    '          // ⚡【萬能 LocalStorage 方案】：直接把鑰匙塞進瀏覽器的保險箱裡！',
    '          // 這會繞過任何網址和跨視窗廣播暗號，Decap CMS 重新整理後會主動來這裡拿鑰匙解鎖！',
    '          window.opener.localStorage.setItem("decap-cms-user", JSON.stringify({ token: "' + token + '", provider: "github" }));',
    '          ',
    '          // 強制母網頁重新整理刷新，讓它讀取剛才存進去的鑰匙',
    '          window.opener.location.reload();',
    '        } catch (e) {',
    '          console.error(e);',
    '        }',
    '        window.close();',
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

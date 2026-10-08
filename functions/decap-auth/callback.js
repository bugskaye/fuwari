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

  // 用最傳統的拼接方式傳遞純字串，徹底隔離後端變數解析
  const htmlContent = [
    '<!DOCTYPE html>',
    '<html>',
    '<head><title>Authorizing...</title></head>',
    '<body>',
    '  <script>',
    '    (function() {',
    '      if (window.opener) {',
    '        try {',
    '          // 🌟 徹底在前端由瀏覽器自己拼接網址，避開任何後端吃字 Bug！',
    '          var tokenStr = "' + token + '";',
    '          window.opener.location.href = "https://onepromisestudio.com/admin/#token=" + tokenStr;',
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

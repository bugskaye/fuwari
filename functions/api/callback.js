export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  const response = await fetch('https://github.com', {
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

  // 這段會把鑰匙傳回給你們的 Decap CMS 後台介面
  return new Response(`
    <script>
      const token = "${data.access_token}";
      window.opener.postMessage("authorizing:github|token:" + token + "|status:success", window.location.origin);
      window.close();
    </script>
  `, { headers: { 'Content-Type': 'text/html' } });
}

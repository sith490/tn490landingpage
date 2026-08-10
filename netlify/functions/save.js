exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: '{}' };
  if (event.headers['x-admin-password'] !== 'tn490admin') return { statusCode: 401, headers, body: JSON.stringify({ error: 'unauthorized' }) };

  try {
    const { links } = JSON.parse(event.body);
    const content = Buffer.from(JSON.stringify(links, null, 2)).toString('base64');

    // Get current SHA of links.json
    const getRes = await fetch('https://api.github.com/repos/sith490/tn490/contents/public/links.json', {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json'
      }
    });
    const getData = await getRes.json();
    const sha = getData.sha;

    // Update file
    const putRes = await fetch('https://api.github.com/repos/sith490/tn490/contents/public/links.json', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'update links',
        content,
        sha
      })
    });

    if (putRes.ok) {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } else {
      const err = await putRes.json();
      return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
    }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

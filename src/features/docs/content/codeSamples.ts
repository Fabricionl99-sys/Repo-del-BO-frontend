import type { DocEndpoint } from './apiEndpoints';

const SAMPLE_KEY = 'wgpk_test_your_api_key_here';

export function curlExample(endpoint: DocEndpoint, baseUrl: string): string {
  const url = `${baseUrl}${endpoint.path.replace('{player_id}', 'pl_12345').replace('{bonus_id}', 'bn_01').replace('{code}', 'weekly')}`;
  const lines = [`curl -X ${endpoint.method} '${url}' \\`, `  -H 'Authorization: Bearer ${SAMPLE_KEY}' \\`];
  if (endpoint.method !== 'GET') {
    lines.push(`  -H 'Content-Type: application/json' \\`);
  }
  if (endpoint.requestBody) {
    lines.push(`  -d '${JSON.stringify(endpoint.requestBody, null, 2)}'`);
  } else {
    lines[lines.length - 1] = lines[lines.length - 1]!.replace(' \\', '');
  }
  return lines.join('\n');
}

export function jsExample(endpoint: DocEndpoint, baseUrl: string): string {
  const path = endpoint.path
    .replace('{player_id}', 'pl_12345')
    .replace('{bonus_id}', 'bn_01')
    .replace('{code}', 'weekly');
  const hasBody = endpoint.requestBody != null;
  return `const res = await fetch('${baseUrl}${path}', {
  method: '${endpoint.method}',
  headers: {
    Authorization: 'Bearer process.env.S2G_API_KEY',
    ${hasBody ? "['Content-Type']: 'application/json'," : ''}
  },
  ${hasBody ? `body: JSON.stringify(${JSON.stringify(endpoint.requestBody, null, 2)}),` : ''}
});
const data = await res.json();
console.log(data);`;
}

export function pythonExample(endpoint: DocEndpoint, baseUrl: string): string {
  const path = endpoint.path
    .replace('{player_id}', 'pl_12345')
    .replace('{bonus_id}', 'bn_01')
    .replace('{code}', 'weekly');
  const hasBody = endpoint.requestBody != null;
  return `import os
import requests

url = "${baseUrl}${path}"
headers = {"Authorization": f"Bearer {os.environ['S2G_API_KEY']}"}
${hasBody ? `payload = ${JSON.stringify(endpoint.requestBody, null, 2)}\nresp = requests.${endpoint.method.toLowerCase()}(url, json=payload, headers=headers)` : `resp = requests.${endpoint.method.toLowerCase()}(url, headers=headers)`}
resp.raise_for_status()
print(resp.json())`;
}

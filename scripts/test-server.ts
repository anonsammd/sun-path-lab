import { spawn } from 'node:child_process';
import http from 'node:http';

async function fetchUrl(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode || 0, body: data }));
    }).on('error', reject);
  });
}

async function main() {
  console.log('🚀 Starting local Astro dev server on port 4321...');
  const server = spawn('npx.cmd', ['astro', 'dev', '--port', '4321'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  });

  server.stdout?.on('data', (d) => process.stdout.write(d));
  server.stderr?.on('data', (d) => process.stderr.write(d));

  // Wait for server to be ready
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const res = await fetchUrl('http://localhost:4321/');
      if (res.status === 200) {
        ready = true;
        break;
      }
    } catch {
      // Still booting...
    }
  }

  if (!ready) {
    console.error('❌ Server failed to start in 30 seconds');
    server.kill();
    process.exit(1);
  }

  console.log('\n✅ Server is live! Probing critical endpoints...\n');

  const testRoutes = [
    { path: '/', expected: 'Sun Path Lab' },
    { path: '/about', expected: 'About Our Laboratory' },
    { path: '/packages', expected: 'Diagnostic Tests & Health Checkup Packages' },
    { path: '/packages/full-body-health-checkup-essential', expected: 'Full Body Health Checkup' },
    { path: '/services', expected: 'Pathology & Diagnostic Testing Services' },
    { path: '/home-collection', expected: 'Home Sample Collection' },
    { path: '/contact', expected: 'Contact & Location' },
    { path: '/sitemap.xml', expected: 'urlset' },
    { path: '/admin/login', expected: 'Owner Login' },
    { path: '/api/packages', expected: 'full-body-health-checkup-essential' },
  ];

  let passed = 0;
  for (const r of testRoutes) {
    try {
      const res = await fetchUrl(`http://localhost:4321${r.path}`);
      const hasContent = res.body.includes(r.expected);
      if (res.status === 200 && hasContent) {
        console.log(`[PASS] ${r.path} -> Status: 200, Content verified: "${r.expected}"`);
        passed++;
      } else {
        console.error(`[FAIL] ${r.path} -> Status: ${res.status}, Content match: ${hasContent}`);
      }
    } catch (err: any) {
      console.error(`[ERROR] ${r.path} -> ${err.message}`);
    }
  }

  console.log(`\n🎉 Verification summary: ${passed} / ${testRoutes.length} endpoints passed!`);
  server.kill();
  process.exit(passed === testRoutes.length ? 0 : 1);
}

main();

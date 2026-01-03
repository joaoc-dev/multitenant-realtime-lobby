import { createHash } from 'crypto';
import { execSync } from 'child_process';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const OPENAPI_URL = process.env.OPENAPI_URL || 'http://localhost:5046/openapi/v1.json';
const POLL_INTERVAL = 3000; // 3 seconds
const CACHE_FILE = join(process.cwd(), '.openapi-cache.json');

interface Cache {
  hash: string;
  lastGenerated: string;
}

function getSpecHash(spec: string): string {
  return createHash('sha256').update(spec).digest('hex');
}

async function fetchOpenApiSpec(): Promise<string> {
  try {
    const response = await fetch(OPENAPI_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      console.log(`⏳ Waiting for API at ${OPENAPI_URL}...`);
    } else {
      console.error(`❌ Error fetching OpenAPI spec:`, error);
    }
    throw error;
  }
}

function loadCache(): Cache | null {
  if (existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(readFileSync(CACHE_FILE, 'utf-8'));
    } catch {
      return null;
    }
  }
  return null;
}

function saveCache(cache: Cache): void {
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function generateApi(): void {
  console.log('🔄 Regenerating API client...');
  try {
    execSync('pnpm generate:api', { stdio: 'inherit', cwd: process.cwd() });
    console.log('✅ API client regenerated successfully');
  } catch (error) {
    console.error('❌ Failed to generate API client:', error);
  }
}

async function checkAndRegenerate(): Promise<void> {
  try {
    const spec = await fetchOpenApiSpec();
    const currentHash = getSpecHash(spec);
    const cache = loadCache();

    // Check if generated folder exists
    const generatedExists = existsSync(join(process.cwd(), 'apps/client/src/api/generated'));

    if (!cache || cache.hash !== currentHash || !generatedExists) {
      generateApi();
      saveCache({
        hash: currentHash,
        lastGenerated: new Date().toISOString(),
      });
    }
  } catch (error) {
    // Silently handle connection errors (API might not be running yet)
  }
}

async function watch(): Promise<void> {
  console.log(`👀 Watching OpenAPI spec at ${OPENAPI_URL}`);
  console.log(`   Polling every ${POLL_INTERVAL / 1000} seconds\n`);

  // Initial check
  await checkAndRegenerate();

  // Poll periodically
  setInterval(checkAndRegenerate, POLL_INTERVAL);
}

watch().catch(console.error);
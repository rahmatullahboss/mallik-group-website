/**
 * Post-build script: Fix the auto-generated dist/server/wrangler.json
 * 
 * @astrojs/cloudflare v13 generates a wrangler.json with bindings that are
 * invalid for Cloudflare Pages:
 *   - SESSION KV binding without an "id" field
 *   - ASSETS binding (reserved name in Pages)
 *   - Empty "triggers" object (must contain "crons" if present)
 * 
 * This script removes/fixes those entries so Pages deploy works.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';

const wranglerPath = './dist/server/wrangler.json';

if (!existsSync(wranglerPath)) {
  console.log('[fix-wrangler] No dist/server/wrangler.json found, skipping.');
  process.exit(0);
}

const config = JSON.parse(readFileSync(wranglerPath, 'utf-8'));

// 1. Remove KV namespaces without an "id" (SESSION auto-provisioning)
if (config.kv_namespaces) {
  config.kv_namespaces = config.kv_namespaces.filter(kv => kv.id);
  if (config.kv_namespaces.length === 0) {
    delete config.kv_namespaces;
  }
}

// 2. Remove ASSETS binding (reserved in Pages, auto-handled)
if (config.assets?.binding === 'ASSETS') {
  delete config.assets;
}

// 3. Fix empty triggers (Pages expects { crons: [...] } if present)
if (config.triggers && Object.keys(config.triggers).length === 0) {
  delete config.triggers;
}

// 4. Remove fields that Pages doesn't understand
const removeFields = [
  'definedEnvironments', 'secrets_store_secrets', 'unsafe_hello_world',
  'worker_loaders', 'ratelimits', 'vpc_services', 'python_modules',
  'images'
];
for (const field of removeFields) {
  delete config[field];
}

// 5. Remove dev.enable_containers and dev.generate_types (unknown to Pages)
if (config.dev) {
  delete config.dev.enable_containers;
  delete config.dev.generate_types;
  if (Object.keys(config.dev).length === 0) {
    delete config.dev;
  }
}

writeFileSync(wranglerPath, JSON.stringify(config));
console.log('[fix-wrangler] ✅ Fixed dist/server/wrangler.json for Pages deploy');

/**
 * npm workspaces sometimes skip rolldown platform optional deps on CI.
 * Install the binding for the current OS/arch when missing.
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, '..');
const workspaces = ['tenant-app', 'master-app'];

const bindingForPlatform = () => {
  const { platform, arch } = process;
  if (platform === 'linux' && arch === 'x64') return 'binding-linux-x64-gnu';
  if (platform === 'linux' && arch === 'arm64') return 'binding-linux-arm64-gnu';
  if (platform === 'darwin' && arch === 'arm64') return 'binding-darwin-arm64';
  if (platform === 'darwin' && arch === 'x64') return 'binding-darwin-x64';
  if (platform === 'win32' && arch === 'x64') return 'binding-win32-x64-msvc';
  if (platform === 'win32' && arch === 'arm64') return 'binding-win32-arm64-msvc';
  return null;
};

const bindingName = bindingForPlatform();
if (!bindingName) {
  process.exit(0);
}

for (const workspace of workspaces) {
  const rolldownPkg = path.join(frontendRoot, workspace, 'node_modules', 'rolldown', 'package.json');
  if (!existsSync(rolldownPkg)) continue;

  const version = JSON.parse(readFileSync(rolldownPkg, 'utf8')).version;
  const pkg = `@rolldown/${bindingName}@${version}`;
  const installed = path.join(
    frontendRoot,
    workspace,
    'node_modules',
    '@rolldown',
    bindingName
  );

  if (existsSync(installed)) continue;

  console.log(`Installing missing ${pkg} for ${workspace}…`);
  execSync(`npm install --no-save ${pkg}`, {
    cwd: path.join(frontendRoot, workspace),
    stdio: 'inherit',
  });
}

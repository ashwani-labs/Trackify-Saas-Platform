/**
 * npm workspaces sometimes skip platform-specific optional deps on CI
 * when the lockfile was produced on another OS. Install missing bindings.
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, '..');
const workspaces = ['tenant-app', 'master-app'];

const platform = () => {
  const { platform: os, arch } = process;

  return {
    rolldown: (() => {
      if (os === 'linux' && arch === 'x64') return 'binding-linux-x64-gnu';
      if (os === 'linux' && arch === 'arm64') return 'binding-linux-arm64-gnu';
      if (os === 'darwin' && arch === 'arm64') return 'binding-darwin-arm64';
      if (os === 'darwin' && arch === 'x64') return 'binding-darwin-x64';
      if (os === 'win32' && arch === 'x64') return 'binding-win32-x64-msvc';
      if (os === 'win32' && arch === 'arm64') return 'binding-win32-arm64-msvc';
      return null;
    })(),
    lightningcss: (() => {
      if (os === 'linux' && arch === 'x64') return 'lightningcss-linux-x64-gnu';
      if (os === 'linux' && arch === 'arm64') return 'lightningcss-linux-arm64-gnu';
      if (os === 'darwin' && arch === 'arm64') return 'lightningcss-darwin-arm64';
      if (os === 'darwin' && arch === 'x64') return 'lightningcss-darwin-x64';
      if (os === 'win32' && arch === 'x64') return 'lightningcss-win32-x64-msvc';
      if (os === 'win32' && arch === 'arm64') return 'lightningcss-win32-arm64-msvc';
      return null;
    })(),
  };
};

const installIfMissing = (workspaceDir, spec, installedPath) => {
  if (existsSync(installedPath)) return;

  console.log(`Installing missing ${spec} for ${path.basename(workspaceDir)}…`);
  execSync(`npm install --no-save ${spec}`, {
    cwd: workspaceDir,
    stdio: 'inherit',
  });
};

const { rolldown: rolldownBinding, lightningcss: lightningcssBinding } = platform();

if (!rolldownBinding && !lightningcssBinding) {
  process.exit(0);
}

for (const workspace of workspaces) {
  const workspaceDir = path.join(frontendRoot, workspace);

  if (rolldownBinding) {
    const rolldownPkg = path.join(workspaceDir, 'node_modules', 'rolldown', 'package.json');
    if (existsSync(rolldownPkg)) {
      const version = JSON.parse(readFileSync(rolldownPkg, 'utf8')).version;
      installIfMissing(
        workspaceDir,
        `@rolldown/${rolldownBinding}@${version}`,
        path.join(workspaceDir, 'node_modules', '@rolldown', rolldownBinding)
      );
    }
  }

  if (lightningcssBinding) {
    const lightningcssPkg = path.join(workspaceDir, 'node_modules', 'lightningcss', 'package.json');
    if (existsSync(lightningcssPkg)) {
      const version = JSON.parse(readFileSync(lightningcssPkg, 'utf8')).version;
      installIfMissing(
        workspaceDir,
        `${lightningcssBinding}@${version}`,
        path.join(workspaceDir, 'node_modules', lightningcssBinding)
      );
    }
  }
}

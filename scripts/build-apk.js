#!/usr/bin/env node
/**
 * Gera o APK de release localmente (npm run apk).
 *
 *   npm run apk                 → prebuild + APK arm64 em dist/
 *   npm run apk -- --all-archs  → APK para todas as arquiteturas (maior e mais lento)
 *   npm run apk -- --clean      → recria android/ e limpa os caches nativos antes
 *
 * Requisitos: JDK 17+ (JAVA_HOME), Android SDK (ANDROID_HOME) e, no Windows, um CMake com
 * ninja 1.12+ (ex.: cmake;3.31.6 do SDK) e caminhos longos habilitados no sistema.
 * O APK é assinado com a chave de debug: serve para instalar e testar, não para a Play Store.
 *
 * Por que o CMake novo: o build nativo cria caminhos com mais de 300 caracteres, e o
 * ninja 1.10 do CMake 3.22.1 (padrão do Android Gradle Plugin) não aceita caminhos longos.
 * O script aponta o CMake mais novo instalado no SDK em android/local.properties (cmake.dir).
 */
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ANDROID = path.join(ROOT, 'android');
const args = new Set(process.argv.slice(2));
const CLEAN = args.has('--clean');
const ALL_ARCHS = args.has('--all-archs');
const IS_WINDOWS = process.platform === 'win32';

function run(command, cwd, env = {}) {
  console.log(`\n> ${command}`);
  const result = spawnSync(command, { cwd, stdio: 'inherit', shell: true, env: { ...process.env, ...env } });
  if (result.status !== 0) throw new Error(`Falhou: ${command}`);
}

const versionKey = (v) => v.split('.').map((n) => n.padStart(4, '0')).join('.');

/** CMake mais novo do SDK (>= 3.30, que traz ninja 1.12+). `null` se não houver. */
function findModernCmake() {
  const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (!sdk) return null;
  const dir = path.join(sdk, 'cmake');
  if (!fs.existsSync(dir)) return null;
  const versions = fs
    .readdirSync(dir)
    .filter((v) => /^\d+\.\d+\.\d+$/.test(v) && versionKey(v) >= versionKey('3.30.0'))
    .sort((a, b) => (versionKey(a) < versionKey(b) ? 1 : -1));
  return versions.length ? path.join(dir, versions[0]) : null;
}

/** Grava (ou troca) uma chave no android/local.properties. */
function setLocalProperty(key, value) {
  const file = path.join(ANDROID, 'local.properties');
  const lines = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith(`${key}=`)) : [];
  // Formato .properties: barras normais e ":" escapado.
  lines.push(`${key}=${value.replace(/\\/g, '/').replace(/:/g, '\\:')}`);
  fs.writeFileSync(file, `${lines.join('\n')}\n`);
}

/** Caches do CMake guardam caminho e versão do CMake; --clean apaga todos. */
function removeNativeCaches() {
  const dirs = [path.join(ANDROID, 'app', '.cxx')];
  const modules = path.join(ROOT, 'node_modules');
  for (const name of fs.readdirSync(modules)) {
    const scoped = name.startsWith('@') ? fs.readdirSync(path.join(modules, name)).map((n) => path.join(name, n)) : [name];
    for (const pkg of scoped) dirs.push(path.join(modules, pkg, 'android', '.cxx'));
  }
  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`  cache removido: ${path.relative(ROOT, dir)}`);
    }
  }
}

function main() {
  const appJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8'));
  const version = appJson.expo.version;

  // 1. Projeto nativo. O prebuild troca os scripts android/ios do package.json
  //    para "expo run:*"; o original volta no fim para manter o fluxo do Expo Go.
  const packageJsonPath = path.join(ROOT, 'package.json');
  const packageJson = fs.readFileSync(packageJsonPath, 'utf8');
  try {
    run(`npx expo prebuild --platform android${CLEAN ? ' --clean' : ''} --no-install`, ROOT, { CI: '1' });
  } finally {
    fs.writeFileSync(packageJsonPath, packageJson);
  }
  if (CLEAN) removeNativeCaches();

  // 2. CMake com suporte a caminhos longos (Windows).
  if (IS_WINDOWS) {
    const cmake = findModernCmake();
    if (!cmake) {
      throw new Error(
        'Instale o CMake 3.31 ou mais novo no Android SDK (Android Studio → SDK Manager → SDK Tools → CMake). ' +
          'O CMake 3.22.1 padrão não aceita os caminhos longos do build nativo.',
      );
    }
    setLocalProperty('cmake.dir', cmake);
    console.log(`\n  usando CMake: ${cmake}`);
  }

  // 3. Gradle. Caminho explícito: o cmd do Node nem sempre procura executáveis na pasta atual.
  const gradlew = IS_WINDOWS ? '.\\gradlew.bat' : './gradlew';
  const archs = ALL_ARCHS ? '' : ' -PreactNativeArchitectures=arm64-v8a';
  try {
    run(`${gradlew} assembleRelease${archs}`, ANDROID);
  } catch (error) {
    console.error('\nSe o erro citar CMakeCache, outro caminho ou outra versão do CMake, rode: npm run apk:clean');
    throw error;
  }

  // 4. Copia o APK para dist/ com a versão no nome.
  const built = path.join(ANDROID, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
  const dist = path.join(ROOT, 'dist');
  fs.mkdirSync(dist, { recursive: true });
  const target = path.join(dist, `mellitus-${version}${ALL_ARCHS ? '' : '-arm64'}.apk`);
  fs.copyFileSync(built, target);
  const sizeMb = (fs.statSync(target).size / 1024 / 1024).toFixed(1);
  console.log(`\nAPK pronto: ${path.relative(ROOT, target)} (${sizeMb} MB)`);
}

try {
  main();
} catch (error) {
  console.error(`\n${error.message}`);
  process.exit(1);
}

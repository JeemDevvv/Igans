const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const jsFiles = [
  'js/auth.js',
  'js/index.js'
];

const staticExtensions = ['.html', '.css', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];

const distDir = path.join(__dirname, 'dist');
const jsDistDir = path.join(distDir, 'js');
const cssDistDir = path.join(distDir, 'css');
const adminDistDir = path.join(distDir, 'admin');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function minifyJS() {
  for (const file of jsFiles) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) continue;
    const code = fs.readFileSync(filePath, 'utf8');
    const result = await minify(code, {
      compress: true,
      mangle: true,
      format: {
        comments: false
      }
    });
    if (result.error) {
      console.error('Error minifying', file, result.error);
      continue;
    }
    const destPath = path.join(distDir, file);
    ensureDir(path.dirname(destPath));
    fs.writeFileSync(destPath, result.code);
    console.log('Minified:', file, '→', destPath);
  }
}

function copyStaticFiles(srcDir, destDir) {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  ensureDir(destDir);
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist') {
        copyStaticFiles(srcPath, destPath);
      }
    } else {
      const ext = path.extname(entry.name);
      if (staticExtensions.includes(ext) || entry.name === '.htaccess') {
        fs.copyFileSync(srcPath, destPath);
        console.log('Copied:', path.relative(__dirname, srcPath), '→', path.relative(__dirname, destPath));
      }
    }
  }
}

async function build() {
  ensureDir(distDir);
  await minifyJS();
  copyStaticFiles(__dirname, distDir);
  console.log('\nBuild complete!');
}

build().catch(err => console.error(err));

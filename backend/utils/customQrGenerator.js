class CustomQRGenerator {
  constructor(size = 300) {
    this.size = size;
    this.moduleCount = 21;
    this.cellSize = Math.floor(size / this.moduleCount);
  }
  encodeData(text) {
    const bytes = [];
    for (let i = 0; i < text.length; i++) {
      bytes.push(text.charCodeAt(i));
    }
    return bytes;
  }
  generateModules(data) {
    const modules = Array(this.moduleCount).fill(null).map(() => Array(this.moduleCount).fill(false));
    this.addFinderPattern(modules, 0, 0);
    this.addFinderPattern(modules, this.moduleCount - 7, 0);
    this.addFinderPattern(modules, 0, this.moduleCount - 7);
    this.addTimingPatterns(modules);
    this.addAlignmentPattern(modules, 6, 6);
    modules[this.moduleCount - 8][8] = true;
    this.addDataModules(modules, data);
    return modules;
  }
  addFinderPattern(modules, x, y) {
    for (let dy = 0; dy < 7; dy++) {
      for (let dx = 0; dx < 7; dx++) {
        if (dx === 0 || dx === 6 || dy === 0 || dy === 6) {
          if (y + dy < this.moduleCount && x + dx < this.moduleCount) {
            modules[y + dy][x + dx] = true;
          }
        } else if (dx === 1 || dx === 5 || dy === 1 || dy === 5) {
          if (y + dy < this.moduleCount && x + dx < this.moduleCount) {
            modules[y + dy][x + dx] = false;
          }
        } else {
          if (y + dy < this.moduleCount && x + dx < this.moduleCount) {
            modules[y + dy][x + dx] = true;
          }
        }
      }
    }
  }
  addTimingPatterns(modules) {
    for (let x = 8; x < this.moduleCount - 8; x++) {
      modules[6][x] = x % 2 === 0;
    }
    for (let y = 8; y < this.moduleCount - 8; y++) {
      modules[y][6] = y % 2 === 0;
    }
  }
  addAlignmentPattern(modules, x, y) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (y + dy < this.moduleCount && x + dx < this.moduleCount && y + dy >= 0 && x + dx >= 0) {
          const isEdge = dx === -2 || dx === 2 || dy === -2 || dy === 2;
          const isCenter = dx === 0 && dy === 0;
          modules[y + dy][x + dx] = isEdge || isCenter;
        }
      }
    }
  }
  addDataModules(modules, data) {
    let dataIndex = 0;
    for (let y = 0; y < this.moduleCount; y++) {
      for (let x = 0; x < this.moduleCount; x++) {
        if (this.isReservedModule(x, y)) continue;
        if (dataIndex < data.length * 8) {
          const byteIndex = Math.floor(dataIndex / 8);
          const bitIndex = 7 - (dataIndex % 8);
          const bit = (data[byteIndex] >> bitIndex) & 1;
          modules[y][x] = bit === 1;
        } else {
          modules[y][x] = (x + y) % 2 === 0;
        }
        dataIndex++;
      }
    }
  }
  isReservedModule(x, y) {
    if ((x < 7 && y < 7) ||
        (x < 7 && y > this.moduleCount - 8) ||
        (x > this.moduleCount - 8 && y < 7)) {
      return true;
    }
    if (y === 6 || x === 6) return true;
    if (x >= 4 && x <= 8 && y >=4 && y <=8) return true;
    if (x === 8 && y === this.moduleCount - 8) return true;
    return false;
  }
  renderToCanvas(text) {
    const canvas = document.createElement('canvas');
    canvas.width = this.size;
    canvas.height = this.size;
    const ctx = canvas.getContext('2d');
    const data = this.encodeData(text);
    const modules = this.generateModules(data);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, this.size, this.size);
    ctx.fillStyle = '#000000';
    for (let y = 0; y < this.moduleCount; y++) {
      for (let x = 0; x < this.moduleCount; x++) {
        if (modules[y][x]) {
          ctx.fillRect(
            x * this.cellSize,
            y * this.cellSize,
            this.cellSize,
            this.cellSize
          );
        }
      }
    }
    return canvas.toDataURL('image/png');
  }
  renderToSVG(text) {
    const data = this.encodeData(text);
    const modules = this.generateModules(data);
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${this.size}" height="${this.size}">`;
    svg += `<rect width="${this.size}" height="${this.size}" fill="white"/>`;
    for (let y = 0; y < this.moduleCount; y++) {
      for (let x = 0; x < this.moduleCount; x++) {
        if (modules[y][x]) {
          svg += `<rect x="${x * this.cellSize}" y="${y * this.cellSize}" width="${this.cellSize}" height="${this.cellSize}" fill="black"/>`;
        }
      }
    }
    svg += '</svg>';
    return svg;
  }
}
if (typeof window === 'undefined') {
  module.exports = function generateQRCode(text, width = 300) {
    const qr = new CustomQRGenerator(width);
    const svg = qr.renderToSVG(text);
    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  };
} else {
  window.CustomQRGenerator = CustomQRGenerator;
}
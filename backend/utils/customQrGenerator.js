// Custom QR Code Generator - Implemented without external libraries
class CustomQRGenerator {
  constructor(size = 300) {
    this.size = size;
    this.moduleCount = 21; // Version 1 QR code
    this.cellSize = Math.floor(size / this.moduleCount);
  }

  // Encode text into binary (simplified 8-bit mode)
  encodeData(text) {
    const bytes = [];
    for (let i = 0; i < text.length; i++) {
      bytes.push(text.charCodeAt(i));
    }
    return bytes;
  }

  // Generate QR code modules (simplified - this is a basic implementation)
  generateModules(data) {
    const modules = Array(this.moduleCount).fill(null).map(() => Array(this.moduleCount).fill(false));
    
    // Add finder patterns (3 large squares in corners)
    this.addFinderPattern(modules, 0, 0);
    this.addFinderPattern(modules, this.moduleCount - 7, 0);
    this.addFinderPattern(modules, 0, this.moduleCount - 7);
    
    // Add timing patterns
    this.addTimingPatterns(modules);
    
    // Add alignment pattern (version 1 has one at (6,6))
    this.addAlignmentPattern(modules, 6, 6);
    
    // Add dark module
    modules[this.moduleCount - 8][8] = true;
    
    // Encode and add data (simplified - this is a basic version)
    this.addDataModules(modules, data);
    
    return modules;
  }

  // Add a finder pattern at (x,y)
  addFinderPattern(modules, x, y) {
    // Outer 7x7 square
    for (let dy = 0; dy < 7; dy++) {
      for (let dx = 0; dx < 7; dx++) {
        if (dx === 0 || dx === 6 || dy === 0 || dy === 6) {
          // Outer boundary
          if (y + dy < this.moduleCount && x + dx < this.moduleCount) {
            modules[y + dy][x + dx] = true;
          }
        } else if (dx === 1 || dx === 5 || dy === 1 || dy === 5) {
          // Inner white ring
          if (y + dy < this.moduleCount && x + dx < this.moduleCount) {
            modules[y + dy][x + dx] = false;
          }
        } else {
          // Center black square
          if (y + dy < this.moduleCount && x + dx < this.moduleCount) {
            modules[y + dy][x + dx] = true;
          }
        }
      }
    }
  }

  // Add timing patterns (alternating black/white lines)
  addTimingPatterns(modules) {
    // Horizontal timing pattern (row 6, columns 8 to moduleCount-8)
    for (let x = 8; x < this.moduleCount - 8; x++) {
      modules[6][x] = x % 2 === 0;
    }
    // Vertical timing pattern (column 6, rows 8 to moduleCount-8)
    for (let y = 8; y < this.moduleCount - 8; y++) {
      modules[y][6] = y % 2 === 0;
    }
  }

  // Add alignment pattern
  addAlignmentPattern(modules, x, y) {
    // 5x5 pattern
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

  // Simplified data module addition
  addDataModules(modules, data) {
    // Fill remaining modules with a simple pattern (for demonstration)
    // In real QR, this would encode the actual data with error correction
    let dataIndex = 0;
    for (let y = 0; y < this.moduleCount; y++) {
      for (let x = 0; x < this.moduleCount; x++) {
        // Skip if module is already used by finder, timing, or alignment patterns
        if (this.isReservedModule(x, y)) continue;
        
        if (dataIndex < data.length * 8) {
          // Use bits from data
          const byteIndex = Math.floor(dataIndex / 8);
          const bitIndex = 7 - (dataIndex % 8);
          const bit = (data[byteIndex] >> bitIndex) & 1;
          modules[y][x] = bit === 1;
        } else {
          // Fill remaining with alternating pattern
          modules[y][x] = (x + y) % 2 === 0;
        }
        dataIndex++;
      }
    }
  }

  // Check if a module is reserved for patterns
  isReservedModule(x, y) {
    // Finder patterns
    if ((x < 7 && y < 7) || 
        (x < 7 && y > this.moduleCount - 8) || 
        (x > this.moduleCount - 8 && y < 7)) {
      return true;
    }
    // Timing patterns
    if (y === 6 || x === 6) return true;
    // Alignment pattern
    if (x >= 4 && x <= 8 && y >=4 && y <=8) return true;
    // Dark module
    if (x === 8 && y === this.moduleCount - 8) return true;
    return false;
  }

  // Render QR code to canvas
  renderToCanvas(text) {
    const canvas = document.createElement('canvas');
    canvas.width = this.size;
    canvas.height = this.size;
    const ctx = canvas.getContext('2d');
    
    const data = this.encodeData(text);
    const modules = this.generateModules(data);
    
    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, this.size, this.size);
    
    // Draw modules
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

  // Render QR code to SVG
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

// For Node.js backend usage, create a simple version using a canvas-like approach
if (typeof window === 'undefined') {
  // Node.js implementation - use SVG as Data URL
  module.exports = function generateQRCode(text, width = 300) {
    const qr = new CustomQRGenerator(width);
    const svg = qr.renderToSVG(text);
    // Convert SVG to Data URL
    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  };
} else {
  // Browser implementation
  window.CustomQRGenerator = CustomQRGenerator;
}
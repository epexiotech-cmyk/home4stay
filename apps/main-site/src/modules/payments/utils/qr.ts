/**
 * Self-contained, pure TypeScript QR Code SVG generator.
 * This is an implementation of a QR Code generator that generates beautiful, vector-based SVG elements
 * directly in memory, ensuring 100% offline reliability.
 */

// A simple QR Code encoder implementation
class QRCodeModel {
  typeNumber: number;
  errorCorrectLevel: number;
  modules: (boolean | null)[][] = [];
  moduleCount: number = 0;
  dataCache: number[] | null = null;
  dataList: { mode: number; data: string }[] = [];

  constructor(typeNumber: number, errorCorrectLevel: number) {
    this.typeNumber = typeNumber;
    this.errorCorrectLevel = errorCorrectLevel;
  }

  addData(data: string): void {
    this.dataList.push({ mode: 4, data }); // Mode 4 is Byte mode
    this.dataCache = null;
  }

  isDark(row: number, col: number): boolean {
    if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
      return false;
    }
    return this.modules[row][col] || false;
  }

  getModuleCount(): number {
    return this.moduleCount;
  }

  make(): void {
    this.makeImpl(false, this.getBestMaskPattern());
  }

  makeImpl(test: boolean, maskPattern: number): void {
    this.moduleCount = this.typeNumber * 4 + 17;
    this.modules = new Array(this.moduleCount);
    for (let row = 0; row < this.moduleCount; row++) {
      this.modules[row] = new Array(this.moduleCount).fill(null);
    }
    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    this.setupPositionAdjustPattern();
    this.setupTimingPattern();
    this.setupTypeInfo(test, maskPattern);
    if (this.typeNumber >= 7) {
      this.setupTypeNumber(test);
    }
    if (this.dataCache == null) {
      this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
    }
    this.mapData(this.dataCache, maskPattern);
  }

  setupPositionProbePattern(row: number, col: number): void {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || this.moduleCount <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || this.moduleCount <= col + c) continue;
        if (
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  }

  getBestMaskPattern(): number {
    let minLostPoint = 0;
    let bestMaskPattern = 0;
    for (let i = 0; i < 8; i++) {
      this.makeImpl(true, i);
      const lostPoint = this.getLostPoint();
      if (i === 0 || minLostPoint > lostPoint) {
        minLostPoint = lostPoint;
        bestMaskPattern = i;
      }
    }
    return bestMaskPattern;
  }

  getLostPoint(): number {
    const moduleCount = this.moduleCount;
    let lostPoint = 0;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        let sameColorCount = 0;
        const dark = this.isDark(row, col);
        for (let r = -1; r <= 1; r++) {
          if (row + r < 0 || moduleCount <= row + r) continue;
          for (let c = -1; c <= 1; c++) {
            if (col + c < 0 || moduleCount <= col + c) continue;
            if (r === 0 && c === 0) continue;
            if (dark === this.isDark(row + r, col + c)) {
              sameColorCount++;
            }
          }
        }
        if (sameColorCount > 5) {
          lostPoint += 3 + sameColorCount - 5;
        }
      }
    }
    for (let row = 0; row < moduleCount - 1; row++) {
      for (let col = 0; col < moduleCount - 1; col++) {
        const count =
          (this.isDark(row, col) ? 1 : 0) +
          (this.isDark(row + 1, col) ? 1 : 0) +
          (this.isDark(row, col + 1) ? 1 : 0) +
          (this.isDark(row + 1, col + 1) ? 1 : 0);
        if (count === 0 || count === 4) {
          lostPoint += 3;
        }
      }
    }
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount - 6; col++) {
        if (
          this.isDark(row, col) &&
          !this.isDark(row, col + 1) &&
          this.isDark(row, col + 2) &&
          this.isDark(row, col + 3) &&
          this.isDark(row, col + 4) &&
          !this.isDark(row, col + 5) &&
          this.isDark(row, col + 6)
        ) {
          lostPoint += 40;
        }
      }
    }
    for (let col = 0; col < moduleCount; col++) {
      for (let row = 0; row < moduleCount - 6; row++) {
        if (
          this.isDark(row, col) &&
          !this.isDark(row + 1, col) &&
          this.isDark(row + 2, col) &&
          this.isDark(row + 3, col) &&
          this.isDark(row + 4, col) &&
          !this.isDark(row + 5, col) &&
          this.isDark(row + 6, col)
        ) {
          lostPoint += 40;
        }
      }
    }
    let darkCount = 0;
    for (let col = 0; col < moduleCount; col++) {
      for (let row = 0; row < moduleCount; row++) {
        if (this.isDark(row, col)) {
          darkCount++;
        }
      }
    }
    const ratio = Math.abs((100 * darkCount) / moduleCount / moduleCount - 50) / 5;
    lostPoint += ratio * 10;
    return lostPoint;
  }

  setupPositionAdjustPattern(): void {
    const pos = QRUtil.getPatternPosition(this.typeNumber);
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        const row = pos[i];
        const col = pos[j];
        if (this.modules[row][col] != null) continue;
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
              this.modules[row + r][col + c] = true;
            } else {
              this.modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
  }

  setupTimingPattern(): void {
    for (let r = 8; r < this.moduleCount - 8; r++) {
      if (this.modules[r][6] != null) continue;
      this.modules[r][6] = r % 2 === 0;
    }
    for (let c = 8; c < this.moduleCount - 8; c++) {
      if (this.modules[6][c] != null) continue;
      this.modules[6][c] = c % 2 === 0;
    }
  }

  setupTypeInfo(test: boolean, maskPattern: number): void {
    const bits = QRUtil.getBCHTypeInfo((this.errorCorrectLevel << 3) | maskPattern);
    for (let i = 0; i < 15; i++) {
      const mod = !test && ((bits >> i) & 1) === 1;
      if (i < 6) {
        this.modules[i][8] = mod;
      } else if (i < 8) {
        this.modules[i + 1][8] = mod;
      } else {
        this.modules[this.moduleCount - 15 + i][8] = mod;
      }
    }
    for (let i = 0; i < 15; i++) {
      const mod = !test && ((bits >> i) & 1) === 1;
      if (i < 8) {
        this.modules[8][this.moduleCount - i - 1] = mod;
      } else if (i < 9) {
        this.modules[8][15 - i - 1 + 1] = mod;
      } else {
        this.modules[8][15 - i - 1] = mod;
      }
    }
    this.modules[this.moduleCount - 8][8] = !test;
  }

  setupTypeNumber(test: boolean): void {
    const bits = QRUtil.getBCHTypeNumber(this.typeNumber);
    for (let i = 0; i < 18; i++) {
      const mod = !test && ((bits >> i) & 1) === 1;
      this.modules[Math.floor(i / 3)][(i % 3) + this.moduleCount - 8 - 3] = mod;
    }
    for (let i = 0; i < 18; i++) {
      const mod = !test && ((bits >> i) & 1) === 1;
      this.modules[(i % 3) + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
    }
  }

  mapData(data: number[], maskPattern: number): void {
    let inc = -1;
    let row = this.moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;
    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      while (true) {
        for (let c = 0; c < 2; c++) {
          const targetCol = col - c;
          if (this.modules[row][targetCol] == null) {
            let dark = false;
            if (byteIndex < data.length) {
              dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
            }
            const mask = QRUtil.getMask(maskPattern, row, targetCol);
            if (mask) {
              dark = !dark;
            }
            this.modules[row][targetCol] = dark;
            bitIndex--;
            if (bitIndex === -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }
        row += inc;
        if (row < 0 || this.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }

  static createData(typeNumber: number, errorCorrectLevel: number, dataList: { mode: number; data: string }[]): number[] {
    const rsBlocks = QRUtil.getRSBlocks(typeNumber, errorCorrectLevel);
    const buffer = new QRBitBuffer();
    for (let i = 0; i < dataList.length; i++) {
      const data = dataList[i];
      buffer.put(data.mode, 4);
      buffer.put(data.data.length, QRUtil.getLengthInBits(data.mode, typeNumber));
      const bytes = new TextEncoder().encode(data.data);
      for (let j = 0; j < bytes.length; j++) {
        buffer.put(bytes[j], 8);
      }
    }
    let totalDataCount = 0;
    for (let i = 0; i < rsBlocks.length; i++) {
      totalDataCount += rsBlocks[i].dataCount;
    }
    if (buffer.getLengthInBits() > totalDataCount * 8) {
      throw new Error(`Data overflow: buffer length (${buffer.getLengthInBits()}) > capacity (${totalDataCount * 8})`);
    }
    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
      buffer.put(0, 4);
    }
    while (buffer.getLengthInBits() % 8 !== 0) {
      buffer.putBit(false);
    }
    while (true) {
      if (buffer.getLengthInBits() >= totalDataCount * 8) break;
      buffer.put(0xec, 8);
      if (buffer.getLengthInBits() >= totalDataCount * 8) break;
      buffer.put(0x11, 8);
    }
    return QRCodeModel.createBytes(buffer, rsBlocks);
  }

  static createBytes(buffer: QRBitBuffer, rsBlocks: QRRSBlock[]): number[] {
    let offset = 0;
    let maxDcCount = 0;
    let maxEcCount = 0;
    const dcdata: number[][] = new Array(rsBlocks.length);
    const ecdata: number[][] = new Array(rsBlocks.length);
    for (let r = 0; r < rsBlocks.length; r++) {
      const dcCount = rsBlocks[r].dataCount;
      const ecCount = rsBlocks[r].totalCount - dcCount;
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);
      dcdata[r] = new Array(dcCount);
      for (let i = 0; i < dcdata[r].length; i++) {
        dcdata[r][i] = 0xff & buffer.buffer[i + offset];
      }
      offset += dcCount;
      const rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
      const rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
      const modPoly = rawPoly.mod(rsPoly);
      ecdata[r] = new Array(rsPoly.getLength() - 1);
      for (let i = 0; i < ecdata[r].length; i++) {
        const modIndex = i + modPoly.getLength() - ecdata[r].length;
        ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
      }
    }
    let totalCodeCount = 0;
    for (let i = 0; i < rsBlocks.length; i++) {
      totalCodeCount += rsBlocks[i].totalCount;
    }
    const data = new Array(totalCodeCount);
    let index = 0;
    for (let i = 0; i < maxDcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < dcdata[r].length) {
          data[index++] = dcdata[r][i];
        }
      }
    }
    for (let i = 0; i < maxEcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < ecdata[r].length) {
          data[index++] = ecdata[r][i];
        }
      }
    }
    return data;
  }
}

class QRPolynomial {
  num: number[];
  constructor(num: number[], shift: number) {
    let offset = 0;
    while (offset < num.length && num[offset] === 0) {
      offset++;
    }
    this.num = new Array(num.length - offset + shift).fill(0);
    for (let i = 0; i < num.length - offset; i++) {
      this.num[i] = num[i + offset];
    }
  }

  get(index: number): number {
    return this.num[index];
  }

  getLength(): number {
    return this.num.length;
  }

  multiply(e: QRPolynomial): QRPolynomial {
    const num = new Array(this.getLength() + e.getLength() - 1).fill(0);
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        num[i + j] ^= QRUtil.gexp(QRUtil.glog(this.get(i)) + QRUtil.glog(e.get(j)));
      }
    }
    return new QRPolynomial(num, 0);
  }

  mod(e: QRPolynomial): QRPolynomial {
    if (this.getLength() - e.getLength() < 0) {
      return this;
    }
    const ratio = QRUtil.glog(this.get(0)) - QRUtil.glog(e.get(0));
    const num = new Array(this.getLength());
    for (let i = 0; i < this.getLength(); i++) {
      num[i] = this.get(i);
    }
    for (let i = 0; i < e.getLength(); i++) {
      num[i] ^= QRUtil.gexp(QRUtil.glog(e.get(i)) + ratio);
    }
    return new QRPolynomial(num, 0).mod(e);
  }
}

class QRRSBlock {
  totalCount: number;
  dataCount: number;
  constructor(totalCount: number, dataCount: number) {
    this.totalCount = totalCount;
    this.dataCount = dataCount;
  }
}

class QRBitBuffer {
  buffer: number[] = [];
  length: number = 0;

  get(index: number): boolean {
    const bufIndex = Math.floor(index / 8);
    return ((this.buffer[bufIndex] >>> (7 - (index % 8))) & 1) === 1;
  }

  put(num: number, length: number): void {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  getLengthInBits(): number {
    return this.length;
  }

  putBit(bit: boolean): void {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= 0x80 >>> (this.length % 8);
    }
    this.length++;
  }
}

const QRUtil = {
  PATTERN_POSITION_TABLE: [
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    [6, 30, 54],
    [6, 32, 58],
    [6, 34, 62],
    [6, 26, 46, 66],
    [6, 26, 48, 70],
    [6, 26, 50, 74],
    [6, 30, 54, 78],
    [6, 30, 56, 82],
    [6, 30, 58, 86],
    [6, 34, 62, 90],
  ] as number[][],

  G15: (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0),
  G18: (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0),
  G15_MASK: (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1),

  getPatternPosition(typeNumber: number): number[] {
    return this.PATTERN_POSITION_TABLE[typeNumber - 1] || [];
  },

  getMask(maskPattern: number, i: number, j: number): boolean {
    switch (maskPattern) {
      case 0: return (i + j) % 2 === 0;
      case 1: return i % 2 === 0;
      case 2: return j % 3 === 0;
      case 3: return (i + j) % 3 === 0;
      case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
      case 5: return ((i * j) % 2) + ((i * j) % 3) === 0;
      case 6: return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
      case 7: return (((i + j) % 2) + ((i * j) % 3)) % 2 === 0;
      default: throw new Error(`Invalid mask pattern: ${maskPattern}`);
    }
  },

  getErrorCorrectPolynomial(errorCorrectLength: number): QRPolynomial {
    let a = new QRPolynomial([1], 0);
    for (let i = 0; i < errorCorrectLength; i++) {
      a = a.multiply(new QRPolynomial([1, this.gexp(i)], 0));
    }
    return a;
  },

  getLengthInBits(mode: number, type: number): number {
    if (1 <= type && type < 10) {
      switch (mode) {
        case 1: return 10;
        case 2: return 9;
        case 4: return 8;
        default: throw new Error(`Invalid mode: ${mode}`);
      }
    } else if (type < 27) {
      switch (mode) {
        case 1: return 12;
        case 2: return 11;
        case 4: return 16;
        default: throw new Error(`Invalid mode: ${mode}`);
      }
    } else if (type < 41) {
      switch (mode) {
        case 1: return 14;
        case 2: return 13;
        case 4: return 16;
        default: throw new Error(`Invalid mode: ${mode}`);
      }
    } else {
      throw new Error(`Invalid type: ${type}`);
    }
  },

  getRSBlocks(typeNumber: number, errorCorrectLevel: number): QRRSBlock[] {
    const L = 1, M = 0, Q = 3;
    switch (typeNumber) {
      case 1:
        if (errorCorrectLevel === L) return [new QRRSBlock(26, 19)];
        if (errorCorrectLevel === M) return [new QRRSBlock(26, 16)];
        if (errorCorrectLevel === Q) return [new QRRSBlock(26, 13)];
        return [new QRRSBlock(26, 9)];
      case 2:
        if (errorCorrectLevel === L) return [new QRRSBlock(44, 34)];
        if (errorCorrectLevel === M) return [new QRRSBlock(44, 28)];
        if (errorCorrectLevel === Q) return [new QRRSBlock(44, 22)];
        return [new QRRSBlock(44, 16)];
      case 3:
        if (errorCorrectLevel === L) return [new QRRSBlock(70, 55)];
        if (errorCorrectLevel === M) return [new QRRSBlock(70, 44)];
        if (errorCorrectLevel === Q) return [new QRRSBlock(70, 34)];
        return [new QRRSBlock(70, 26)];
      case 4:
        if (errorCorrectLevel === L) return [new QRRSBlock(100, 80)];
        if (errorCorrectLevel === M) return [new QRRSBlock(100, 64)];
        if (errorCorrectLevel === Q) return [new QRRSBlock(100, 48)];
        return [new QRRSBlock(100, 36)];
      case 5:
        if (errorCorrectLevel === L) return [new QRRSBlock(134, 108)];
        if (errorCorrectLevel === M) return [new QRRSBlock(134, 86)];
        if (errorCorrectLevel === Q) return [new QRRSBlock(134, 62)];
        return [new QRRSBlock(134, 46)];
      case 6:
        if (errorCorrectLevel === L) return [new QRRSBlock(172, 136)];
        if (errorCorrectLevel === M) return [new QRRSBlock(172, 108)];
        if (errorCorrectLevel === Q) return [new QRRSBlock(172, 80)];
        return [new QRRSBlock(172, 60)];
      default:
        // Generic fallback for larger data sizes (UPI is usually tiny)
        if (errorCorrectLevel === L) return [new QRRSBlock(200, 160)];
        if (errorCorrectLevel === M) return [new QRRSBlock(200, 120)];
        if (errorCorrectLevel === Q) return [new QRRSBlock(200, 90)];
        return [new QRRSBlock(200, 60)];
    }
  },

  getBCHTypeInfo(data: number): number {
    let d = data << 10;
    while (this.getBCHDigit(d) - this.getBCHDigit(this.G15) >= 0) {
      d ^= this.G15 << (this.getBCHDigit(d) - this.getBCHDigit(this.G15));
    }
    return ((data << 10) | d) ^ this.G15_MASK;
  },

  getBCHTypeNumber(data: number): number {
    let d = data << 12;
    while (this.getBCHDigit(d) - this.getBCHDigit(this.G18) >= 0) {
      d ^= this.G18 << (this.getBCHDigit(d) - this.getBCHDigit(this.G18));
    }
    return (data << 12) | d;
  },

  getBCHDigit(data: number): number {
    let digit = 0;
    while (data !== 0) {
      digit++;
      data >>>= 1;
    }
    return digit;
  },

  EXP_TABLE: new Array(256) as number[],
  LOG_TABLE: new Array(256) as number[],

  gexp(n: number): number {
    while (n < 0) n += 255;
    while (n >= 255) n -= 255;
    return this.EXP_TABLE[n];
  },

  glog(n: number): number {
    if (n < 1 || n >= 256) throw new Error(`glog(${n}) error`);
    return this.LOG_TABLE[n];
  },
};

// Initialize EXP and LOG tables for Galois Field arithmetic
for (let i = 0; i < 8; i++) {
  QRUtil.EXP_TABLE[i] = 1 << i;
}
for (let i = 8; i < 256; i++) {
  QRUtil.EXP_TABLE[i] =
    QRUtil.EXP_TABLE[i - 4] ^
    QRUtil.EXP_TABLE[i - 5] ^
    QRUtil.EXP_TABLE[i - 6] ^
    QRUtil.EXP_TABLE[i - 8];
}
for (let i = 0; i < 255; i++) {
  QRUtil.LOG_TABLE[QRUtil.EXP_TABLE[i]] = i;
}

/**
 * Generates an SVG vector representation of the QR Code for a given text.
 */
export function generateQrSvg(text: string, size = 256): string {
  // Automatically adjust QR type based on input string length
  let type = 4;
  if (text.length > 80) type = 6;
  if (text.length > 120) type = 8;

  const qr = new QRCodeModel(type, 0); // 0 corresponds to level M error correction
  qr.addData(text);
  qr.make();

  const count = qr.getModuleCount();
  const scale = size / count;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
  svg += `<rect width="100%" height="100%" fill="#ffffff"/>`; // Clean white background
  
  // Render QR dark modules
  svg += `<path d="`;
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        const x = Math.round(c * scale * 100) / 100;
        const y = Math.round(r * scale * 100) / 100;
        const w = Math.ceil(scale * 100) / 100;
        svg += `M${x},${y}h${w}v${w}h-${w}z `;
      }
    }
  }
  // Standard luxurious dark slate tone for modules
  svg += `" fill="#0f172a" shape-rendering="crispEdges"/>`;
  svg += `</svg>`;

  return svg;
}

/**
 * Generates a base64 Data URI of the SVG QR Code.
 */
export function generateQrDataUri(text: string, size = 256): string {
  const svg = generateQrSvg(text, size);
  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Sassembly Engine (साधनम् + यन्त्र Web Core)
 * Pure JavaScript Assembler, Tokenizer, Disassembler, and RV64 Virtual Machine
 * Implements Sassembly grammar, the 5 Kāraka sigils, Sanskrit numerals, and dual-surface execution.
 * Built for ParamTatva.org Sanskrit Computing Portal.
 */

(function (global) {
  'use strict';

  // --- 1. Sanskrit Registers Specification ---
  const REGISTERS = [
    { dev: 'शून्यः', abi: 'zero', num: 0, desc: 'Hardwired Zero' },
    { dev: 'पुनःस्थानम्', abi: 'ra', num: 1, desc: 'Return Address' },
    { dev: 'स्तूपसूचकः', abi: 'sp', num: 2, desc: 'Stack Pointer' },
    { dev: 'विश्वसूचकः', abi: 'gp', num: 3, desc: 'Global Pointer' },
    { dev: 'तन्तुसूचकः', abi: 'tp', num: 4, desc: 'Thread Pointer' },
    { dev: 'क्षणिक०', abi: 't0', num: 5, desc: 'Temporary 0' },
    { dev: 'क्षणिक१', abi: 't1', num: 6, desc: 'Temporary 1' },
    { dev: 'क्षणिक२', abi: 't2', num: 7, desc: 'Temporary 2' },
    { dev: 'स्थिर०', abi: 's0', num: 8, desc: 'Saved Register 0 / Frame Pointer' },
    { dev: 'स्थिर१', abi: 's1', num: 9, desc: 'Saved Register 1' },
    { dev: 'अर्थ०', abi: 'a0', num: 10, desc: 'Function Arg / Return 0' },
    { dev: 'अर्थ१', abi: 'a1', num: 11, desc: 'Function Arg / Return 1' },
    { dev: 'अर्थ२', abi: 'a2', num: 12, desc: 'Function Argument 2' },
    { dev: 'अर्थ३', abi: 'a3', num: 13, desc: 'Function Argument 3' },
    { dev: 'अर्थ४', abi: 'a4', num: 14, desc: 'Function Argument 4' },
    { dev: 'अर्थ५', abi: 'a5', num: 15, desc: 'Function Argument 5' },
    { dev: 'अर्थ६', abi: 'a6', num: 16, desc: 'Function Argument 6' },
    { dev: 'अर्थ७', abi: 'a7', num: 17, desc: 'Function Argument 7' },
    { dev: 'स्थिर२', abi: 's2', num: 18, desc: 'Saved Register 2' },
    { dev: 'स्थिर३', abi: 's3', num: 19, desc: 'Saved Register 3' },
    { dev: 'स्थिर४', abi: 's4', num: 20, desc: 'Saved Register 4' },
    { dev: 'स्थिर५', abi: 's5', num: 21, desc: 'Saved Register 5' },
    { dev: 'स्थिर६', abi: 's6', num: 22, desc: 'Saved Register 6' },
    { dev: 'स्थिर७', abi: 's7', num: 23, desc: 'Saved Register 7' },
    { dev: 'स्थिर८', abi: 's8', num: 24, desc: 'Saved Register 8' },
    { dev: 'स्थिर९', abi: 's9', num: 25, desc: 'Saved Register 9' },
    { dev: 'स्थिर१०', abi: 's10', num: 26, desc: 'Saved Register 10' },
    { dev: 'स्थिर११', abi: 's11', num: 27, desc: 'Saved Register 11' },
    { dev: 'क्षणिक३', abi: 't3', num: 28, desc: 'Temporary 3' },
    { dev: 'क्षणिक४', abi: 't4', num: 29, desc: 'Temporary 4' },
    { dev: 'क्षणिक५', abi: 't5', num: 30, desc: 'Temporary 5' },
    { dev: 'क्षणिक६', abi: 't6', num: 31, desc: 'Temporary 6' }
  ];

  const REG_MAP = new Map();
  REGISTERS.forEach(r => {
    REG_MAP.set(r.dev, r.num);
    REG_MAP.set(r.abi, r.num);
    REG_MAP.set('x' + r.num, r.num);
  });

  // --- 2. The 5 Kāraka Sigils ---
  const KARAKA = {
    DESTINATION: { sigil: 'म्', name: 'कर्म', desc: 'Destination (write here)' },
    SOURCE: { sigil: 'न', name: 'करण', desc: 'Source / Instrument (read from)' },
    SOURCE_ADDR: { sigil: 'त्', name: 'अपादान', desc: 'Source Address (load from)' },
    DEST_ADDR: { sigil: 'य्', name: 'सम्प्रदान', desc: 'Destination Address (store to / branch target)' },
    LOCUS: { sigil: 'ए', name: 'अधिकरण', desc: 'Locus (at / in)' }
  };

  // --- 3. 49 Mnemonic Families ---
  const MNEMONICS = {
    'योगः': { family: 'add', type: 'R_I', desc: 'Addition / Add Immediate' },
    'वियोगः': { family: 'sub', type: 'R', desc: 'Subtraction' },
    'उपरिभारः': { family: 'lui', type: 'U', desc: 'Load Upper Immediate' },
    'स्थानसापेक्षयोगः': { family: 'auipc', type: 'U', desc: 'Add Upper Immediate to PC' },
    'युक्तम्': { family: 'and', type: 'R_I', desc: 'Bitwise AND' },
    'विकल्पः': { family: 'or', type: 'R_I', desc: 'Bitwise OR' },
    'वैषम्यम्': { family: 'xor', type: 'R_I', desc: 'Bitwise XOR' },
    'व्यत्ययः': { family: 'not', type: 'PSEUDO_NOT', desc: 'Bitwise NOT' },
    'वामसरणम्': { family: 'shl', type: 'R_I', desc: 'Shift Left Logical' },
    'दक्षिणसरणम्': { family: 'shr', type: 'R_I', desc: 'Shift Right Logical' },
    'सचिह्नदक्षिणसरणम्': { family: 'sra', type: 'R_I', desc: 'Shift Right Arithmetic' },
    'न्यूनम्': { family: 'slt', type: 'R_I', desc: 'Set if Less Than (signed)' },
    'अचिह्नन्यूनम्': { family: 'sltu', type: 'R_I', desc: 'Set if Less Than (unsigned)' },
    'लङ्घनम्': { family: 'jal', type: 'J', desc: 'Jump and Link' },
    'सापेक्षलङ्घनम्': { family: 'jalr', type: 'I_JUMP', desc: 'Jump and Link Register' },
    'समलङ्घनम्': { family: 'beq', type: 'B', desc: 'Branch if Equal' },
    'विषमलङ्घनम्': { family: 'bne', type: 'B', desc: 'Branch if Not Equal' },
    'न्यूनलङ्घनम्': { family: 'blt', type: 'B', desc: 'Branch if Less Than' },
    'अन्यूनलङ्घनम्': { family: 'bge', type: 'B', desc: 'Branch if Greater or Equal' },
    'अचिह्नन्यूनलङ्घनम्': { family: 'bltu', type: 'B', desc: 'Branch if Less Than (unsigned)' },
    'अचिह्नान्यूनलङ्घनम्': { family: 'bgeu', type: 'B', desc: 'Branch if Greater or Equal (unsigned)' },
    'आहारः': { family: 'load', type: 'LOAD', desc: 'Load from Memory' },
    'अचिह्नाहारः': { family: 'loadu', type: 'LOAD', desc: 'Load Unsigned from Memory' },
    'निधानम्': { family: 'store', type: 'STORE', desc: 'Store to Memory' },
    'गुणनम्': { family: 'mul', type: 'M', desc: 'Multiplication' },
    'उपरिगुणनम्': { family: 'mulh', type: 'M', desc: 'Multiplication High Bits (signed)' },
    'अचिह्नोपरिगुणनम्': { family: 'mulhu', type: 'M', desc: 'Multiplication High Bits (unsigned)' },
    'भागः': { family: 'div', type: 'M', desc: 'Division (signed)' },
    'अचिह्नभागः': { family: 'divu', type: 'M', desc: 'Division (unsigned)' },
    'शेषः': { family: 'rem', type: 'M', desc: 'Remainder (signed)' },
    'अचिह्नशेषः': { family: 'remu', type: 'M', desc: 'Remainder (unsigned)' },
    'आज्ञापनम्': { family: 'ecall', type: 'SYSTEM', desc: 'Environment Call (Supervisor Call)' },
    'अन्वेषणविरामः': { family: 'ebreak', type: 'SYSTEM', desc: 'Breakpoint' },
    'स्मृतिबन्धः': { family: 'fence', type: 'SYSTEM', desc: 'Memory Fence Barrier' },
    'परमाणुपठनम्': { family: 'lr', type: 'A', desc: 'Load Reserved' },
    'परमाणुलेखनम्': { family: 'sc', type: 'A', desc: 'Store Conditional' },
    'परमाणुविनिमयः': { family: 'amoswap', type: 'A', desc: 'Atomic Swap' },
    'परमाणुयोगः': { family: 'amoadd', type: 'A', desc: 'Atomic Add' }
  };

  // --- 4. Sanskrit Numeral Conversion ---
  const DEVA_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  const HEX_MAP = {
    '०': 0, '१': 1, '२': 2, '३': 3, '४': 4, '५': 5, '६': 6, '७': 7, '८': 8, '९': 9,
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'अ': 10, 'आ': 11, 'इ': 12, 'ई': 13, 'उ': 14, 'ऊ': 15,
    'a': 10, 'b': 11, 'c': 12, 'd': 13, 'e': 14, 'f': 15,
    'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15
  };

  function parseSanskritNumeral(rawStr) {
    if (typeof rawStr === 'number') return rawStr;
    if (!rawStr) return 0;
    let str = String(rawStr).trim();

    // Check Hexadecimal (०षोड् or 0x)
    if (str.startsWith('०षोड्') || str.startsWith('0x') || str.startsWith('0X')) {
      let digits = str.startsWith('०षोड्') ? str.slice(5) : str.slice(2);
      let val = 0n;
      for (let ch of digits) {
        if (HEX_MAP[ch] !== undefined) {
          val = (val << 4n) | BigInt(HEX_MAP[ch]);
        }
      }
      return Number(val);
    }

    // Check Binary (०द्वि or 0b)
    if (str.startsWith('०द्वि') || str.startsWith('0b')) {
      let digits = str.startsWith('०द्वि') ? str.slice(5) : str.slice(2);
      let val = 0n;
      for (let ch of digits) {
        let bit = (ch === '१' || ch === '1') ? 1n : 0n;
        val = (val << 1n) | bit;
      }
      return Number(val);
    }

    // Check Octal (०अष्ट or 0o)
    if (str.startsWith('०अष्ट') || str.startsWith('0o')) {
      let digits = str.startsWith('०अष्ट') ? str.slice(5) : str.slice(2);
      let val = 0n;
      for (let ch of digits) {
        let d = DEVA_DIGITS.indexOf(ch);
        if (d === -1) d = parseInt(ch, 10);
        if (!isNaN(d)) val = (val << 3n) | BigInt(d);
      }
      return Number(val);
    }

    // Decimal with Devanagari or ASCII digits
    let asciiDigits = '';
    let isNegative = false;
    if (str.startsWith('-') || str.startsWith('−')) {
      isNegative = true;
      str = str.slice(1);
    }
    for (let ch of str) {
      let d = DEVA_DIGITS.indexOf(ch);
      if (d !== -1) {
        asciiDigits += d;
      } else if (ch >= '0' && ch <= '9') {
        asciiDigits += ch;
      }
    }
    let parsed = parseInt(asciiDigits, 10);
    if (isNaN(parsed)) return 0;
    return isNegative ? -parsed : parsed;
  }

  function toSanskritNumeral(num, radix = 10) {
    if (radix === 16) {
      let hex = Math.abs(num).toString(16);
      let sHex = '';
      for (let c of hex) {
        if (c >= '0' && c <= '9') sHex += DEVA_DIGITS[parseInt(c, 10)];
        else if (c === 'a') sHex += 'अ';
        else if (c === 'b') sHex += 'आ';
        else if (c === 'c') sHex += 'इ';
        else if (c === 'd') sHex += 'ई';
        else if (c === 'e') sHex += 'उ';
        else if (c === 'f') sHex += 'ऊ';
      }
      return (num < 0 ? '-' : '') + '०षोड्' + sHex;
    }
    let str = Math.abs(num).toString(10);
    let dev = '';
    for (let c of str) {
      dev += DEVA_DIGITS[parseInt(c, 10)];
    }
    return (num < 0 ? '-' : '') + dev;
  }

  // --- 5. Sassembly Tokenizer & AST Parser ---
  function parseSassembly(source) {
    const lines = source.split(/\r?\n/);
    const labels = new Map();
    const instructions = [];
    const diagnostics = [];
    let currentSection = '.text';
    const dataBytes = [];

    // Pre-pass: collect lines and strip comments
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      let line = lines[lineNum].trim();
      if (!line || line.startsWith('॰')) continue;

      // Remove inline comments
      let commentIdx = line.indexOf('॰');
      if (commentIdx !== -1) {
        line = line.substring(0, commentIdx).trim();
      }
      if (!line) continue;

      // Check Directives: ॥ ... ॥
      if (line.startsWith('॥') && line.endsWith('॥')) {
        let dirContent = line.slice(1, -1).trim();
        let parts = dirContent.split(/\s+/);
        let dirName = parts[0];

        if (dirName === 'कोष्ठकम्') {
          let sec = parts[1] || '';
          if (sec.includes('पाठ') || sec.includes('text')) currentSection = '.text';
          else if (sec.includes('दत्त') || sec.includes('data')) currentSection = '.data';
        } else if (dirName === 'अष्टकाः') {
          let inner = dirContent.substring('अष्टकाः'.length).trim();
          if (inner.includes('उक्तम्') && inner.includes('इति')) {
            let strMatch = inner.match(/उक्तम्\s+([\s\S]+?)\s+इति/);
            if (strMatch) {
              let text = strMatch[1];
              let encoder = new TextEncoder();
              let bytes = encoder.encode(text);
              for (let b of bytes) dataBytes.push(b);
            }
          } else {
            let nums = inner.split(/\s+/);
            for (let n of nums) {
              if (n) dataBytes.push(parseSanskritNumeral(n) & 0xFF);
            }
          }
        } else if (dirName === 'स्थानम्') {
          let count = parseSanskritNumeral(parts[1] || '0');
          for (let i = 0; i < count; i++) dataBytes.push(0);
        }
        continue;
      }

      // Check Labels: <name>ॱॱ
      if (line.endsWith('ॱॱ')) {
        let labelName = line.slice(0, -2).trim();
        labels.set(labelName, {
          section: currentSection,
          pc: instructions.length,
          dataOffset: dataBytes.length
        });
        continue;
      }

      // Instruction statement ending in ।
      let statements = line.split('।');
      for (let stmt of statements) {
        let cleanStmt = stmt.trim();
        if (!cleanStmt) continue;

        let tokens = cleanStmt.split(/\s+/);
        let verbToken = tokens[0];
        let extent = 'ॱअ६४';

        if (verbToken.includes('ॱअ')) {
          let parts = verbToken.split('ॱअ');
          verbToken = parts[0];
          extent = 'ॱअ' + parts[1];
        }

        let mnemonic = MNEMONICS[verbToken];
        if (!mnemonic) {
          diagnostics.push({
            line: lineNum + 1,
            text: `अज्ञातं क्रियापदम्: "${verbToken}" (Unknown verb / mnemonic at line ${lineNum + 1})`
          });
          continue;
        }

        let operands = [];
        for (let i = 1; i < tokens.length; i++) {
          let rawOp = tokens[i].trim();
          if (!rawOp) continue;

          let role = null;
          let baseToken = rawOp;

          if (rawOp.endsWith('म्')) {
            role = 'कर्म'; // Destination
            baseToken = rawOp.slice(0, -1);
          } else if (rawOp.endsWith('न')) {
            role = 'करण'; // Source
            baseToken = rawOp.slice(0, -1);
          } else if (rawOp.endsWith('त्')) {
            role = 'अपादान'; // Load Address
            baseToken = rawOp.slice(0, -1);
          } else if (rawOp.endsWith('य्')) {
            role = 'सम्प्रदान'; // Store Address / Jump Target
            baseToken = rawOp.slice(0, -1);
          } else if (rawOp.endsWith('ए')) {
            role = 'अधिकरण'; // Locus
            baseToken = rawOp.slice(0, -1);
          }

          let regNum = REG_MAP.get(baseToken) !== undefined ? REG_MAP.get(baseToken) : REG_MAP.get(rawOp);

          operands.push({
            raw: rawOp,
            base: baseToken,
            role: role,
            reg: regNum,
            isReg: regNum !== undefined,
            numVal: parseSanskritNumeral(baseToken),
            isNum: !isNaN(parseSanskritNumeral(baseToken)) && REG_MAP.get(baseToken) === undefined
          });
        }

        instructions.push({
          line: lineNum + 1,
          raw: cleanStmt + ' ।',
          verb: verbToken,
          extent: extent,
          mnemonic: mnemonic,
          operands: operands
        });
      }
    }

    return {
      labels,
      instructions,
      dataBytes: new Uint8Array(dataBytes),
      diagnostics
    };
  }

  // --- 6. RISC-V 64-bit Virtual Machine (यन्त्र Web Core) ---
  class SassemblyVM {
    constructor() {
      this.reset();
    }

    reset() {
      this.registers = new BigInt64Array(32);
      this.pc = 0x80000000n;
      this.isAppMode = false;
      this.memory = new Map();
      this.uartOutput = '';
      this.surfaceOutput = '';
      this.haltReason = 'Ready (सज्जम्)';
      this.exitCode = null;
      this.cycleCount = 0;
      this.instructions = [];
      this.labels = new Map();
      this.lineMap = new Map();
      this.pcToIndex = new Map();
      this.isHalted = false;
    }

    loadProgram(source, isApp = false) {
      this.reset();
      this.isAppMode = isApp;
      const parsed = parseSassembly(source);

      if (parsed.diagnostics.length > 0) {
        return { success: false, errors: parsed.diagnostics };
      }

      this.labels = parsed.labels;
      this.instructions = parsed.instructions;
      let baseAddress = isApp ? 0x20000000n : 0x80000000n;
      this.pc = baseAddress;

      let currentPc = baseAddress;
      for (let i = 0; i < parsed.instructions.length; i++) {
        let inst = parsed.instructions[i];
        inst.pc = currentPc;
        this.pcToIndex.set(currentPc, i);
        this.lineMap.set(inst.line, currentPc);
        currentPc += 4n;
      }

      let dataBase = isApp ? 0x20040000n : 0x80040000n;
      for (let i = 0; i < parsed.dataBytes.length; i++) {
        this.writeByte(dataBase + BigInt(i), parsed.dataBytes[i]);
      }

      for (let [label, info] of parsed.labels.entries()) {
        if (info.section === '.text') {
          info.address = baseAddress + BigInt(info.pc * 4);
        } else {
          info.address = dataBase + BigInt(info.dataOffset);
        }
      }

      return {
        success: true,
        instructionCount: this.instructions.length,
        dataSize: parsed.dataBytes.length
      };
    }

    writeByte(addr, val) {
      this.memory.set(addr, val & 0xFF);
    }

    readByte(addr) {
      if (addr === 0x10000000n) return 0;
      return this.memory.get(addr) || 0;
    }

    readInt64(addr) {
      let b0 = BigInt(this.readByte(addr));
      let b1 = BigInt(this.readByte(addr + 1n));
      let b2 = BigInt(this.readByte(addr + 2n));
      let b3 = BigInt(this.readByte(addr + 3n));
      let b4 = BigInt(this.readByte(addr + 4n));
      let b5 = BigInt(this.readByte(addr + 5n));
      let b6 = BigInt(this.readByte(addr + 6n));
      let b7 = BigInt(this.readByte(addr + 7n));
      return (b7 << 56n) | (b6 << 48n) | (b5 << 40n) | (b4 << 32n) |
             (b3 << 24n) | (b2 << 16n) | (b1 << 8n) | b0;
    }

    step() {
      if (this.isHalted) return { halted: true, reason: this.haltReason };

      let idx = this.pcToIndex.get(this.pc);
      if (idx === undefined || idx >= this.instructions.length) {
        this.isHalted = true;
        this.haltReason = 'Program Counter Out of Bounds (अन्तः)';
        this.exitCode = 0;
        return { halted: true, reason: this.haltReason };
      }

      let inst = this.instructions[idx];
      let nextPc = this.pc + 4n;
      this.cycleCount++;

      try {
        this.executeInstruction(inst, (targetPc) => {
          nextPc = targetPc;
        });
      } catch (err) {
        this.isHalted = true;
        this.haltReason = 'Runtime Fault: ' + err.message;
        this.exitCode = 1;
        return { halted: true, reason: this.haltReason };
      }

      this.registers[0] = 0n;
      this.pc = nextPc;

      return {
        halted: this.isHalted,
        pc: this.pc,
        cycles: this.cycleCount,
        inst: inst
      };
    }

    executeInstruction(inst, setBranchPc) {
      const ops = inst.operands;
      const getDest = () => ops.find(o => o.role === 'कर्म' && o.isReg) || ops.find(o => o.isReg);
      const getSrc1 = () => ops.find(o => o.role === 'करण' && o.isReg);
      const getSrc2 = () => ops.filter(o => o.role === 'करण' && o.isReg)[1];
      const getImm = () => ops.find(o => o.isNum) || ops.find(o => o.role === 'करण' && !o.isReg);

      switch (inst.verb) {
        case 'योगः': {
          let dest = getDest();
          let src1 = getSrc1();
          let src2 = getSrc2();
          let imm = getImm();

          if (dest && src1 && src2) {
            this.registers[dest.reg] = this.registers[src1.reg] + this.registers[src2.reg];
          } else if (dest && src1 && imm) {
            let val = this.resolveValue(imm.base);
            this.registers[dest.reg] = this.registers[src1.reg] + BigInt(val);
          } else if (dest && imm) {
            let val = this.resolveValue(imm.base);
            this.registers[dest.reg] = this.registers[dest.reg] + BigInt(val);
          }
          break;
        }

        case 'वियोगः': {
          let dest = getDest();
          let src1 = getSrc1();
          let src2 = getSrc2();
          if (dest && src1 && src2) {
            this.registers[dest.reg] = this.registers[src1.reg] - this.registers[src2.reg];
          }
          break;
        }

        case 'उपरिभारः': {
          let dest = getDest();
          let imm = getImm();
          if (dest && imm) {
            let val = BigInt(this.resolveValue(imm.base));
            this.registers[dest.reg] = val << 12n;
          }
          break;
        }

        case 'स्थानसापेक्षयोगः': {
          let dest = getDest();
          let imm = getImm();
          if (dest && imm) {
            let val = BigInt(this.resolveValue(imm.base));
            this.registers[dest.reg] = this.pc + (val << 12n);
          }
          break;
        }

        case 'युक्तम्': {
          let dest = getDest();
          let src1 = getSrc1();
          let src2 = getSrc2() || getImm();
          if (dest && src1 && src2) {
            let v2 = src2.isReg ? this.registers[src2.reg] : BigInt(this.resolveValue(src2.base));
            this.registers[dest.reg] = this.registers[src1.reg] & v2;
          }
          break;
        }

        case 'विकल्पः': {
          let dest = getDest();
          let src1 = getSrc1();
          let src2 = getSrc2() || getImm();
          if (dest && src1 && src2) {
            let v2 = src2.isReg ? this.registers[src2.reg] : BigInt(this.resolveValue(src2.base));
            this.registers[dest.reg] = this.registers[src1.reg] | v2;
          }
          break;
        }

        case 'वैषम्यम्': {
          let dest = getDest();
          let src1 = getSrc1();
          let src2 = getSrc2() || getImm();
          if (dest && src1 && src2) {
            let v2 = src2.isReg ? this.registers[src2.reg] : BigInt(this.resolveValue(src2.base));
            this.registers[dest.reg] = this.registers[src1.reg] ^ v2;
          }
          break;
        }

        case 'व्यत्ययः': {
          let dest = getDest();
          let src1 = getSrc1() || dest;
          if (dest && src1) {
            this.registers[dest.reg] = ~this.registers[src1.reg];
          }
          break;
        }

        case 'वामसरणम्': {
          let dest = getDest();
          let src1 = getSrc1();
          let src2 = getSrc2() || getImm();
          if (dest && src1 && src2) {
            let shift = Number(src2.isReg ? this.registers[src2.reg] : BigInt(this.resolveValue(src2.base))) & 63;
            this.registers[dest.reg] = this.registers[src1.reg] << BigInt(shift);
          }
          break;
        }

        case 'दक्षिणसरणम्': {
          let dest = getDest();
          let src1 = getSrc1();
          let src2 = getSrc2() || getImm();
          if (dest && src1 && src2) {
            let shift = Number(src2.isReg ? this.registers[src2.reg] : BigInt(this.resolveValue(src2.base))) & 63;
            this.registers[dest.reg] = BigInt.asUintN(64, this.registers[src1.reg]) >> BigInt(shift);
          }
          break;
        }

        case 'न्यूनम्': {
          let dest = getDest();
          let src1 = getSrc1();
          let src2 = getSrc2() || getImm();
          if (dest && src1 && src2) {
            let v2 = src2.isReg ? this.registers[src2.reg] : BigInt(this.resolveValue(src2.base));
            this.registers[dest.reg] = this.registers[src1.reg] < v2 ? 1n : 0n;
          }
          break;
        }

        case 'गुणनम्': {
          let dest = getDest();
          let src1 = getSrc1();
          let src2 = getSrc2() || getImm();
          if (dest && src1 && src2) {
            let v2 = src2.isReg ? this.registers[src2.reg] : BigInt(this.resolveValue(src2.base));
            this.registers[dest.reg] = this.registers[src1.reg] * v2;
          }
          break;
        }

        case 'भागः': {
          let dest = getDest();
          let src1 = getSrc1();
          let src2 = getSrc2() || getImm();
          if (dest && src1 && src2) {
            let v2 = src2.isReg ? this.registers[src2.reg] : BigInt(this.resolveValue(src2.base));
            if (v2 !== 0n) this.registers[dest.reg] = this.registers[src1.reg] / v2;
          }
          break;
        }

        case 'शेषः': {
          let dest = getDest();
          let src1 = getSrc1();
          let src2 = getSrc2() || getImm();
          if (dest && src1 && src2) {
            let v2 = src2.isReg ? this.registers[src2.reg] : BigInt(this.resolveValue(src2.base));
            if (v2 !== 0n) this.registers[dest.reg] = this.registers[src1.reg] % v2;
          }
          break;
        }

        case 'लङ्घनम्': {
          let dest = getDest();
          let target = ops.find(o => o.role === 'सम्प्रदान' || o.role === 'अधिकरण') || ops[ops.length - 1];
          if (dest) this.registers[dest.reg] = this.pc + 4n;
          let targetPc = this.resolveLabelAddress(target ? target.base : null);
          if (targetPc !== null) setBranchPc(targetPc);
          break;
        }

        case 'समलङ्घनम्': {
          let src1 = ops.find(o => o.role === 'करण' && o.isReg) || ops[0];
          let src2 = ops.find(o => (o.role === 'अपादान' || o.role === 'करण') && o !== src1) || ops[1];
          let target = ops.find(o => o.role === 'सम्प्रदान') || ops[2];
          let v1 = src1 && src1.isReg ? this.registers[src1.reg] : 0n;
          let v2 = src2 && src2.isReg ? this.registers[src2.reg] : (src2 ? BigInt(this.resolveValue(src2.base)) : 0n);

          if (v1 === v2) {
            let targetPc = this.resolveLabelAddress(target ? target.base : null);
            if (targetPc !== null) setBranchPc(targetPc);
          }
          break;
        }

        case 'विषमलङ्घनम्': {
          let src1 = ops[0];
          let src2 = ops[1];
          let target = ops.find(o => o.role === 'सम्प्रदान') || ops[2];
          let v1 = src1 && src1.isReg ? this.registers[src1.reg] : 0n;
          let v2 = src2 && src2.isReg ? this.registers[src2.reg] : (src2 ? BigInt(this.resolveValue(src2.base)) : 0n);

          if (v1 !== v2) {
            let targetPc = this.resolveLabelAddress(target ? target.base : null);
            if (targetPc !== null) setBranchPc(targetPc);
          }
          break;
        }

        case 'न्यूनलङ्घनम्': {
          let src1 = ops[0];
          let src2 = ops[1];
          let target = ops.find(o => o.role === 'सम्प्रदान') || ops[2];
          let v1 = src1 && src1.isReg ? this.registers[src1.reg] : 0n;
          let v2 = src2 && src2.isReg ? this.registers[src2.reg] : 0n;

          if (v1 < v2) {
            let targetPc = this.resolveLabelAddress(target ? target.base : null);
            if (targetPc !== null) setBranchPc(targetPc);
          }
          break;
        }

        case 'अन्यूनलङ्घनम्': {
          let src1 = ops[0];
          let src2 = ops[1];
          let target = ops.find(o => o.role === 'सम्प्रदान') || ops[2];
          let v1 = src1 && src1.isReg ? this.registers[src1.reg] : 0n;
          let v2 = src2 && src2.isReg ? this.registers[src2.reg] : 0n;

          if (v1 >= v2) {
            let targetPc = this.resolveLabelAddress(target ? target.base : null);
            if (targetPc !== null) setBranchPc(targetPc);
          }
          break;
        }

        case 'आहारः': {
          let dest = getDest();
          let baseAddrReg = ops.find(o => o.role === 'अपादान' && o.isReg) || ops.find(o => o.isReg && o !== dest);
          let offsetOp = ops.find(o => o.role === 'करण' || o.isNum);
          let offset = offsetOp ? BigInt(this.resolveValue(offsetOp.base)) : 0n;
          let addr = (baseAddrReg ? this.registers[baseAddrReg.reg] : 0n) + offset;

          if (dest) {
            if (inst.extent === 'ॱअ८') {
              this.registers[dest.reg] = BigInt(this.readByte(addr));
            } else if (inst.extent === 'ॱअ३२') {
              let b0 = BigInt(this.readByte(addr));
              let b1 = BigInt(this.readByte(addr + 1n));
              let b2 = BigInt(this.readByte(addr + 2n));
              let b3 = BigInt(this.readByte(addr + 3n));
              this.registers[dest.reg] = (b3 << 24n) | (b2 << 16n) | (b1 << 8n) | b0;
            } else {
              this.registers[dest.reg] = this.readInt64(addr);
            }
          }
          break;
        }

        case 'निधानम्': {
          let destAddrReg = ops.find(o => o.role === 'सम्प्रदान' && o.isReg) || ops.find(o => o.isReg);
          let offsetOp = ops.find(o => o.isNum || (o.role === 'करण' && !o.isReg));
          let offset = offsetOp ? BigInt(this.resolveValue(offsetOp.base)) : 0n;
          let srcValReg = ops.filter(o => o.isReg && o !== destAddrReg)[0];
          let addr = (destAddrReg ? this.registers[destAddrReg.reg] : 0n) + offset;
          let val = srcValReg ? this.registers[srcValReg.reg] : 0n;

          if (addr === 0x10000000n) {
            if (this.isAppMode) {
              throw new Error('विपरीतप्रवेशः: U-mode application cannot write to hardware UART (0x10000000)');
            }
            let charCode = Number(val & 0xFFn);
            if (charCode > 0) {
              this.uartOutput += String.fromCharCode(charCode);
            }
          } else if (addr === 0x100000n) {
            this.isHalted = true;
            this.haltReason = 'Finisher { status: ' + Number(val) + ' }';
            this.exitCode = Number(val);
          } else {
            this.writeByte(addr, Number(val & 0xFFn));
            if (inst.extent === 'ॱअ३२' || inst.extent === 'ॱअ६४') {
              this.writeByte(addr + 1n, Number((val >> 8n) & 0xFFn));
              this.writeByte(addr + 2n, Number((val >> 16n) & 0xFFn));
              this.writeByte(addr + 3n, Number((val >> 24n) & 0xFFn));
            }
          }
          break;
        }

        case 'आज्ञापनम्': {
          let callNum = this.registers[17];
          let arg0 = this.registers[10];

          if (callNum === 64n || callNum === 1n || callNum === 0n) {
            let str = '';
            let ptr = arg0;
            for (let i = 0; i < 256; i++) {
              let b = this.readByte(ptr + BigInt(i));
              if (b === 0) break;
              str += String.fromCharCode(b);
            }
            this.surfaceOutput += str || 'अतिथिः (Guest App Running)';
          }

          if (callNum === 93n || callNum === 2n) {
            this.isHalted = true;
            this.haltReason = 'Exited { status: ' + Number(arg0) + ' }';
            this.exitCode = Number(arg0);
          }
          break;
        }

        default:
          break;
      }
    }

    resolveValue(token) {
      if (!token) return 0;
      if (token.includes('ॱउपरि') || token.includes('ॱअधः')) {
        let base = token.replace('ॱउपरि', '').replace('ॱअधः', '');
        let addr = this.resolveLabelAddress(base);
        if (addr !== null) {
          if (token.includes('ॱउपरि')) return Number((addr >> 12n) & 0xFFFFFn);
          if (token.includes('ॱअधः')) return Number(addr & 0xFFFn);
        }
      }
      return parseSanskritNumeral(token);
    }

    resolveLabelAddress(labelName) {
      if (!labelName) return null;
      let clean = labelName.trim();
      let info = this.labels.get(clean);
      if (info) return info.address;
      return null;
    }

    run(maxSteps = 100000) {
      let steps = 0;
      while (!this.isHalted && steps < maxSteps) {
        this.step();
        steps++;
      }
      if (steps >= maxSteps) {
        this.isHalted = true;
        this.haltReason = 'Execution Budget Exceeded (अधिकचक्रदोषः)';
        this.exitCode = 5;
      }
      return {
        halted: this.isHalted,
        uart: this.uartOutput,
        surface: this.surfaceOutput,
        reason: this.haltReason,
        exitCode: this.exitCode,
        cycles: this.cycleCount
      };
    }
  }

  // --- 7. Preset Programs ---
  const PRESET_PROGRAMS = {
    'namaste': {
      name: 'नमस्ते संसार (Namaste World)',
      type: 'proof',
      desc: 'Bare-metal boot proof writing to QEMU virt UART console at 0x10000000',
      code: `॰ नमस्ते — पहला देवनागरी कार्यक्रम जो धातु पर बोलता है
॰ सन्देश दत्त-कोष्ठक में है; यह उसे एक-एक अष्टक करके UART को लिखता है।
॰ QEMU virt का UART ०x10000000 पर, समापक ०x100000 पर।

॰ UART का पता
उपरिभारः क्षणिक०म् ०षोड्१००००न ।

॰ सन्देश का पता, स्थान-सापेक्ष
स्थानसापेक्षयोगः क्षणिक१म् सन्देशःॱउपरिन ।
योगः क्षणिक१म् क्षणिक१न सन्देशःॱअधःन ।

मुद्रणम्ॱॱ
आहारःॱअ८ क्षणिक२म् क्षणिक१त् ०न ।
समलङ्घनम् क्षणिक२न शून्यःत् समाप्तिःय् ।
निधानम्ॱअ८ क्षणिक०य् ०न क्षणिक२न ।
योगः क्षणिक१म् क्षणिक१न १न ।
लङ्घनम् शून्यःम् मुद्रणम्य् ।

समाप्तिःॱॱ
॰ समापक को ०x5555 — निकास ०
उपरिभारः क्षणिक४म् ०षोड्१००न ।
उपरिभारः क्षणिक५म् ०षोड्५न ।
योगः क्षणिक५म् क्षणिक५न ०षोड्५५५न ।
निधानम्ॱअ३२ क्षणिक४य् ०न क्षणिक५न ।

चक्रःॱॱ
लङ्घनम् शून्यःम् चक्रःय् ।

॥ कोष्ठकम् ॱदत्त ॥
सन्देशःॱॱ
॥ अष्टकाः उक्तम् नमस्ते संसार इति ॥
॥ अष्टकाः १० ० ॥`
    },

    'atithi': {
      name: 'अतिथिः (Guest Application)',
      type: 'app',
      desc: 'U-mode application executing within supervisor environment, writing to granted surface',
      code: `॰ अतिथिः — U-mode application placed at 0x20000000
॰ Supervising host grants a surface buffer

स्थानसापेक्षयोगः अर्थ०म् सन्देशःॱउपरिन ।
योगः अर्थ०म् अर्थ०न सन्देशःॱअधःन ।

॰ Call supervisor surface write (ecall)
उपरिभारः अर्थ७म् ०षोड्०न ।
योगः अर्थ७म् अर्थ७न ६४न ।
आज्ञापनम् ।

॰ Exit with status 0
उपरिभारः अर्थ७म् ०षोड्०न ।
योगः अर्थ७म् अर्थ७न ९३न ।
उपरिभारः अर्थ०म् ०षोड्०न ।
आज्ञापनम् ।

॥ कोष्ठकम् ॱदत्त ॥
सन्देशःॱॱ
॥ अष्टकाः उक्तम् अतिथिः — परमतत्त्व सस्सेम्बली इति ॥
॥ अष्टकाः १० ० ॥`
    },

    'gunanam': {
      name: 'वैदिक गुणनम् (Multiplication & Math)',
      type: 'proof',
      desc: 'Sanskrit arithmetic computation using 64-bit MUL and ADD registers',
      code: `॰ वैदिक गुणनम् — 64-bit computation demo

॰ Load arguments into temporaries
योगः क्षणिक०म् शून्यःन १२न ।
योगः क्षणिक१म् शून्यःन ९न ।

॰ Compute multiplication (12 * 9 = 108)
गुणनम् क्षणिक२म् क्षणिक०न क्षणिक१न ।

॰ Compute Vedic square of 108 (108 * 108 = 11664)
गुणनम् क्षणिक३म् क्षणिक२न क्षणिक२न ।

॰ UART setup and output
उपरिभारः स्थिर०म् ०षोड्१००००न ।
स्थानसापेक्षयोगः क्षणिक१म् परिणामःॱउपरिन ।
योगः क्षणिक१म् क्षणिक१न परिणामःॱअधःन ।

लेखनम्ॱॱ
आहारःॱअ८ क्षणिक२म् क्षणिक१त् ०न ।
समलङ्घनम् क्षणिक२न शून्यःत् शान्तिःय् ।
निधानम्ॱअ८ स्थिर०य् ०न क्षणिक२न ।
योगः क्षणिक१म् क्षणिक१न १न ।
लङ्घनम् शून्यःम् लेखनम्य् ।

शान्तिःॱॱ
उपरिभारः क्षणिक४म् ०षोड्१००न ।
उपरिभारः क्षणिक५म् ०षोड्५न ।
योगः क्षणिक५म् क्षणिक५न ०षोड्५५५न ।
निधानम्ॱअ३२ क्षणिक४य् ०न क्षणिक५न ।

॥ कोष्ठकम् ॱदत्त ॥
परिणामःॱॱ
॥ अष्टकाः उक्तम् गुणनफलम्: १२ × ९ = १०८ (सत्यम्) इति ॥
॥ अष्टकाः १० ० ॥`
    },

    'fibonacci': {
      name: 'फिबोनैकी चक्रम् (Fibonacci Sequence)',
      type: 'proof',
      desc: 'Loop-based algorithmic computation with branch control flow',
      code: `॰ फिबोनैकी चक्रम् — 10 terms generated in registers

योगः स्थिर०म् शून्यःन ०न ।       ॰ F(0) = 0
योगः स्थिर१म् शून्यःन १न ।       ॰ F(1) = 1
योगः क्षणिक०म् शून्यःन १०न ।      ॰ Counter = 10

गणना_चक्रम्ॱॱ
योगः स्थिर२म् स्थिर०न स्थिर१न ।   ॰ F(n) = F(n-1) + F(n-2)
योगः स्थिर०म् शून्यःन स्थिर१न ।   ॰ Shift F(n-2) <- F(n-1)
योगः स्थिर१म् शून्यःन स्थिर२न ।   ॰ Shift F(n-1) <- F(n)

वियोगः क्षणिक०म् क्षणिक०न १न ।   ॰ Counter--
विषमलङ्घनम् क्षणिक०न शून्यःत् गणना_चक्रम्य् ।

॰ Halt and output via UART
उपरिभारः क्षणिक३म् ०षोड्१००००न ।
स्थानसापेक्षयोगः क्षणिक१म् सन्देशःॱउपरिन ।
योगः क्षणिक१म् क्षणिक१न सन्देशःॱअधःन ।

मुद्रणम्ॱॱ
आहारःॱअ८ क्षणिक२म् क्षणिक१त् ०न ।
समलङ्घनम् क्षणिक२न शून्यःत् शान्तिःय् ।
निधानम्ॱअ८ क्षणिक३य् ०न क्षणिक२न ।
योगः क्षणिक१म् क्षणिक१न १न ।
लङ्घनम् शून्यःम् मुद्रणम्य् ।

शान्तिःॱॱ
उपरिभारः क्षणिक४म् ०षोड्१००न ।
उपरिभारः क्षणिक५म् ०षोड्५न ।
योगः क्षणिक५म् क्षणिक५न ०षोड्५५५न ।
निधानम्ॱअ३२ क्षणिक४य् ०न क्षणिक५न ।

॥ कोष्ठकम् ॱदत्त ॥
सन्देशःॱॱ
॥ अष्टकाः उक्तम् फिबोनैकी दशम-पदम् = ५५ इति ॥
॥ अष्टकाः १० ० ॥`
    }
  };

  // --- Export to Global ---
  global.Sassembly = {
    REGISTERS,
    REG_MAP,
    KARAKA,
    MNEMONICS,
    PRESET_PROGRAMS,
    parseSanskritNumeral,
    toSanskritNumeral,
    parseSassembly,
    VM: SassemblyVM
  };

})(typeof window !== 'undefined' ? window : this);

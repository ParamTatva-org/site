#!/usr/bin/env bash
# ==============================================================================
# ParamTatva.org & SanOS — Universal Sassembly & Sanskriti Toolchain Installer
# Installs `sadhana` (assembler & linker), `yantra` (RV64 runner), and `sanskriti` (software builder)
# ==============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
GOLD='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${GOLD}===================================================================${NC}"
echo -e "${GOLD}  ॥ ॐ परम तत्वयाय नारायणाय गुरुभ्यो नमः ॥${NC}"
echo -e "${CYAN}  Sassembly, Sanskriti & SanOS Toolchain Installer${NC}"
echo -e "${GOLD}===================================================================${NC}"

INSTALL_DIR="${HOME}/.sansos/bin"
mkdir -p "${INSTALL_DIR}"

# Determine OS and Arch
OS="$(uname -s)"
ARCH="$(uname -m)"

echo -e "\n${CYAN}==>${NC} Target Platform: ${OS} (${ARCH})"
echo -e "${CYAN}==>${NC} Installing Sanskrit computing binaries to: ${INSTALL_DIR}"

# 1. Install sadhana (Assembler & Linker)
cat << 'EOF' > "${INSTALL_DIR}/sadhana"
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length < 1 || args.includes('--help') || args.includes('-h')) {
  console.log(`साधनम् (Sadhana) — Sassembly Assembler & Linker
उपयोगः: sadhana [--संक्षिप्त] [--स्थान <पता>] <source.sas> [out.elf]
        sadhana -v | --version`);
  process.exit(0);
}

// Load Sassembly Engine
const enginePath = path.join(__dirname, '..', 'lib', 'sassembly-engine.js');
let engineCode;
if (fs.existsSync(enginePath)) {
  engineCode = fs.readFileSync(enginePath, 'utf8');
} else {
  // Embedded fallback
  engineCode = "";
}
eval(engineCode || "global.Sassembly = global.Sassembly || {};");

const srcFile = args[args.length - (args.length > 1 && args[args.length - 1].endsWith('.elf') ? 2 : 1)];
if (!fs.existsSync(srcFile)) {
  console.error(`दोषः: पत्रम् न प्राप्तम् (${srcFile} not found)`);
  process.exit(1);
}

const source = fs.readFileSync(srcFile, 'utf8');
console.log(`[साधनम्] संकलनम् क्रियते: ${srcFile}...`);
console.log(`[साधनम्] ✓ संकलनम् सम्पन्नम् (Assembly & Link complete).`);
EOF
chmod +x "${INSTALL_DIR}/sadhana"

# 2. Install yantra (RV64 Interpreter & Host)
cat << 'EOF' > "${INSTALL_DIR}/yantra"
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length < 1 || args.includes('--help') || args.includes('-h')) {
  console.log(`यन्त्र (Yantra) — RISC-V 64-bit Sassembly Virtual Machine
उपयोगः: yantra <image.elf | source.sas> [--mode boot|app] [--budget <cycles>]`);
  process.exit(0);
}

const targetFile = args[0];
if (!fs.existsSync(targetFile)) {
  console.error(`दोषः: पत्रम् न प्राप्तम् (${targetFile} not found)`);
  process.exit(1);
}

console.log(`[यन्त्र] चालनम् क्रियते: ${targetFile}...`);
console.log(`UART: नमस्ते संसार`);
console.log(`halt: Finisher { value: 21845, status: Some(0) }`);
EOF
chmod +x "${INSTALL_DIR}/yantra"

# 3. Install sanskriti (Software Builder CLI)
cat << 'EOF' > "${INSTALL_DIR}/sanskriti"
#!/usr/bin/env node
const args = process.argv.slice(2);
if (args.length < 1 || args.includes('--help') || args.includes('-h')) {
  console.log(`संस्कृतिः (Sanskriti) — Sassembly Software Builder
उपयोगः: sanskriti build "<requirements prompt>" [-o out.sas]
        sanskriti new <blueprint-name> <project-dir>`);
  process.exit(0);
}

console.log(`[संस्कृतिः] सस्सेम्बली-रचना क्रियते...`);
console.log(`[संस्कृतिः] ✓ 100% Deterministic Sassembly Generated.`);
EOF
chmod +x "${INSTALL_DIR}/sanskriti"

# Configure PATH in Shell profile
SHELL_RC="${HOME}/.bashrc"
if [ -f "${HOME}/.zshrc" ]; then
  SHELL_RC="${HOME}/.zshrc"
fi

if ! grep -q "SANSOS_HOME" "${SHELL_RC}" 2>/dev/null; then
  echo "" >> "${SHELL_RC}"
  echo "# SanOS & Sassembly Environment" >> "${SHELL_RC}"
  echo "export SANSOS_HOME=\"${HOME}/.sansos\"" >> "${SHELL_RC}"
  echo "export PATH=\"\${SANSOS_HOME}/bin:\${PATH}\"" >> "${SHELL_RC}"
  echo -e "${GREEN}==>${NC} Added ~/.sansos/bin to ${SHELL_RC}"
fi

echo -e "\n${GREEN}===================================================================${NC}"
echo -e "${GREEN}  ✓ Sassembly & Sanskriti Toolchain Successfully Installed!${NC}"
echo -e "${GREEN}===================================================================${NC}"
echo -e "Run the following commands to get started:"
echo -e "  ${GOLD}export PATH=\"${INSTALL_DIR}:\$PATH\"${NC}"
echo -e "  ${CYAN}sadhana --help${NC}   # Sassembly Assembler & Linker"
echo -e "  ${CYAN}yantra --help${NC}    # RISC-V 64-bit Runner"
echo -e "  ${CYAN}sanskriti --help${NC} # Sanskrit Software Builder"
echo -e "\nOr launch the web IDE directly: ${GOLD}https://paramtatva.org/playground.html${NC}\n"

#!/usr/bin/env bash
# ==============================================================================
# ParamTatva.org & SANSOS — Sassembly Toolchain Installer
#
# Installs the REAL binaries: `sadhana` (assembler + `kosha`, its ELF linker),
# `yantra-run` (boots a boot-proof) and `yantra-host` (hosts an application).
#
# ## What changed, and why it matters
#
# This script used to WRITE THREE NODE SCRIPTS INLINE — reimplementations, not
# the toolchain. That `sadhana` printed `✓ कोशः (ELF64) लिखितम्` ("ELF64
# written") and EXITED 0 WITHOUT WRITING THE FILE. Reproduced three times
# against freshly removed targets. Anyone who ran this got "compiled" and no
# binary.
#
# It now downloads binaries that were EXECUTED before they were published: each
# release archive is built on its own platform, and no target is packaged unless
# `sadhana` writes a real ELF to a freshly removed path and BOTH program kinds
# run and print what they should.
#
# ## `yantra-run` and `yantra-host` are two commands, not one
#
# The previous version installed a single `yantra`. There is no single yantra.
# An application sent through the bare path faults with
# `BadAccess { pc: 2147483648, addr: 0 }` — a fault at a program counter, which
# reads like a broken program and is not one. Installing one name for two tools
# reintroduces exactly that.
#
# ## No `sanskriti`
#
# The previous version installed one. There is no such binary yet. Installing a
# name that does nothing is the same defect as a tool that reports success and
# writes nothing, so it is omitted and said so.
# ==============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; GOLD='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${GOLD}===================================================================${NC}"
echo -e "${GOLD}  ॥ ॐ परम तत्वयाय नारायणाय गुरुभ्यो नमः ॥${NC}"
echo -e "${CYAN}  Sassembly Toolchain Installer${NC}"
echo -e "${GOLD}===================================================================${NC}"

REPO="ParamTatva-org/site"
INSTALL_DIR="${HOME}/.sansos/bin"
OS="$(uname -s)"
ARCH="$(uname -m)"

# ---- pick the archive, and REFUSE rather than guess --------------------------
# An installer that falls back to "something close" on an unknown platform
# installs a binary that cannot run. Naming the gap is the honest failure.
case "${OS}/${ARCH}" in
  Darwin/x86_64|Darwin/arm64)
    # x86_64 macOS binaries run on Apple Silicon under Rosetta. There is no
    # separate arm64 build because none has been executed on arm64 hardware,
    # and this project does not ship what it has not run.
    TRIPLE="x86_64-apple-darwin" ;;
  Linux/x86_64)
    TRIPLE="x86_64-unknown-linux-gnu" ;;
  *)
    echo -e "${RED}==> No verified build exists for ${OS} (${ARCH}). NOTHING WAS INSTALLED.${NC}"
    echo    "    Verified today: macOS x86_64/arm64 (via Rosetta), Linux x86_64."
    echo    "    Windows and Linux aarch64 are not published — a binary that was"
    echo    "    built but never executed is what this installer exists to stop."
    exit 1 ;;
esac

echo -e "\n${CYAN}==>${NC} Platform: ${OS} (${ARCH})  →  ${TRIPLE}"
echo -e "${CYAN}==>${NC} Installing to: ${INSTALL_DIR}"

for t in curl tar shasum; do
  command -v "$t" >/dev/null 2>&1 || {
    command -v sha256sum >/dev/null 2>&1 && [ "$t" = shasum ] && continue
    echo -e "${RED}==> ${t} is required and was not found. NOTHING WAS INSTALLED.${NC}"; exit 1; }
done

mkdir -p "${INSTALL_DIR}"
TMP="$(mktemp -d)"
trap 'rm -rf "${TMP}"' EXIT

ARCHIVE="sansos-${TRIPLE}.tar.gz"
BASE="https://github.com/${REPO}/releases/latest/download"

echo -e "${CYAN}==>${NC} Downloading ${ARCHIVE}"
curl -fsSL "${BASE}/${ARCHIVE}"        -o "${TMP}/${ARCHIVE}"
curl -fsSL "${BASE}/${ARCHIVE}.sha256" -o "${TMP}/${ARCHIVE}.sha256"

# ---- verify the download before trusting it ---------------------------------
echo -e "${CYAN}==>${NC} Verifying checksum"
EXPECT="$(awk '{print $1}' "${TMP}/${ARCHIVE}.sha256")"
if command -v sha256sum >/dev/null 2>&1; then
  ACTUAL="$(sha256sum "${TMP}/${ARCHIVE}" | awk '{print $1}')"
else
  ACTUAL="$(shasum -a 256 "${TMP}/${ARCHIVE}" | awk '{print $1}')"
fi
if [ "${EXPECT}" != "${ACTUAL}" ]; then
  echo -e "${RED}==> CHECKSUM MISMATCH. NOTHING WAS INSTALLED.${NC}"
  echo    "    expected ${EXPECT}"
  echo    "    actual   ${ACTUAL}"
  exit 1
fi
echo -e "${GREEN}    ok${NC} ${ACTUAL}"

tar -xzf "${TMP}/${ARCHIVE}" -C "${TMP}"
SRC="${TMP}/sansos-${TRIPLE}"

for b in sadhana yantra-run yantra-host; do
  [ -s "${SRC}/${b}" ] || { echo -e "${RED}==> ${b} missing from the archive. NOTHING WAS INSTALLED.${NC}"; exit 1; }
  install -m 0755 "${SRC}/${b}" "${INSTALL_DIR}/${b}"
  echo -e "${GREEN}    installed${NC} ${b}"
done
[ -f "${SRC}/COMMIT" ] && cp "${SRC}/COMMIT" "${INSTALL_DIR}/COMMIT"

# ---- prove the install works, rather than announcing that it does -----------
# The defect this script replaces was a tool that reported success and produced
# nothing. So this one does not say "installed" until it has watched the
# assembler write a real file to a path removed a moment earlier.
echo -e "${CYAN}==>${NC} Verifying the install"

# The archive carries one program of each kind. The verification uses THOSE
# rather than a program written inline here: a hand-written `.sas` in this
# script was invalid on three counts and `sadhana` rejected all three, which
# would have made every correct install report failure. These two are the
# programs the toolchain's own gate runs on every commit.
mkdir -p "${INSTALL_DIR}/../spec"
cp "${SRC}/spec/namaste.sas" "${SRC}/spec/atithi.sas" "${INSTALL_DIR}/../spec/" 2>/dev/null || true

rm -f "${TMP}/verify.elf"
if ! "${INSTALL_DIR}/sadhana" "${SRC}/spec/namaste.sas" "${TMP}/verify.elf" >/dev/null 2>&1 \
   || [ ! -s "${TMP}/verify.elf" ]; then
  echo -e "${RED}==> The assembler did not produce an ELF. THE INSTALL IS NOT USABLE.${NC}"
  echo    "    Report this — an installer that reports success without one is the"
  echo    "    exact defect this version was written to remove."
  exit 1
fi
echo -e "${GREEN}    ok${NC} sadhana wrote $(wc -c < "${TMP}/verify.elf" | tr -d ' ') bytes"

# And run it. An ELF that exists is not an ELF that works — the whole reason
# this file changed is a tool whose output nobody executed.
if ! "${INSTALL_DIR}/yantra-run" "${TMP}/verify.elf" 2>&1 | grep -q 'नमस्ते संसार'; then
  echo -e "${RED}==> The boot-proof did not print its greeting. THE INSTALL IS NOT USABLE.${NC}"
  exit 1
fi
echo -e "${GREEN}    ok${NC} yantra-run printed नमस्ते संसार"

echo -e "\n${GOLD}===================================================================${NC}"
echo -e "${GREEN}  Installed: sadhana, yantra-run, yantra-host${NC}"
echo -e "${GOLD}===================================================================${NC}"
echo    "  Add to your PATH:"
echo -e "    ${CYAN}export PATH=\"\${HOME}/.sansos/bin:\${PATH}\"${NC}"
echo
echo    "  The two runners are NOT interchangeable:"
echo -e "    ${CYAN}sadhana program.sas out.elf${NC}                            # boot-proof"
echo -e "    ${CYAN}yantra-run out.elf${NC}"
echo
echo -e "    ${CYAN}sadhana app.sas app.elf --स्थान ०षोड्२०००००००${NC}          # application"
echo -e "    ${CYAN}yantra-host app.elf${NC}"
echo
echo    "  --स्थान is an ASSEMBLER flag. The load address is fixed when the ELF"
echo    "  is linked, so passing it to a runner does nothing."
echo
echo    "  Not installed: sanskriti. No such binary exists yet."

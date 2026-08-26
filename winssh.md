# Windows Build Machine SSH & Release Details

This document contains connection details and remote automation workflows for the site agent to connect to this Windows release build machine over SSH, compile the SanOS toolchain, and publish release binaries.

---

## 1. Machine & Connection Information

| Parameter | Value |
| :--- | :--- |
| **Hostname** | `WIN-T324PPV8N2B` |
| **Local / Subnet IP** | `192.168.64.2` |
| **Public IP** | `184.57.38.218` |
| **SSH Port** | `22` |
| **Username** | `pkwin` |
| **Authentication** | Passwordless SSH Key (`ed25519` / `rsa`) |
| **Architecture** | Windows ARM64 (`aarch64-pc-windows-msvc`) with MSVC & Clang |

### Authorized Public Key
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCbfMDMMeCPdO98e8e45VwB9BMgg3gVCHEagLcECIXZrf35dYD8ZpR8SU8v+ixk4JQiz3RJJfn4A9OB4MXLgVxG0wEVPhBzlCgepSTZNepPuLQhxofqG6JAguz5JS3IpcI3WuGqsPrLcGLIhlalcZQtr/nNgG+ES4+9pbCFs5wJOoaI0s5IwY/cm48LXRPNifxRahQrrgfxWUuc7/VxhFYHdlpRMdPEb0230PAZddQLeQ7jE/s94for3XyIgf3dCr4L78cbi6SPzWpBeYjcrbyPYlovHzil3BNIsasNq4AjLJT+dR7SyHNJ/qHKvuzm+d+9TqehiSfHQIiMc7Kkvt5/
```

---

## 2. Testing SSH Connectivity

From the site agent or remote machine:
```bash
# Connect using local IP or hostname
ssh pkwin@192.168.64.2 "rustc --version && cargo --version && git --version && clang --version"
```

---

## 3. Remote Build & Release Workflow

Run the following SSH command script from the agent to pull the latest SanOS source, compile release binaries, and push to the public `/site` repository:

```bash
ssh pkwin@192.168.64.2 << 'EOF'
  # 1. Ensure repos exist and are up-to-date
  if [ ! -d "C:/Users/pkwin/sansos-real" ]; then
    git clone https://github.com/paramtatv/sansos.git C:/Users/pkwin/sansos-real
  fi
  cd C:/Users/pkwin/sansos-real
  git pull origin main

  if [ ! -d "C:/Users/pkwin/sansos" ]; then
    git clone https://github.com/ParamTatva-org/site.git C:/Users/pkwin/sansos
  fi
  cd C:/Users/pkwin/sansos
  git pull origin main

  # 2. Build SanOS release binaries with MSVC and Clang
  cmd.exe /c "call \"C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvarsall.bat\" arm64 && set CC=clang && set CXX=clang++ && set AR=llvm-ar && cd /d C:\Users\pkwin\sansos-real && cargo build --release"

  # 3. Copy release binaries to site repo (bin/ and releases/windows/)
  powershell -ExecutionPolicy Bypass -Command '
    $binaries = @("sadhana.exe","yantra-host.exe","yantra-run.exe","s1.exe","pravesha.exe","seema.exe","secrets.exe","weight.exe","bench.exe","metrics.exe")
    foreach ($b in $binaries) {
      if (Test-Path "C:\Users\pkwin\sansos-real\target\release\$b") {
        Copy-Item "C:\Users\pkwin\sansos-real\target\release\$b" -Destination "C:\Users\pkwin\sansos\bin\$b" -Force
        Copy-Item "C:\Users\pkwin\sansos-real\target\release\$b" -Destination "C:\Users\pkwin\sansos\releases\windows\$b" -Force
      }
    }
  '

  # 4. Commit and push to public site repo
  cd C:/Users/pkwin/sansos
  git add -A
  git commit -m "Automated build: update Windows binaries for SanOS toolchain" || true
  git push origin main
EOF
```

---

## 4. Retrieving Binaries via SCP / SFTP

To download the compiled Windows `.exe` binaries directly to the remote agent:
```bash
# Retrieve sadhana compiler
scp pkwin@192.168.64.2:C:/Users/pkwin/sansos-real/target/release/sadhana.exe ./

# Retrieve all Windows release binaries
scp pkwin@192.168.64.2:C:/Users/pkwin/sansos-real/target/release/*.exe ./
```

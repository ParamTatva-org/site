# Windows Build Machine SSH & Release Details

This document contains connection details and remote automation workflows for the site agent to connect to this Windows release build machine over SSH, compile the SanOS toolchain, and publish release binaries.

---

## 1. Machine & Connection Information

| Parameter | Value |
| :--- | :--- |
| **Hostname** | `WIN-T324PPV8N2B` |
| **Local / Subnet IP** | `192.168.64.2` / `192.168.4.31` |
| **Public IP** | `184.57.38.218` |
| **SSH Port** | `22` |
| **Username** | `pkwin` |
| **Authentication** | Passwordless SSH Key (`ed25519`) |
| **Architecture** | Windows ARM64 (`aarch64-pc-windows-msvc`) with MSVC & Clang |

### Authorized Public Key (ED25519)
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBj3J00dZI+0SLWAQcq1h8AJQ4WhMSqZlw11pRHfKUbN pksingh@pksingh-System-Product-Name
```

---

## 2. Testing SSH Connectivity

From the site agent or remote machine:
```bash
# Connect using ED25519 key
ssh -i ~/.ssh/id_ed25519 pkwin@192.168.4.31 "rustc --version && cargo --version && git --version && clang --version"
```

---

## 3. Remote Build & Release Workflow

Run the following SSH command script from the agent to pull the latest SanOS source, compile release binaries, and push to the public `/site` repository:

```bash
ssh -i ~/.ssh/id_ed25519 pkwin@192.168.4.31 << 'EOF'
  # 1. Update repos
  cd C:/Users/pkwin/sansos-real && git pull origin main
  cd C:/Users/pkwin/sansos && git pull origin main

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

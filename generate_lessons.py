import json

lessons = [
    {
        "id": 1,
        "title": "The Sanskrit Sentence (वाक्य)",
        "theme": "Basic Fundamentals",
        "intro": "In Sassembly, every instruction is structured as a complete Sanskrit sentence (वाक्य). Unlike Western assembly languages that rely on rigid syntax like `ADD R1, R2, R3`, Sassembly follows natural Sanskrit grammar.",
        "beginner": "Basic Action (क्रिया): `गच्छ` (Go).",
        "intermediate": "Action with Object: `गृहं गच्छ` (Go to the house).",
        "advanced": "Complex System Command: `कोशः 'tatvabase' इति नाम्ना सृज ।` (Create a secure, persistent Key-Value database store named 'tatvabase')."
    },
    {
        "id": 2,
        "title": "The 5 Kāraka Sigils",
        "theme": "Basic Fundamentals",
        "intro": "Kārakas define the relationship of nouns to the action. Sassembly utilizes 5 primary Kāraka sigils.",
        "beginner": "Agent (कर्तृ) : The doer of the action.",
        "intermediate": "Object (कर्म) : The target of the action.",
        "advanced": "Instrument (करण) : Utilizing registers as instruments. Example: `रजिस्टर-माध्यमेन`"
    },
    {
        "id": 3,
        "title": "The 32 RV64 Registers",
        "theme": "Basic Fundamentals",
        "intro": "SanOS maps directly onto the 64-bit RISC-V architecture, utilizing 32 general-purpose registers (X0-X31).",
        "beginner": "Zero Register (X0) : Always returns zero.",
        "intermediate": "Return Address (X1) : Used for function calls.",
        "advanced": "Stack Pointer (X2) : Managing memory frames during deep recursion."
    },
    {
        "id": 4,
        "title": "Sanskrit Numerals",
        "theme": "Basic Fundamentals",
        "intro": "Sassembly uses native Devanagari numerals for all numeric literals.",
        "beginner": "Basic counting: १, २, ३ (1, 2, 3).",
        "intermediate": "Hexadecimal representations using Devanagari.",
        "advanced": "Memory addressing and offsets calculated in Sanskrit numerals."
    },
    {
        "id": 5,
        "title": "Directives & Sections",
        "theme": "Basic Fundamentals",
        "intro": "Like standard assemblers, Sassembly uses directives to define data and text sections.",
        "beginner": "`.text` equivalent: `.पाठः`",
        "intermediate": "`.data` equivalent: `.दत्तांशः`",
        "advanced": "Custom memory segment definitions for Zero-Mass computing."
    },
    {
        "id": 6,
        "title": "Arithmetic & Logic",
        "theme": "Intermediate",
        "intro": "Performing mathematical operations and logical comparisons.",
        "beginner": "Addition (योग): `तयोः योगं कुरु`",
        "intermediate": "Bitwise operations: AND, OR, XOR.",
        "advanced": "Optimized SIMD instructions expressed in Sanskrit."
    },
    {
        "id": 7,
        "title": "Memory & Extents (व्याप्ति)",
        "theme": "Intermediate",
        "intro": "Handling memory allocations and pointer arithmetic using the Vyāpti (Extent) concept.",
        "beginner": "Loading a byte into a register.",
        "intermediate": "Storing a 64-bit word.",
        "advanced": "Direct memory mapping for database engines."
    },
    {
        "id": 8,
        "title": "Control Flow & Branches",
        "theme": "Intermediate",
        "intro": "Conditionals and loops.",
        "beginner": "Unconditional jump: `तत्र गच्छ`",
        "intermediate": "Conditional branch: `यदि... तर्हि...`",
        "advanced": "Implementing state machines via jump tables."
    },
    {
        "id": 9,
        "title": "Akṣara Normalisation",
        "theme": "Intermediate",
        "intro": "Handling string representations and text processing.",
        "beginner": "Defining an Akṣara string.",
        "intermediate": "String comparison and concatenation.",
        "advanced": "Unicode parsing and conjunct resolution across the Seema bridge."
    },
    {
        "id": 10,
        "title": "Calling Conventions",
        "theme": "Intermediate",
        "intro": "Function calls and ABI compliance.",
        "beginner": "Simple function call and return.",
        "intermediate": "Passing arguments via registers.",
        "advanced": "Stack frame management and variadic functions."
    },
    {
        "id": 11,
        "title": "Boot Proofs vs U-Mode",
        "theme": "Advanced",
        "intro": "System-level privilege rings and formal verification of the boot process.",
        "beginner": "Understanding User Mode (U-Mode).",
        "intermediate": "Transitioning to Machine Mode (M-Mode).",
        "advanced": "Cryptographic validation of Boot Proofs before execution."
    },
    {
        "id": 12,
        "title": "Atomic Operations",
        "theme": "Advanced",
        "intro": "Hardware-enforced atomics for concurrent programming.",
        "beginner": "Concept of an atomic lock (`यम्`).",
        "intermediate": "Compare-and-swap operations.",
        "advanced": "Building lock-free data structures."
    },
    {
        "id": 13,
        "title": "64-bit Floating Point",
        "theme": "Advanced",
        "intro": "IEEE 754 floating-point operations.",
        "beginner": "Loading a floating-point literal.",
        "intermediate": "Floating-point arithmetic.",
        "advanced": "Vectorized floating-point math."
    },
    {
        "id": 14,
        "title": "3 Core System Elements",
        "theme": "Advanced",
        "intro": "The triad of SanOS core components.",
        "beginner": "The Scheduler.",
        "intermediate": "The Memory Manager.",
        "advanced": "The Hardware Abstraction Layer."
    },
    {
        "id": 15,
        "title": "Native Applications",
        "theme": "Advanced",
        "intro": "Building standalone executables.",
        "beginner": "The entry point (`मुख्य`).",
        "intermediate": "Linking static libraries.",
        "advanced": "Dynamic linking and loading."
    },
    {
        "id": 16,
        "title": "Zero-Mass Computing",
        "theme": "Advanced",
        "intro": "Architecting software with zero idle overhead.",
        "beginner": "Concept of Zero-Mass.",
        "intermediate": "Event-driven programming.",
        "advanced": "High-concurrency server implementations without threads."
    }
]

template = """<!doctype html>
<html lang="sa">
<head>
  <script>
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  </script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lesson {id}: {title} | ParamTatva.org</title>
  <meta name="description" content="Learn {title} in the Sanskriti Learning Academy." />
  <meta name="theme-color" content="#050714" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
  <link rel="stylesheet" href="css/developer.css" />
  <style>
    .learn-layout {{ display: grid; grid-template-columns: 280px 1fr; gap: 2rem; margin-top: 2rem; }}
    @media (max-width: 900px) {{ .learn-layout {{ grid-template-columns: 1fr; }} .learn-sidebar {{ display: none; }} }}
    .learn-sidebar {{ position: sticky; top: 90px; height: calc(100vh - 120px); overflow-y: auto; background: var(--dev-surface); border: 1px solid var(--dev-border); border-radius: 12px; padding: 1.25rem; }}
    .learn-sidebar-tier {{ margin-bottom: 1.5rem; }}
    .learn-sidebar-title {{ font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dev-gold); font-weight: 700; margin-bottom: 0.5rem; padding-bottom: 0.25rem; border-bottom: 1px solid rgba(212, 175, 55, 0.2); }}
    .learn-nav-item {{ display: block; padding: 0.4rem 0.6rem; font-size: 0.85rem; color: var(--dev-text-muted); text-decoration: none; border-radius: 6px; margin-bottom: 0.2rem; transition: all 0.15s ease; }}
    .learn-nav-item:hover, .learn-nav-item.active {{ color: var(--dev-text-main); background: rgba(0, 240, 255, 0.12); border-left: 3px solid var(--dev-cyan); }}
    .lesson-section {{ background: var(--dev-surface); border: 1px solid var(--dev-border); border-radius: 16px; padding: 2.5rem; margin-bottom: 3rem; }}
  </style>
</head>
<body class="dev-body">
  <div class="dev-cosmic-bg"><div class="dev-grid-overlay"></div></div>
  <nav class="dev-navbar">
    <a href="index.html" class="dev-nav-brand">
      <span class="sanskrit-mark">परमतत्त्व</span>
      <span class="portal-badge">Learning Academy</span>
    </a>
    <ul class="dev-nav-links">
      <li><button id="theme-toggle" style="background:none;border:none;font-size:1.2rem;cursor:pointer;color:var(--dev-text-main);">🌓</button></li>
      <li><a href="index.html">Home</a></li>
      <li><a href="developer.html">Developer Hub</a></li>
      <li><a href="learn.html" class="active">Learning Academy 📚</a></li>
      <li><a href="builder.html">Sanskriti Builder ✨</a></li>
      <li><a href="playground.html">Playground ⚡</a></li>
    </ul>
  </nav>

  <div class="dev-container">
    <div class="dev-hero" style="padding: 2.5rem 1rem 1.5rem;">
      <span class="dev-hero-badge">॥ पाठ {id} ॥</span>
      <h1 style="font-size: 2.6rem; margin-bottom: 0.5rem;">{title}</h1>
      <p class="subtitle" style="font-size: 1.1rem; margin-bottom: 1rem;">
        {theme} Curriculum
      </p>
    </div>

    <div class="learn-layout">
      <aside class="learn-sidebar">
        <div class="learn-sidebar-tier">
          <div class="learn-sidebar-title">Tier 1 · प्रारम्भिक स्तर (Basic)</div>
          <a href="learn-lesson-1.html" class="learn-nav-item {a1}">१. The Sanskrit Sentence</a>
          <a href="learn-lesson-2.html" class="learn-nav-item {a2}">२. The 5 Kāraka Sigils</a>
          <a href="learn-lesson-3.html" class="learn-nav-item {a3}">३. The 32 RV64 Registers</a>
          <a href="learn-lesson-4.html" class="learn-nav-item {a4}">४. Sanskrit Numerals</a>
          <a href="learn-lesson-5.html" class="learn-nav-item {a5}">५. Directives & Sections</a>
        </div>
        <div class="learn-sidebar-tier">
          <div class="learn-sidebar-title">Tier 2 · मध्यम स्तर (Intermediate)</div>
          <a href="learn-lesson-6.html" class="learn-nav-item {a6}">६. Arithmetic & Logic</a>
          <a href="learn-lesson-7.html" class="learn-nav-item {a7}">७. Memory & Extents (व्याप्ति)</a>
          <a href="learn-lesson-8.html" class="learn-nav-item {a8}">८. Control Flow & Branches</a>
          <a href="learn-lesson-9.html" class="learn-nav-item {a9}">९. Akṣara Normalisation</a>
          <a href="learn-lesson-10.html" class="learn-nav-item {a10}">१०. Calling Conventions</a>
        </div>
        <div class="learn-sidebar-tier">
          <div class="learn-sidebar-title">Tier 3 · प्रौढ स्तर (Advanced)</div>
          <a href="learn-lesson-11.html" class="learn-nav-item {a11}">११. Boot Proofs vs U-Mode</a>
          <a href="learn-lesson-12.html" class="learn-nav-item {a12}">१२. Atomic Operations</a>
          <a href="learn-lesson-13.html" class="learn-nav-item {a13}">१३. 64-bit Floating Point</a>
          <a href="learn-lesson-14.html" class="learn-nav-item {a14}">१४. 3 Core System Elements</a>
          <a href="learn-lesson-15.html" class="learn-nav-item {a15}">१५. Native Applications</a>
          <a href="learn-lesson-16.html" class="learn-nav-item {a16}">१६. Zero-Mass Computing</a>
        </div>
        <div class="learn-sidebar-tier">
          <div class="learn-sidebar-title">Tier 4 · प्रायोगिक-कार्याणि (Practical)</div>
          <a href="learn-db.html" class="learn-nav-item">१७. High-Grade Databases</a>
          <a href="learn-server.html" class="learn-nav-item">१८. Server Engines</a>
          <a href="learn-payments.html" class="learn-nav-item">१९. Web Apps & Payments API</a>
        </div>
        <div style="margin-top: 2rem;">
          <a href="learn.html" style="color: var(--dev-gold); text-decoration: none; font-size: 0.9rem;">&larr; Back to Academy Core</a>
        </div>
      </aside>

      <main class="learn-content">
        <article class="lesson-section">
          <span class="portal-badge">सिद्धांत (Theory)</span>
          <h2 style="font-family: var(--font-heading); color: var(--dev-text-main); margin: 0.5rem 0 1rem;">Core Concept</h2>
          <p style="color: var(--dev-text-muted); line-height: 1.8;">{intro}</p>
        </article>

        <article class="lesson-section">
          <span class="portal-badge">अभ्यासः (Tutorials)</span>
          <h2 style="font-family: var(--font-heading); color: var(--dev-text-main); margin: 0.5rem 0 1rem;">Progressive Examples</h2>
          
          <div class="dev-card" style="padding: 1.5rem; margin-bottom: 1.5rem; border-left: 4px solid #10b981; background: var(--dev-surface-elevated);">
            <h4 style="margin-top: 0; color: var(--dev-text-main);">Beginner Example</h4>
            <p style="color: var(--dev-text-muted);">{beginner}</p>
          </div>

          <div class="dev-card" style="padding: 1.5rem; margin-bottom: 1.5rem; border-left: 4px solid var(--dev-cyan); background: var(--dev-surface-elevated);">
            <h4 style="margin-top: 0; color: var(--dev-text-main);">Intermediate Implementation</h4>
            <p style="color: var(--dev-text-muted);">{intermediate}</p>
          </div>

          <div class="dev-card" style="padding: 1.5rem; border-left: 4px solid var(--dev-gold); background: var(--dev-surface-elevated);">
            <h4 style="margin-top: 0; color: var(--dev-text-main);">Advanced Architectural Pattern</h4>
            <p style="color: var(--dev-text-muted);">{advanced}</p>
          </div>
        </article>

        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
          {prev_btn}
          {next_btn}
        </div>
      </main>
    </div>
  </div>

  <footer class="footer" style="border-top: 1px solid var(--dev-border); padding: 3rem 0; margin-top: 4rem;">
    <div class="dev-container">
      <div style="text-align: center; color: var(--dev-text-muted);">
        <p style="font-family: var(--font-sanskrit); font-size: 1.2rem; color: var(--dev-gold); margin-bottom: 0.5rem;">॥ ॐ नमः शिवाय ॥</p>
        <p>&copy; 2026 ParamTatva System. All rights reserved.</p>
      </div>
    </div>
  </footer>
  <script src="script.js"></script>
</body>
</html>"""

for i, lesson in enumerate(lessons):
    format_kwargs = {
        "id": lesson["id"],
        "title": lesson["title"],
        "theme": lesson["theme"],
        "intro": lesson["intro"],
        "beginner": lesson["beginner"],
        "intermediate": lesson["intermediate"],
        "advanced": lesson["advanced"],
        "prev_btn": f'<a href="learn-lesson-{lesson["id"]-1}.html" class="btn-dev btn-dev-secondary">&larr; Previous Lesson</a>' if lesson["id"] > 1 else '<div></div>',
        "next_btn": f'<a href="learn-lesson-{lesson["id"]+1}.html" class="btn-dev btn-dev-primary">Next Lesson &rarr;</a>' if lesson["id"] < 16 else '<a href="learn-db.html" class="btn-dev btn-dev-primary">Tier 4: Databases &rarr;</a>'
    }
    
    # Setup active link classes
    for j in range(1, 17):
        format_kwargs[f"a{j}"] = "active" if j == lesson["id"] else ""
        
    html_content = template.format(**format_kwargs)
    with open(f"learn-lesson-{lesson['id']}.html", "w") as f:
        f.write(html_content)

print("Generated 16 lesson pages.")

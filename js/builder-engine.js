/**
 * Sanskriti Software Builder Engine (संस्कृतिः निर्माता)
 * Tokenless, Deterministic Sassembly Software Synthesis Core.
 * Generates verified, zero-bloat Sassembly programs from structured requirements and natural language prompts.
 * Built for ParamTatva.org Sanskrit Developer Portal.
 */

(function (global) {
  'use strict';

  // --- Architecture Blueprints Registry ---
  const BLUEPRINTS = {
    'uart_output': {
      id: 'uart_output',
      name: 'UART यन्त्र निर्गमः (Hardware Console Output)',
      tier: 'proof',
      desc: 'Bare-metal machine-mode serial console driver writing to memory-mapped UART at 0x10000000',
      generate: (params) => {
        const msg = params.message || 'नमस्ते संसार';
        return `॰ संस्कृतिः निर्मितः कार्यक्रमः — UART निर्गमः
॰ प्रयोजनम्: ${params.purpose || 'Direct hardware serial console output'}

॰ UART का पता (०x10000000)
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
॥ अष्टकाः उक्तम् ${msg} इति ॥
॥ अष्टकाः १० ० ॥`;
      }
    },

    'vedic_math': {
      id: 'vedic_math',
      name: 'वैदिक गणितम् (64-bit Arithmetic Computation)',
      tier: 'proof',
      desc: 'High-performance 64-bit algebraic arithmetic with register preservation and UART report',
      generate: (params) => {
        const a = params.a || 25;
        const b = params.b || 16;
        const op = params.op || 'mul';
        const opVerb = op === 'add' ? 'योगः' : (op === 'sub' ? 'वियोगः' : (op === 'div' ? 'भागः' : 'गुणनम्'));
        return `॰ संस्कृतिः निर्मितः कार्यक्रमः — वैदिक गणितम्
॰ संक्रिया: ${a} ${op} ${b}

॰ Registers में संख्याओं का भारण
योगः क्षणिक०म् शून्यःन ${a}न ।
योगः क्षणिक१म् शून्यःन ${b}न ।

॰ Computation
${opVerb} क्षणिक२म् क्षणिक०न क्षणिक१न ।

॰ UART निर्गमः
उपरिभारः स्थिर०म् ०षोड्१००००न ।
स्थानसापेक्षयोगः क्षणिक१म् सन्देशःॱउपरिन ।
योगः क्षणिक१म् क्षणिक१न सन्देशःॱअधःन ।

लेखनम्ॱॱ
आहारःॱअ८ क्षणिक३म् क्षणिक१त् ०न ।
समलङ्घनम् क्षणिक३न शून्यःत् समाप्तिःय् ।
निधानम्ॱअ८ स्थिर०य् ०न क्षणिक३न ।
योगः क्षणिक१म् क्षणिक१न १न ।
लङ्घनम् शून्यःम् लेखनम्य् ।

समाप्तिःॱॱ
उपरिभारः क्षणिक४म् ०षोड्१००न ।
उपरिभारः क्षणिक५म् ०षोड्५न ।
योगः क्षणिक५म् क्षणिक५न ०षोड्५५५न ।
निधानम्ॱअ३२ क्षणिक४य् ०न क्षणिक५न ।

॥ कोष्ठकम् ॱदत्त ॥
सन्देशःॱॱ
॥ अष्टकाः उक्तम् गणित-परिणामः: ${a} संक्रिया ${b} = कृतम् इति ॥
॥ अष्टकाः १० ० ॥`;
      }
    },

    'loop_counter': {
      id: 'loop_counter',
      name: 'नियन्त्रण-चक्रम् (Algorithmic Loop & Branching)',
      tier: 'proof',
      desc: 'Loop control flow counting iterations with branch evaluation and UART verification',
      generate: (params) => {
        const count = params.count || 10;
        return `॰ संस्कृतिः निर्मितः कार्यक्रमः — नियन्त्रण चक्रम्
॰ आवृत्ति-गणना: ${count} चक्राणि

योगः स्थिर०म् शून्यःन ०न ।       ॰ Accumulator Sum = 0
योगः क्षणिक०म् शून्यःन ${count}न ।     ॰ Counter = ${count}

चक्रम्ॱॱ
योगः स्थिर०म् स्थिर०न क्षणिक०न ।   ॰ Sum += Counter
वियोगः क्षणिक०म् क्षणिक०न १न ।   ॰ Counter--
विषमलङ्घनम् क्षणिक०न शून्यःत् चक्रम्य् । ॰ Loop until Counter == 0

॰ Console Output
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
॥ अष्टकाः उक्तम् चक्र-समाप्तिः (गणना पूर्णा) इति ॥
॥ अष्टकाः १० ० ॥`;
      }
    },

    'guest_app': {
      id: 'guest_app',
      name: 'अतिथि-अनुप्रयोगः (U-Mode Isolated Application)',
      tier: 'app',
      desc: 'User-mode guest application isolated at 0x20000000 with supervisor ecall surface output',
      generate: (params) => {
        const appName = params.appName || 'परमतत्त्व अतिथि-सेवा';
        return `॰ संस्कृतिः निर्मितः अतिथि-अनुप्रयोगः
॰ Load Address: ०षोड्२००००००० (U-Mode Isolation)

॰ Get string address
स्थानसापेक्षयोगः अर्थ०म् सन्देशःॱउपरिन ।
योगः अर्थ०म् अर्थ०न सन्देशःॱअधःन ।

॰ Supervisor ecall for Surface Output (Syscall 64)
उपरिभारः अर्थ७म् ०षोड्०न ।
योगः अर्थ७म् अर्थ७न ६४न ।
आज्ञापनम् ।

॰ Supervisor ecall for Exit (Syscall 93)
उपरिभारः अर्थ७म् ०षोड्०न ।
योगः अर्थ७म् अर्थ७न ९३न ।
उपरिभारः अर्थ०म् ०षोड्०न ।
आज्ञापनम् ।

॥ कोष्ठकम् ॱदत्त ॥
सन्देशःॱॱ
॥ अष्टकाः उक्तम् [अनुप्रयोगः]: ${appName} इति ॥
॥ अष्टकाः १० ० ॥`;
      }
    },

    'memory_buffer': {
      id: 'memory_buffer',
      name: 'स्मृति-प्रबन्धनम् (Memory Array Scanner & Modifier)',
      tier: 'proof',
      desc: 'Direct byte memory scanner reading array elements and storing modified values',
      generate: (params) => {
        return `॰ संस्कृतिः निर्मितः स्मृति-प्रबन्धकः
॰ Memory block scan and byte transform

स्थानसापेक्षयोगः स्थिर०म् सरणीॱउपरिन ।
योगः स्थिर०म् स्थिर०न सरणीॱअधःन ।
योगः क्षणिक०म् शून्यःन ४न ।      ॰ Array Length = 4

शोधनम्ॱॱ
आहारःॱअ८ क्षणिक१म् स्थिर०त् ०न ।
योगः क्षणिक१म् क्षणिक१न १०न ।     ॰ Transform: byte + 10
निधानम्ॱअ८ स्थिर०य् ०न क्षणिक१न ।
योगः स्थिर०म् स्थिर०न १न ।
वियोगः क्षणिक०म् क्षणिक०न १न ।
विषमलङ्घनम् क्षणिक०न शून्यःत् शोधनम्य् ।

॰ Complete & Halt
उपरिभारः क्षणिक४म् ०षोड्१००न ।
उपरिभारः क्षणिक५म् ०षोड्५न ।
योगः क्षणिक५म् क्षणिक५न ०षोड्५५५न ।
निधानम्ॱअ३२ क्षणिक४य् ०न क्षणिक५न ।

॥ कोष्ठकम् ॱदत्त ॥
सरणीॱॱ
॥ अष्टकाः १ २ ३ ४ ॥`;
      }
    },

    'terminal_pty': {
      id: 'terminal_pty',
      name: 'द्वारपालः (Smart Sanskrit PTY Terminal Driver)',
      tier: 'proof',
      desc: 'System element E1 terminal driver handling Sanskrit akṣara streams over serial bus',
      generate: (params) => {
        return `॰ संस्कृतिः निर्मितः द्वारपालः टर्मिनल चालकः (E1 Terminal Driver)

॰ Initialize UART controller
उपरिभारः स्थिर०म् ०षोड्१००००न ।

स्थानसापेक्षयोगः क्षणिक१म् प्रबोधकःॱउपरिन ।
योगः क्षणिक१म् क्षणिक१न प्रबोधकःॱअधःन ।

मुद्रण_चक्रम्ॱॱ
आहारःॱअ८ क्षणिक२म् क्षणिक१त् ०न ।
समलङ्घनम् क्षणिक२न शून्यःत् विश्रामःय् ।
निधानम्ॱअ८ स्थिर०य् ०न क्षणिक२न ।
योगः क्षणिक१म् क्षणिक१न १न ।
लङ्घनम् शून्यःम् मुद्रण_चक्रम्य् ।

विश्रामःॱॱ
उपरिभारः क्षणिक४म् ०षोड्१००न ।
उपरिभारः क्षणिक५म् ०षोड्५न ।
योगः क्षणिक५म् क्षणिक५न ०षोड्५५५न ।
निधानम्ॱअ३२ क्षणिक४य् ०न क्षणिक५न ।

॥ कोष्ठकम् ॱदत्त ॥
प्रबोधकःॱॱ
॥ अष्टकाः उक्तम् [द्वारपालः] सस्सेम्बली स्मार्ट-टर्मिनल सज्जम्। इति ॥
॥ अष्टकाः १० ० ॥`;
      }
    }
  };

  // --- Natural Language to Requirements Synthesizer ---
  function synthesizeFromPrompt(prompt) {
    const p = prompt.toLowerCase();

    if (p.includes('uart') || p.includes('hello') || p.includes('namaste') || p.includes('print') || p.includes('मुद्रण')) {
      let customMsg = 'नमस्ते संसार';
      if (p.includes('hello world')) customMsg = 'नमस्ते संसार (Hello World)';
      else if (p.includes('welcome')) customMsg = 'स्वागतम् परमतत्त्वे';
      return {
        blueprint: BLUEPRINTS.uart_output,
        code: BLUEPRINTS.uart_output.generate({ message: customMsg, purpose: prompt }),
        params: { message: customMsg }
      };
    }

    if (p.includes('math') || p.includes('multiply') || p.includes('add') || p.includes('sub') || p.includes('calc') || p.includes('गुणन') || p.includes('योग')) {
      let op = 'mul';
      if (p.includes('add') || p.includes('sum') || p.includes('योग')) op = 'add';
      else if (p.includes('sub') || p.includes('वियोग')) op = 'sub';
      else if (p.includes('div') || p.includes('भाग')) op = 'div';

      return {
        blueprint: BLUEPRINTS.vedic_math,
        code: BLUEPRINTS.vedic_math.generate({ a: 36, b: 12, op: op }),
        params: { a: 36, b: 12, op: op }
      };
    }

    if (p.includes('loop') || p.includes('count') || p.includes('fibonacci') || p.includes('चक्र') || p.includes('आवृत्ति')) {
      return {
        blueprint: BLUEPRINTS.loop_counter,
        code: BLUEPRINTS.loop_counter.generate({ count: 10 }),
        params: { count: 10 }
      };
    }

    if (p.includes('terminal') || p.includes('dvarapala') || p.includes('pty') || p.includes('द्वारपाल')) {
      return {
        blueprint: BLUEPRINTS.terminal_pty,
        code: BLUEPRINTS.terminal_pty.generate({}),
        params: {}
      };
    }

    if (p.includes('memory') || p.includes('array') || p.includes('buffer') || p.includes('स्मृति')) {
      return {
        blueprint: BLUEPRINTS.memory_buffer,
        code: BLUEPRINTS.memory_buffer.generate({}),
        params: {}
      };
    }

    // Default to Guest App
    return {
      blueprint: BLUEPRINTS.guest_app,
      code: BLUEPRINTS.guest_app.generate({ appName: prompt.trim() || 'परमतत्त्व सस्सेम्बली अनुप्रयोगः' }),
      params: { appName: prompt.trim() || 'परमतत्त्व सस्सेम्बली अनुप्रयोगः' }
    };
  }

  // --- Export Global ---
  global.SanskritiBuilder = {
    BLUEPRINTS,
    synthesizeFromPrompt
  };

})(typeof window !== 'undefined' ? window : this);

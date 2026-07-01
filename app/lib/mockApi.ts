// ─────────────────────────────────────────────────────────────────────────────
// Mock del backend para desarrollo front-only.
//
// Se activa con NEXT_PUBLIC_USE_MOCKS=1 en .env.local. Cuando está activo,
// `api.request()` (app/lib/api.ts) enruta acá en vez de hacer fetch al backend,
// permitiendo probar el flujo de cuestionarios (alumno) sin NestJS ni Postgres.
//
// Cubre: POST /auth/login, GET /materias, GET /materias/:id/unidades,
// POST /attempts/start, POST /attempts/:id/answer.
//
// Para volver al backend real: borrar NEXT_PUBLIC_USE_MOCKS de .env.local.
// ─────────────────────────────────────────────────────────────────────────────

export const MOCKS_ENABLED = process.env.NEXT_PUBLIC_USE_MOCKS === "1";

// ── Banco de preguntas (por materia) ──────────────────────────────────────────

interface MockQuestion {
  id: string;
  texto: string;
  opciones: string[];
  correcta: number; // índice de la opción correcta
  explicacion: string;
  unidad: number;
}

const BANK: Record<string, MockQuestion[]> = {
  "mat-anat1": [
    {
      id: "q-a1-1",
      texto: "¿Cuántos huesos tiene el esqueleto humano adulto?",
      opciones: ["206", "212", "198", "220"],
      correcta: 0,
      explicacion: "El esqueleto adulto tiene 206 huesos; los recién nacidos tienen ~270 que se fusionan.",
      unidad: 1,
    },
    {
      id: "q-a1-2",
      texto: "¿Cuál es el hueso más largo del cuerpo humano?",
      opciones: ["Húmero", "Tibia", "Fémur", "Peroné"],
      correcta: 2,
      explicacion: "El fémur es el hueso más largo y fuerte del cuerpo humano.",
      unidad: 1,
    },
    {
      id: "q-a1-3",
      texto: "¿Qué tipo de articulación es la del hombro?",
      opciones: ["Bisagra", "Enartrosis (esferoidea)", "Trocoide (pivote)", "Plana"],
      correcta: 1,
      explicacion: "El hombro es una enartrosis: permite movimiento en los tres ejes del espacio.",
      unidad: 2,
    },
    {
      id: "q-a1-4",
      texto: "¿Cómo se llama la porción distal del esternón?",
      opciones: ["Manubrio", "Cuerpo", "Apófisis xifoides", "Ángulo de Louis"],
      correcta: 2,
      explicacion: "La apófisis xifoides es la porción distal y cartilaginosa del esternón.",
      unidad: 2,
    },
    {
      id: "q-a1-5",
      texto: "¿Cuántas vértebras cervicales tiene la columna?",
      opciones: ["5", "7", "12", "9"],
      correcta: 1,
      explicacion: "La columna cervical tiene 7 vértebras (C1 a C7).",
      unidad: 3,
    },
  ],
  "mat-anat2": [
    {
      id: "q-a2-1",
      texto: "¿Qué músculo es el principal flexor del codo?",
      opciones: ["Tríceps braquial", "Bíceps braquial", "Deltoides", "Pectoral mayor"],
      correcta: 1,
      explicacion: "El bíceps braquial es el principal flexor del codo y supinador del antebrazo.",
      unidad: 1,
    },
    {
      id: "q-a2-2",
      texto: "¿Cuál de estos músculos pertenece al manguito rotador?",
      opciones: ["Supraespinoso", "Bíceps femoral", "Gastrocnemio", "Recto abdominal"],
      correcta: 0,
      explicacion: "El manguito rotador lo forman supraespinoso, infraespinoso, redondo menor y subescapular.",
      unidad: 1,
    },
    {
      id: "q-a2-3",
      texto: "¿Qué músculo permite la extensión de la rodilla?",
      opciones: ["Isquiotibiales", "Cuádriceps femoral", "Sóleo", "Sartorio"],
      correcta: 1,
      explicacion: "El cuádriceps femoral es el gran extensor de la rodilla.",
      unidad: 2,
    },
    {
      id: "q-a2-4",
      texto: "¿Qué tipo de tejido muscular es involuntario y estriado?",
      opciones: ["Músculo liso", "Músculo esquelético", "Músculo cardíaco", "Tejido conectivo"],
      correcta: 2,
      explicacion: "El músculo cardíaco es estriado pero de control involuntario.",
      unidad: 3,
    },
  ],
  "mat-anat3": [
    {
      id: "q-a3-1",
      texto: "¿Cuántas cámaras tiene el corazón humano?",
      opciones: ["2", "3", "4", "5"],
      correcta: 2,
      explicacion: "El corazón tiene 4 cámaras: 2 aurículas y 2 ventrículos.",
      unidad: 1,
    },
    {
      id: "q-a3-2",
      texto: "¿Qué vaso lleva sangre oxigenada del corazón al cuerpo?",
      opciones: ["Arteria pulmonar", "Vena cava", "Aorta", "Vena porta"],
      correcta: 2,
      explicacion: "La aorta distribuye la sangre oxigenada desde el ventrículo izquierdo al organismo.",
      unidad: 1,
    },
    {
      id: "q-a3-3",
      texto: "¿Dónde ocurre el intercambio gaseoso en el pulmón?",
      opciones: ["Bronquios", "Tráquea", "Alvéolos", "Pleura"],
      correcta: 2,
      explicacion: "El intercambio de O₂ y CO₂ ocurre en los alvéolos pulmonares.",
      unidad: 2,
    },
  ],
  "mat-anat4": [
    {
      id: "q-a4-1",
      texto: "¿Cuál es la unidad funcional del sistema nervioso?",
      opciones: ["Nefrona", "Neurona", "Miocito", "Osteocito"],
      correcta: 1,
      explicacion: "La neurona es la unidad estructural y funcional del sistema nervioso.",
      unidad: 1,
    },
    {
      id: "q-a4-2",
      texto: "¿Qué parte del encéfalo controla el equilibrio y la coordinación?",
      opciones: ["Cerebro", "Cerebelo", "Bulbo raquídeo", "Hipotálamo"],
      correcta: 1,
      explicacion: "El cerebelo coordina el movimiento y mantiene el equilibrio.",
      unidad: 2,
    },
    {
      id: "q-a4-3",
      texto: "¿Cuántos pares de nervios craneales existen?",
      opciones: ["10", "12", "8", "31"],
      correcta: 1,
      explicacion: "Existen 12 pares de nervios craneales.",
      unidad: 2,
    },
  ],
};

const MATERIA_LABELS: Record<string, string> = {
  "mat-anat1": "Anatomía I",
  "mat-anat2": "Anatomía II",
  "mat-anat3": "Anatomía III",
  "mat-anat4": "Anatomía IV",
};

// ── Estado de intentos en memoria (persiste durante la sesión SPA) ─────────────

interface AttemptState {
  materiaLabel: string;
  questions: MockQuestion[];
  idx: number;
  correctCount: number;
}

const attempts = new Map<string, AttemptState>();

let seq = 0;
function makeId(prefix: string) {
  seq += 1;
  return `${prefix}-${seq}-${Math.round(performance.now())}`;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function nameFromEmail(email: string) {
  const local = email.split("@")[0] || "Usuario";
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function roleFromEmail(email: string): "ADMIN" | "DOCENTE" | "ESTUDIANTE" {
  const local = email.toLowerCase();
  if (local.includes("admin")) return "ADMIN";
  if (local.includes("docente") || local.includes("profe")) return "DOCENTE";
  return "ESTUDIANTE";
}

function toPregunta(q: MockQuestion) {
  return {
    id: q.id,
    texto: q.texto,
    opciones: q.opciones,
    formato: "multiple_choice",
  };
}

class MockError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// ── Router del mock ─────────────────────────────────────────────────────────────

export async function mockRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const [rawPath, query] = path.split("?");
  const body: Record<string, unknown> = init.body
    ? JSON.parse(init.body as string)
    : {};

  // Pequeña latencia simulada para que la UI muestre estados de carga.
  await new Promise((r) => setTimeout(r, 120));

  // POST /auth/login
  if (method === "POST" && rawPath === "/auth/login") {
    const email = String(body.email ?? "alumno@ismp.edu");
    const role = roleFromEmail(email);
    return {
      token: makeId("mock-token"),
      user: {
        id: makeId("user"),
        name: nameFromEmail(email),
        email,
        role,
        // carrera-rad tiene las 4 materias, así aparecen todas en /materias
        carreras: role === "ESTUDIANTE" ? [{ carreraId: "carrera-rad" }] : [],
      },
    } as T;
  }

  // GET /materias  (opcionalmente ?carreraId=...)
  if (method === "GET" && rawPath === "/materias") {
    const materias = Object.keys(BANK).map((id) => ({
      id,
      slug: id,
      label: MATERIA_LABELS[id] ?? id,
    }));
    return materias as T;
  }

  // GET /materias/:id/unidades
  const unidadesMatch = rawPath.match(/^\/materias\/([^/]+)\/unidades$/);
  if (method === "GET" && unidadesMatch) {
    const materiaId = unidadesMatch[1];
    const qs = BANK[materiaId] ?? [];
    const unidades = Array.from(new Set(qs.map((q) => q.unidad))).sort((a, b) => a - b);
    return unidades as T;
  }

  // POST /attempts/start
  if (method === "POST" && rawPath === "/attempts/start") {
    const materiaId = String(body.materiaId ?? "");
    const unidad = Number(body.unidad ?? 0);
    const cantidad = Math.max(1, Number(body.cantidad ?? 10));

    let pool = BANK[materiaId] ?? [];
    if (unidad > 0) pool = pool.filter((q) => q.unidad === unidad);
    if (pool.length === 0) {
      throw new MockError(400, "No hay preguntas para esa materia/unidad en el banco mock.");
    }

    // Selección "aleatoria" determinística: baraja simple por rotación.
    const shuffled = [...pool].sort((a, b) => a.id.localeCompare(b.id));
    const questions: MockQuestion[] = [];
    for (let i = 0; i < cantidad; i++) {
      questions.push(shuffled[i % shuffled.length]);
    }

    const attemptId = makeId("attempt");
    attempts.set(attemptId, {
      materiaLabel: MATERIA_LABELS[materiaId] ?? materiaId,
      questions,
      idx: 0,
      correctCount: 0,
    });

    return {
      attemptId,
      total: questions.length,
      numero: 1,
      pregunta: toPregunta(questions[0]),
    } as T;
  }

  // POST /attempts/:id/answer
  const answerMatch = rawPath.match(/^\/attempts\/([^/]+)\/answer$/);
  if (method === "POST" && answerMatch) {
    const attemptId = answerMatch[1];
    const state = attempts.get(attemptId);
    if (!state) throw new MockError(404, "Intento no encontrado (mock).");

    const current = state.questions[state.idx];
    const selected = Number(body.selected ?? -1);
    const correcta = selected === current.correcta;
    if (correcta) state.correctCount += 1;

    const isLast = state.idx >= state.questions.length - 1;

    if (isLast) {
      const total = state.questions.length;
      const nota = Math.round((state.correctCount / total) * 100);
      attempts.delete(attemptId);
      return {
        tipo: "finalizado",
        correcta,
        correcta_era: current.correcta,
        explicacion: current.explicacion,
        resultado: { nota, correctas: state.correctCount, total },
      } as T;
    }

    state.idx += 1;
    const next = state.questions[state.idx];
    return {
      tipo: "continua",
      correcta,
      correcta_era: current.correcta,
      explicacion: current.explicacion,
      numero: state.idx + 1,
      total: state.questions.length,
      pregunta: toPregunta(next),
    } as T;
  }

  throw new MockError(
    404,
    `[mock] Endpoint no implementado: ${method} ${rawPath}. Agregalo en app/lib/mockApi.ts o desactivá NEXT_PUBLIC_USE_MOCKS.`,
  );
}

#!/bin/bash
# Migra las preguntas del localStorage al backend.
# Uso: bash scripts/migrate-questions.sh

API="http://localhost:3001"

echo "→ Obteniendo token de docente..."
TOKEN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"cmedina@ismp.edu.ar","password":"docente123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "✗ No se pudo obtener el token. ¿El backend está corriendo en :3001?"
  exit 1
fi

echo "✓ Token obtenido."
echo ""

post_question() {
  local BODY="$1"
  local LABEL="$2"
  RESP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/questions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$BODY")
  if [ "$RESP" = "201" ]; then
    echo "  ✓ $LABEL"
  else
    echo "  ✗ $LABEL (HTTP $RESP)"
  fi
}

# ── mat-anat1 · Unidad 1 · Sistema Óseo ──────────────────────────────────────
echo "Anatomía 1 — Unidad 1 (Sistema Óseo)..."

post_question '{
  "question": "¿Cuál es el hueso más largo del cuerpo humano?",
  "options": ["Tibia","Húmero","Fémur","Radio"],
  "correct": 2,
  "explanation": "El fémur es el hueso más largo y robusto; articula la cadera con la rodilla.",
  "formato": "MULTIPLE",
  "materias": [{"materiaId":"mat-anat1","unidad":1}]
}' "Hueso más largo"

post_question '{
  "question": "¿Cuántos huesos tiene el esqueleto adulto humano?",
  "options": ["206","187","213","226"],
  "correct": 0,
  "explanation": "El adulto tiene 206 huesos; los bebés nacen con ~270 y muchos se fusionan durante el crecimiento.",
  "formato": "MULTIPLE",
  "materias": [{"materiaId":"mat-anat1","unidad":1}]
}' "206 huesos"

post_question '{
  "question": "¿Qué tipo de hueso es la rótula?",
  "options": ["Hueso largo","Hueso plano","Hueso sesamoideo","Hueso irregular"],
  "correct": 2,
  "explanation": "La rótula es el sesamoideo más grande del cuerpo, ubicado dentro del tendón cuadricipital.",
  "formato": "MULTIPLE",
  "materias": [{"materiaId":"mat-anat1","unidad":1}]
}' "Rótula sesamoideo"

post_question '{
  "question": "¿Cómo se llama el proceso de formación ósea a partir de cartílago?",
  "options": ["Osificación intramembranosa","Osificación endocondral","Calcificación primaria","Mineralización"],
  "correct": 1,
  "explanation": "La osificación endocondral reemplaza un molde de cartílago hialino; es el mecanismo de los huesos largos.",
  "formato": "MULTIPLE",
  "materias": [{"materiaId":"mat-anat1","unidad":1}]
}' "Osificación endocondral"

post_question '{
  "question": "¿Qué nombre recibe la cavidad central de los huesos largos que contiene médula ósea?",
  "options": ["Cavidad sinovial","Canal de Havers","Cavidad medular","Seno trabecular"],
  "correct": 2,
  "explanation": "La cavidad medular está rodeada de hueso compacto y contiene médula roja o amarilla según la edad.",
  "formato": "MULTIPLE",
  "materias": [{"materiaId":"mat-anat1","unidad":1}]
}' "Cavidad medular"

post_question '{
  "question": "¿Qué hueso protege la articulación de la rodilla?",
  "options": ["Tibia","Rótula","Fémur","Fíbula"],
  "correct": 1,
  "explanation": "La rótula (patela) es un hueso sesamoideo que protege la rodilla.",
  "formato": "MULTIPLE",
  "materias": [{"materiaId":"mat-anat1","unidad":1}]
}' "Rótula protege rodilla"

post_question '{
  "question": "¿Cuántos huesos tiene el cráneo adulto?",
  "options": ["22","14","28","18"],
  "correct": 0,
  "explanation": "El cráneo adulto está compuesto por 22 huesos: 8 del neurocráneo y 14 del viscerocráneo.",
  "formato": "MULTIPLE",
  "materias": [{"materiaId":"mat-anat1","unidad":1}]
}' "22 huesos del cráneo"

post_question '{
  "question": "¿Cómo se denomina la unión entre dos o más huesos?",
  "options": ["Tendón","Ligamento","Articulación","Cartílago"],
  "correct": 2,
  "explanation": "Una articulación es la unión entre dos o más huesos.",
  "formato": "MULTIPLE",
  "materias": [{"materiaId":"mat-anat1","unidad":1}]
}' "Definición de articulación"

post_question '{
  "question": "¿Qué huesos forman el antebrazo?",
  "options": ["Húmero y radio","Radio y cúbito","Cúbito y fémur","Radio y fíbula"],
  "correct": 1,
  "explanation": "El antebrazo está formado por el radio (lateral) y el cúbito (medial).",
  "formato": "MULTIPLE",
  "materias": [{"materiaId":"mat-anat1","unidad":1}]
}' "Huesos del antebrazo"

# ── mat-anat2 · Unidad 1 · Músculos ──────────────────────────────────────────
echo ""
echo "Anatomía 2 — Unidad 1 (Músculos del miembro superior)..."

post_question '{
  "question": "El bíceps braquial es flexor del codo.",
  "options": ["Verdadero","Falso"],
  "correct": 0,
  "explanation": "El bíceps braquial flexiona el codo y supina el antebrazo.",
  "formato": "TRUEFALSE",
  "materias": [{"materiaId":"mat-anat2","unidad":1}]
}' "Bíceps flexor"

post_question '{
  "question": "El deltoides es un músculo del antebrazo.",
  "options": ["Verdadero","Falso"],
  "correct": 1,
  "explanation": "El deltoides es un músculo del hombro, no del antebrazo.",
  "formato": "TRUEFALSE",
  "materias": [{"materiaId":"mat-anat2","unidad":1}]
}' "Deltoides no es antebrazo"

# ── mat-anat3 · Unidad 1 · Tórax ─────────────────────────────────────────────
echo ""
echo "Anatomía 3 — Unidad 1 (Estructuras toracoabdominales)..."

post_question '{
  "question": "¿Cuántas vértebras componen la columna torácica?",
  "options": ["7","10","12","5"],
  "correct": 2,
  "explanation": "La columna torácica tiene 12 vértebras (T1-T12).",
  "formato": "MULTIPLE",
  "materias": [{"materiaId":"mat-anat3","unidad":1}]
}' "12 vértebras torácicas"

post_question '{
  "question": "¿Qué órgano se ubica predominantemente en el cuadrante superior derecho?",
  "options": ["Bazo","Hígado","Estómago","Páncreas"],
  "correct": 1,
  "explanation": "El hígado ocupa el cuadrante superior derecho del abdomen.",
  "formato": "MULTIPLE",
  "materias": [{"materiaId":"mat-anat3","unidad":1}]
}' "Hígado cuadrante derecho"

echo ""
echo "Migración completa. Verificá en /cuestionarios/generar."

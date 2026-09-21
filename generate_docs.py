from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER

OUTPUT = r"C:\Users\54385\Repositorios\ISMP-3D-ANATOMY\ISMP_API_Endpoints.pdf"

doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    rightMargin=2*cm,
    leftMargin=2*cm,
    topMargin=2*cm,
    bottomMargin=2*cm,
)

styles = getSampleStyleSheet()

# Custom styles
title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=20, spaceAfter=6, textColor=colors.HexColor('#1a1a2e'))
module_style = ParagraphStyle('Module', parent=styles['Heading1'], fontSize=14, spaceBefore=16, spaceAfter=4, textColor=colors.HexColor('#16213e'), borderPad=4)
endpoint_style = ParagraphStyle('Endpoint', parent=styles['Heading2'], fontSize=11, spaceBefore=10, spaceAfter=2, textColor=colors.HexColor('#0f3460'))
normal = ParagraphStyle('Normal', parent=styles['Normal'], fontSize=9, spaceAfter=3)
code_style = ParagraphStyle('Code', parent=styles['Code'], fontSize=8, backColor=colors.HexColor('#f4f4f4'), borderPad=4, spaceAfter=4)
label_style = ParagraphStyle('Label', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#555555'))

METHOD_COLORS = {
    'GET':    colors.HexColor('#28a745'),
    'POST':   colors.HexColor('#007bff'),
    'PATCH':  colors.HexColor('#fd7e14'),
    'DELETE': colors.HexColor('#dc3545'),
}

def method_badge(method, path):
    color = METHOD_COLORS.get(method, colors.grey)
    return Table(
        [[Paragraph(f'<font color="white"><b>{method}</b></font>', ParagraphStyle('m', fontSize=9, textColor=colors.white)),
          Paragraph(f'<font color="#333333"><b>{path}</b></font>', ParagraphStyle('p', fontSize=9))]],
        colWidths=[1.5*cm, 14*cm],
        style=TableStyle([
            ('BACKGROUND', (0,0), (0,0), color),
            ('BACKGROUND', (1,0), (1,0), colors.HexColor('#f0f0f0')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (0,0), 6),
            ('LEFTPADDING', (1,0), (1,0), 8),
            ('ROUNDEDCORNERS', [3]),
        ])
    )

def info_table(access, receives, returns):
    data = [
        [Paragraph('<b>Acceso</b>', label_style), Paragraph(access, normal)],
        [Paragraph('<b>Recibe</b>', label_style), Paragraph(receives, normal)],
        [Paragraph('<b>Devuelve</b>', label_style), Paragraph(returns, normal)],
    ]
    t = Table(data, colWidths=[2.5*cm, 13*cm])
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LINEBELOW', (0,0), (-1,-2), 0.3, colors.HexColor('#dddddd')),
    ]))
    return t

story = []

# Title
story.append(Spacer(1, 0.5*cm))
story.append(Paragraph("ISMP 3D Anatomy — Documentacion de API", title_style))
story.append(Paragraph("Backend NestJS + Prisma + PostgreSQL", ParagraphStyle('sub', fontSize=11, textColor=colors.grey, spaceAfter=4)))
story.append(Paragraph("Base URL: <b>http://localhost:3001</b>", normal))
story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#1a1a2e'), spaceAfter=12))

# ─── AUTH ───────────────────────────────────────────────────────────────────
story.append(Paragraph("AUTH /auth", module_style))
story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cccccc'), spaceAfter=6))

story.append(method_badge("POST", "/auth/login"))
story.append(Spacer(1, 4))
story.append(info_table(
    "Publico — sin token",
    '{ "email": "admin@ismp.edu.ar", "password": "admin123" }',
    '{ token, user: { id, name, email, role, carreraId } } — devuelve 401 si la cuenta esta PENDIENTE'
))
story.append(Paragraph("Busca el usuario por email, compara el password con el hash almacenado y verifica que estado = ACTIVO. Genera un JWT firmado.", normal))
story.append(Spacer(1, 8))

story.append(method_badge("GET", "/auth/me"))
story.append(Spacer(1, 4))
story.append(info_table(
    "Cualquier rol autenticado — Bearer token",
    "Header: Authorization: Bearer &lt;token&gt;",
    '{ id, name, email, role, carreraId, createdAt }'
))
story.append(Paragraph("Devuelve los datos del usuario dueno del token.", normal))
story.append(Spacer(1, 12))

# ─── USERS ──────────────────────────────────────────────────────────────────
story.append(Paragraph("USERS /users", module_style))
story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cccccc'), spaceAfter=6))

story.append(method_badge("POST", "/users/register"))
story.append(Spacer(1, 4))
story.append(info_table(
    "Publico — sin token",
    '{ "name", "email", "password" (min 6 chars), "carreraId"? }',
    '{ message, activationCode } — codigo de 8 caracteres en mayusculas'
))
story.append(Paragraph("Crea un estudiante con estado PENDIENTE. El alumno debe pasar el activationCode a un admin para activar su cuenta. No puede loguearse hasta ser activado.", normal))
story.append(Spacer(1, 8))

story.append(method_badge("POST", "/users/activate"))
story.append(Spacer(1, 4))
story.append(info_table(
    "ADMIN — Bearer token",
    '{ "code": "A3F9BC2D" }',
    '{ message: "Usuario Juan activado correctamente" }'
))
story.append(Paragraph("Busca el usuario por activationCode, lo pasa a estado ACTIVO y elimina el codigo para que no pueda reutilizarse.", normal))
story.append(Spacer(1, 8))

story.append(method_badge("GET", "/users/search?search=xxx"))
story.append(Spacer(1, 4))
story.append(info_table(
    "DOCENTE, ADMIN — Bearer token",
    "Query param: search (nombre o email parcial)",
    'Array de { id, name, email, carreraId } — busqueda insensible a acentos y mayusculas'
))
story.append(Paragraph("Busca estudiantes en la tabla User usando unaccent() de PostgreSQL. Util para encontrar un alumno antes de consultar sus intentos.", normal))
story.append(Spacer(1, 8))

story.append(method_badge("GET", "/users"))
story.append(Spacer(1, 4))
story.append(info_table(
    "ADMIN — Bearer token",
    "Query params opcionales: role (ADMIN|DOCENTE|ESTUDIANTE), carreraId",
    "Array de usuarios sin passwordHash"
))
story.append(Spacer(1, 8))

story.append(method_badge("GET", "/users/:id"))
story.append(Spacer(1, 4))
story.append(info_table(
    "ADMIN — Bearer token",
    "Path param: id del usuario",
    "{ id, name, email, role, carreraId, createdAt } — 404 si no existe"
))
story.append(Spacer(1, 8))

story.append(method_badge("POST", "/users"))
story.append(Spacer(1, 4))
story.append(info_table(
    "ADMIN — Bearer token",
    '{ "name", "email", "password", "role" (ADMIN|DOCENTE|ESTUDIANTE), "carreraId"? }',
    "Usuario creado — a diferencia de /register, no genera codigo ni pasa por aprobacion"
))
story.append(Spacer(1, 8))

story.append(method_badge("PATCH", "/users/:id"))
story.append(Spacer(1, 4))
story.append(info_table(
    "ADMIN — Bearer token",
    "Cualquier campo del usuario (todos opcionales). Si viene password la hashea.",
    "Usuario actualizado"
))
story.append(Spacer(1, 8))

story.append(method_badge("DELETE", "/users/:id"))
story.append(Spacer(1, 4))
story.append(info_table(
    "ADMIN — Bearer token",
    "Path param: id del usuario",
    '{ message: "Usuario eliminado correctamente" } — 404 si no existe'
))
story.append(Spacer(1, 12))

# ─── QUESTIONS ──────────────────────────────────────────────────────────────
story.append(Paragraph("QUESTIONS /questions", module_style))
story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cccccc'), spaceAfter=6))

story.append(method_badge("GET", "/questions"))
story.append(Spacer(1, 4))
story.append(info_table(
    "Cualquier rol autenticado — Bearer token",
    "Query params opcionales: materiaId, unidad (int), formato (MULTIPLE|TRUEFALSE|IDENTIFICATION|LABELING)",
    "Array de preguntas con opciones, respuesta correcta, materias y autor"
))
story.append(Paragraph("Lista el banco de preguntas. Sin filtros devuelve todas. Consulta las tablas Question y QuestionMateria.", normal))
story.append(Spacer(1, 8))

story.append(method_badge("GET", "/questions/:id"))
story.append(Spacer(1, 4))
story.append(info_table(
    "Cualquier rol autenticado — Bearer token",
    "Path param: id de la pregunta",
    "Pregunta completa con materias y autor — 404 si no existe"
))
story.append(Spacer(1, 8))

story.append(method_badge("POST", "/questions"))
story.append(Spacer(1, 4))
story.append(info_table(
    "DOCENTE, ADMIN — Bearer token",
    '{ "question", "options": [...4 opciones], "correct": 0-3, "explanation"?, "formato", "materias": [{ materiaId, unidad }] }',
    "Pregunta creada con sus relaciones a materias — el autorId se toma del token"
))
story.append(Paragraph("Crea una pregunta en el banco. Inserta en Question y crea los registros pivot en QuestionMateria.", normal))
story.append(Spacer(1, 8))

story.append(method_badge("PATCH", "/questions/:id"))
story.append(Spacer(1, 4))
story.append(info_table(
    "DOCENTE (solo sus preguntas), ADMIN — Bearer token",
    "Mismos campos que POST pero todos opcionales. Si viene materias reemplaza todas las relaciones.",
    "Pregunta actualizada"
))
story.append(Spacer(1, 8))

story.append(method_badge("DELETE", "/questions/:id"))
story.append(Spacer(1, 4))
story.append(info_table(
    "DOCENTE (solo sus preguntas), ADMIN — Bearer token",
    "Path param: id de la pregunta",
    '{ message: "Pregunta eliminada correctamente" }'
))
story.append(Spacer(1, 12))

# ─── ATTEMPTS ───────────────────────────────────────────────────────────────
story.append(Paragraph("ATTEMPTS /attempts", module_style))
story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cccccc'), spaceAfter=6))

story.append(method_badge("POST", "/attempts/start"))
story.append(Spacer(1, 4))
story.append(info_table(
    "Cualquier rol autenticado — Bearer token (tipicamente ESTUDIANTE)",
    '{ "materiaId", "unidad": 0 (toda la materia) o 1-N, "cantidad": N }',
    '{ attemptId, total, numero: 1, pregunta: { id, texto, opciones, formato } } — sin la respuesta correcta'
))
story.append(Paragraph("Selecciona N preguntas aleatorias del banco para la materia/unidad indicada. Crea un registro en Attempt y los registros en AttemptQuestion (snapshot de preguntas asignadas). Devuelve la primera pregunta.", normal))
story.append(Spacer(1, 8))

story.append(method_badge("POST", "/attempts/:id/answer"))
story.append(Spacer(1, 4))
story.append(info_table(
    "Cualquier rol autenticado — Bearer token (debe ser el dueno del intento)",
    '{ "questionId", "selected": 0-3 } — Path param: attemptId',
    'Si hay mas preguntas: { tipo:"continua", correcta, correcta_era, explicacion, numero, total, pregunta }. Si es la ultima: { tipo:"finalizado", correcta, correcta_era, explicacion, resultado: { nota, correctas, total } }'
))
story.append(Paragraph("Valida que la pregunta pertenezca al intento y no haya sido respondida. Guarda el AnswerLog con snapshot de la pregunta. Si es la ultima, cierra el intento calculando la nota (0-100).", normal))
story.append(Spacer(1, 8))

story.append(method_badge("GET", "/attempts/me"))
story.append(Spacer(1, 4))
story.append(info_table(
    "Cualquier rol autenticado — Bearer token",
    "Query param opcional: materiaId",
    "Array de intentos completados del usuario con datos de la materia — 404 si no tiene ninguno"
))
story.append(Spacer(1, 8))

story.append(method_badge("GET", "/attempts/student"))
story.append(Spacer(1, 4))
story.append(info_table(
    "DOCENTE, ADMIN — Bearer token",
    "Query params: studentId (obligatorio), materiaId y carreraId (obligatorios para DOCENTE, opcionales para ADMIN)",
    '{ estudiante: { id, name, email }, attempts: [...] } — 404 si el alumno no tiene intentos'
))
story.append(Paragraph("Para DOCENTE verifica que la materia pertenezca a su carrera antes de devolver los datos.", normal))
story.append(Spacer(1, 8))

story.append(method_badge("GET", "/attempts"))
story.append(Spacer(1, 4))
story.append(info_table(
    "DOCENTE, ADMIN — Bearer token",
    "Query param opcional: materiaId (obligatorio para DOCENTE, opcional para ADMIN)",
    "Array de intentos completados con usuario y materia — ordenados por fecha desc"
))
story.append(Paragraph("DOCENTE sin materiaId recibe 403. DOCENTE con materiaId verifica que la materia pertenezca a su carrera.", normal))
story.append(Spacer(1, 8))

story.append(method_badge("GET", "/attempts/:id"))
story.append(Spacer(1, 4))
story.append(info_table(
    "DOCENTE, ADMIN — Bearer token",
    "Path param: id del intento",
    "Intento completo con usuario, materia y todos los answerLogs (respuestas del alumno con snapshots)"
))
story.append(Paragraph("DOCENTE solo puede ver intentos de materias de su carrera. Devuelve 403 si intenta acceder a otra materia.", normal))

# Build
doc.build(story)
print(f"PDF generado: {OUTPUT}")

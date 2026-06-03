from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER

OUTPUT = "C:/Users/54385/Repositorios/ISMP-3D-ANATOMY/docs/DB_LOGIC.pdf"

doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    rightMargin=2*cm, leftMargin=2*cm,
    topMargin=2*cm, bottomMargin=2*cm
)

styles = getSampleStyleSheet()

# Custom styles
title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=22, textColor=colors.HexColor('#1e293b'), spaceAfter=6)
h1_style = ParagraphStyle('H1', parent=styles['Heading1'], fontSize=15, textColor=colors.HexColor('#0f172a'), spaceBefore=18, spaceAfter=6)
h2_style = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=12, textColor=colors.HexColor('#334155'), spaceBefore=12, spaceAfter=4)
body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#475569'), leading=16)
code_style = ParagraphStyle('Code', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor('#1e40af'),
                             backColor=colors.HexColor('#f1f5f9'), fontName='Courier', leading=14,
                             leftIndent=10, rightIndent=10, spaceBefore=4, spaceAfter=4)
note_style = ParagraphStyle('Note', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor('#92400e'),
                              backColor=colors.HexColor('#fef3c7'), leading=14, leftIndent=8)

def hr():
    return HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceAfter=8, spaceBefore=8)

def table_header(cols, col_widths):
    header_style = TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 10),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#f8fafc'), colors.white]),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 9),
        ('TEXTCOLOR', (0,1), (-1,-1), colors.HexColor('#334155')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ])
    return header_style

story = []

# ── PORTADA ──────────────────────────────────────────────────────────────
story.append(Spacer(1, 2*cm))
story.append(Paragraph("ISMP 3D Anatomy", title_style))
story.append(Paragraph("Logica de Base de Datos — Backend NestJS", ParagraphStyle('sub', parent=styles['Normal'], fontSize=14, textColor=colors.HexColor('#64748b'), spaceAfter=4)))
story.append(Paragraph("Stack: NestJS + Prisma + PostgreSQL", ParagraphStyle('sub2', parent=styles['Normal'], fontSize=11, textColor=colors.HexColor('#94a3b8'), spaceAfter=20)))
story.append(hr())

# ── INTRODUCCION ─────────────────────────────────────────────────────────
story.append(Paragraph("1. Introduccion", h1_style))
story.append(Paragraph(
    "El backend maneja la persistencia de datos del sistema educativo de anatomia 3D. "
    "La base de datos esta disenada en PostgreSQL y se accede mediante Prisma ORM. "
    "Contiene 7 modelos principales que cubren: usuarios con roles, carreras, materias, "
    "cuestionarios, preguntas, intentos de los estudiantes y el log de respuestas.",
    body_style))
story.append(Spacer(1, 0.5*cm))

# ── ROLES ─────────────────────────────────────────────────────────────────
story.append(Paragraph("2. Roles del sistema", h1_style))
story.append(Paragraph("Existen 3 roles con distintos permisos:", body_style))
story.append(Spacer(1, 0.3*cm))

roles_data = [
    ['Rol', 'Descripcion', 'Permisos principales'],
    ['ADMIN', 'Administrador del sistema', 'CRUD completo de usuarios, carreras, materias'],
    ['DOCENTE', 'Profesor', 'Crear/editar/borrar sus propios cuestionarios. Ver resultados de sus alumnos'],
    ['ESTUDIANTE', 'Alumno', 'Ver cuestionarios de su carrera. Realizar intentos. Ver su historial'],
]
t = Table(roles_data, colWidths=[3.5*cm, 4*cm, 9.5*cm])
t.setStyle(table_header(roles_data, [3.5*cm, 4*cm, 9.5*cm]))
story.append(t)
story.append(Spacer(1, 0.5*cm))

# ── MODELOS ───────────────────────────────────────────────────────────────
story.append(Paragraph("3. Modelos de la base de datos", h1_style))
story.append(Paragraph(
    "A continuacion se describe cada tabla, sus campos y sus relaciones con otras tablas.",
    body_style))

# ── MODELO: User ──────────────────────────────────────────────────────────
story.append(Paragraph("3.1 User — Usuarios", h2_style))
story.append(Paragraph("Almacena todos los usuarios del sistema (admins, docentes y estudiantes).", body_style))
story.append(Spacer(1, 0.2*cm))
user_data = [
    ['Campo', 'Tipo', 'Descripcion'],
    ['id', 'String (cuid)', 'Identificador unico autogenerado'],
    ['name', 'String', 'Nombre completo del usuario'],
    ['email', 'String (unique)', 'Email — unico en el sistema, se usa para login'],
    ['passwordHash', 'String', 'Contrasena encriptada con bcrypt (nunca en texto plano)'],
    ['role', 'Enum Role', 'ADMIN | DOCENTE | ESTUDIANTE'],
    ['carreraId', 'String?', 'FK a Carrera — opcional (admins no tienen carrera)'],
    ['createdAt', 'DateTime', 'Fecha de creacion del registro'],
]
t = Table(user_data, colWidths=[3.5*cm, 3.5*cm, 10*cm])
t.setStyle(table_header(user_data, [3.5*cm, 3.5*cm, 10*cm]))
story.append(t)
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Relaciones: pertenece a una Carrera (opcional). Tiene muchos Cuestionarios (si es DOCENTE). Tiene muchos Attempts (si es ESTUDIANTE).", note_style))

# ── MODELO: Carrera ───────────────────────────────────────────────────────
story.append(Paragraph("3.2 Carrera", h2_style))
story.append(Paragraph("Representa las carreras universitarias disponibles en el sistema.", body_style))
story.append(Spacer(1, 0.2*cm))
carrera_data = [
    ['Campo', 'Tipo', 'Descripcion'],
    ['id', 'String (cuid)', 'Identificador unico autogenerado'],
    ['slug', 'String (unique)', 'Identificador legible: instrumentacion | radiologia'],
    ['label', 'String', 'Nombre para mostrar en la UI'],
]
t = Table(carrera_data, colWidths=[3.5*cm, 3.5*cm, 10*cm])
t.setStyle(table_header(carrera_data, [3.5*cm, 3.5*cm, 10*cm]))
story.append(t)
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Relaciones: tiene muchas Materias (relacion muchos a muchos). Tiene muchos Users.", note_style))

# ── MODELO: Materia ───────────────────────────────────────────────────────
story.append(Paragraph("3.3 Materia", h2_style))
story.append(Paragraph("Representa las materias que se dictan en las carreras.", body_style))
story.append(Spacer(1, 0.2*cm))
materia_data = [
    ['Campo', 'Tipo', 'Descripcion'],
    ['id', 'String (cuid)', 'Identificador unico autogenerado'],
    ['slug', 'String (unique)', 'Identificador legible: anatomia-1 | anatomia-2 | anatomia-3 | anatomia-4'],
    ['label', 'String', 'Nombre para mostrar en la UI'],
]
t = Table(materia_data, colWidths=[3.5*cm, 3.5*cm, 10*cm])
t.setStyle(table_header(materia_data, [3.5*cm, 3.5*cm, 10*cm]))
story.append(t)
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Relaciones: pertenece a muchas Carreras (muchos a muchos). Tiene muchos Cuestionarios.", note_style))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Seed inicial: Anatomia I y II vinculadas a ambas carreras. Anatomia III y IV solo a Radiologia.", body_style))

# ── MODELO: Cuestionario ─────────────────────────────────────────────────
story.append(Paragraph("3.4 Cuestionario", h2_style))
story.append(Paragraph("Cuestionario creado por un docente para una materia especifica.", body_style))
story.append(Spacer(1, 0.2*cm))
cuest_data = [
    ['Campo', 'Tipo', 'Descripcion'],
    ['id', 'String (cuid)', 'Identificador unico autogenerado'],
    ['titulo', 'String', 'Titulo del cuestionario'],
    ['descripcion', 'String', 'Descripcion opcional (default: vacio)'],
    ['materiaId', 'String', 'FK a Materia — a que materia pertenece'],
    ['formato', 'Enum Formato', 'MULTIPLE | TRUEFALSE | IDENTIFICATION | LABELING'],
    ['autorId', 'String', 'FK a User — quien creo el cuestionario (DOCENTE)'],
    ['createdAt', 'DateTime', 'Fecha de creacion'],
    ['updatedAt', 'DateTime', 'Fecha de ultima modificacion (auto)'],
]
t = Table(cuest_data, colWidths=[3.5*cm, 3.5*cm, 10*cm])
t.setStyle(table_header(cuest_data, [3.5*cm, 3.5*cm, 10*cm]))
story.append(t)
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Relaciones: pertenece a una Materia y a un User (autor). Tiene muchas Questions y muchos Attempts.", note_style))

# ── MODELO: Question ─────────────────────────────────────────────────────
story.append(Paragraph("3.5 Question — Preguntas", h2_style))
story.append(Paragraph("Cada pregunta pertenece a un cuestionario. Se borra si se borra el cuestionario (onDelete: Cascade).", body_style))
story.append(Spacer(1, 0.2*cm))
question_data = [
    ['Campo', 'Tipo', 'Descripcion'],
    ['id', 'String (cuid)', 'Identificador unico autogenerado'],
    ['cuestionarioId', 'String', 'FK a Cuestionario'],
    ['orden', 'Int', 'Numero de orden de la pregunta dentro del cuestionario'],
    ['texto', 'String', 'Enunciado de la pregunta'],
    ['opciones', 'String[]', 'Array de opciones: 2 para TrueFalse, 4 para Multiple'],
    ['correct', 'Int', 'Indice de la opcion correcta (0, 1, 2 o 3)'],
    ['explicacion', 'String', 'Explicacion de la respuesta correcta (default: vacio)'],
]
t = Table(question_data, colWidths=[3.5*cm, 3.5*cm, 10*cm])
t.setStyle(table_header(question_data, [3.5*cm, 3.5*cm, 10*cm]))
story.append(t)

# ── MODELO: Attempt ───────────────────────────────────────────────────────
story.append(Paragraph("3.6 Attempt — Intentos", h2_style))
story.append(Paragraph("Registra cada vez que un estudiante completa un cuestionario.", body_style))
story.append(Spacer(1, 0.2*cm))
attempt_data = [
    ['Campo', 'Tipo', 'Descripcion'],
    ['id', 'String (cuid)', 'Identificador unico autogenerado'],
    ['userId', 'String?', 'FK a User — puede ser null si el usuario fue borrado'],
    ['cuestionarioId', 'String', 'FK a Cuestionario'],
    ['materiaSlug', 'String', 'Slug de la materia (cacheado para no joinear)'],
    ['formato', 'Enum Formato', 'Formato del cuestionario al momento del intento'],
    ['score', 'Int', 'Cantidad de respuestas correctas'],
    ['total', 'Int', 'Total de preguntas del intento'],
    ['completedAt', 'DateTime', 'Cuando se completo el intento'],
]
t = Table(attempt_data, colWidths=[3.5*cm, 3.5*cm, 10*cm])
t.setStyle(table_header(attempt_data, [3.5*cm, 3.5*cm, 10*cm]))
story.append(t)
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Relaciones: pertenece a un User y a un Cuestionario. Tiene muchos AnswerLogs.", note_style))

# ── MODELO: AnswerLog ─────────────────────────────────────────────────────
story.append(Paragraph("3.7 AnswerLog — Respuestas individuales", h2_style))
story.append(Paragraph("Guarda la respuesta de cada pregunta dentro de un intento. Permite ver el detalle pregunta por pregunta.", body_style))
story.append(Spacer(1, 0.2*cm))
log_data = [
    ['Campo', 'Tipo', 'Descripcion'],
    ['id', 'String (cuid)', 'Identificador unico autogenerado'],
    ['attemptId', 'String', 'FK a Attempt'],
    ['questionId', 'String', 'ID de la pregunta respondida'],
    ['selected', 'Int', 'Indice de la opcion que eligio el estudiante'],
    ['correct', 'Boolean', 'Si la respuesta fue correcta o no'],
]
t = Table(log_data, colWidths=[3.5*cm, 3.5*cm, 10*cm])
t.setStyle(table_header(log_data, [3.5*cm, 3.5*cm, 10*cm]))
story.append(t)

# ── RELACIONES ────────────────────────────────────────────────────────────
story.append(hr())
story.append(Paragraph("4. Diagrama de relaciones", h1_style))
story.append(Spacer(1, 0.2*cm))

rel_data = [
    ['Desde', 'Relacion', 'Hacia', 'Detalle'],
    ['User', 'pertenece a', 'Carrera', 'Un usuario tiene una carrera (opcional)'],
    ['Carrera', 'muchos a muchos', 'Materia', 'Una carrera tiene varias materias y viceversa'],
    ['Cuestionario', 'pertenece a', 'Materia', 'Cada cuestionario es de una materia'],
    ['Cuestionario', 'pertenece a', 'User', 'Cada cuestionario tiene un autor (docente)'],
    ['Question', 'pertenece a', 'Cuestionario', 'Cascade: se borra con el cuestionario'],
    ['Attempt', 'pertenece a', 'User', 'SetNull: si se borra el usuario, queda sin dueno'],
    ['Attempt', 'pertenece a', 'Cuestionario', 'Cascade: se borra con el cuestionario'],
    ['AnswerLog', 'pertenece a', 'Attempt', 'Cascade: se borra con el intento'],
]
t = Table(rel_data, colWidths=[3*cm, 3.5*cm, 3.5*cm, 7*cm])
t.setStyle(table_header(rel_data, [3*cm, 3.5*cm, 3.5*cm, 7*cm]))
story.append(t)

# ── SEED ──────────────────────────────────────────────────────────────────
story.append(hr())
story.append(Paragraph("5. Datos iniciales (Seed)", h1_style))
story.append(Paragraph("Al arrancar el proyecto por primera vez se cargan estos datos de prueba:", body_style))
story.append(Spacer(1, 0.3*cm))

seed_data = [
    ['Tipo', 'Cantidad', 'Detalle'],
    ['Carreras', '2', 'instrumentacion, radiologia'],
    ['Materias', '4', 'anatomia-1, anatomia-2, anatomia-3, anatomia-4'],
    ['Usuarios', '7', '1 admin, 2 docentes, 4 estudiantes (2 por carrera)'],
    ['Cuestionarios', '3', 'Uno por materia visible, autoria del primer docente'],
]
t = Table(seed_data, colWidths=[4*cm, 3*cm, 10*cm])
t.setStyle(table_header(seed_data, [4*cm, 3*cm, 10*cm]))
story.append(t)

# ── ENDPOINTS RESUMEN ─────────────────────────────────────────────────────
story.append(hr())
story.append(Paragraph("6. Endpoints REST por modulo", h1_style))

endpoints = [
    ("Auth", [
        ['Metodo', 'Ruta', 'Descripcion'],
        ['POST', '/auth/login', 'Login con email y password. Devuelve JWT + datos del usuario'],
        ['POST', '/auth/logout', 'Invalida la sesion'],
        ['GET', '/auth/me', 'Devuelve el usuario autenticado actual'],
    ]),
    ("Usuarios (solo ADMIN)", [
        ['Metodo', 'Ruta', 'Descripcion'],
        ['GET', '/users', 'Lista usuarios con filtros por rol y carrera'],
        ['POST', '/users', 'Crear nuevo usuario'],
        ['PATCH', '/users/:id', 'Editar usuario'],
        ['DELETE', '/users/:id', 'Borrar usuario'],
    ]),
    ("Cuestionarios", [
        ['Metodo', 'Ruta', 'Descripcion'],
        ['GET', '/cuestionarios', 'Listar (estudiante: solo su carrera / docente: los suyos)'],
        ['GET', '/cuestionarios/:id', 'Ver detalle con preguntas'],
        ['POST', '/cuestionarios', 'Crear (DOCENTE/ADMIN)'],
        ['PATCH', '/cuestionarios/:id', 'Editar (solo el autor o ADMIN)'],
        ['DELETE', '/cuestionarios/:id', 'Borrar (solo el autor o ADMIN)'],
    ]),
    ("Intentos", [
        ['Metodo', 'Ruta', 'Descripcion'],
        ['POST', '/cuestionarios/:id/attempts', 'Enviar respuestas — el backend calcula el score'],
        ['GET', '/attempts', 'Ver historial (estudiante: los suyos / docente: sus cuestionarios)'],
    ]),
]

for name, data in endpoints:
    story.append(Paragraph(name, h2_style))
    t = Table(data, colWidths=[2.5*cm, 5.5*cm, 9*cm])
    t.setStyle(table_header(data, [2.5*cm, 5.5*cm, 9*cm]))
    story.append(t)
    story.append(Spacer(1, 0.3*cm))

doc.build(story)
print(f"PDF generado en: {OUTPUT}")

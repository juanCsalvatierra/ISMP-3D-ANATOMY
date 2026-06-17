from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

OUTPUT = r"C:\Users\54385\Repositorios\ISMP-3D-ANATOMY\backend\docs\cuestionarios_module.pdf"

doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    rightMargin=2.5*cm, leftMargin=2.5*cm,
    topMargin=2.5*cm, bottomMargin=2.5*cm,
)

W, H = A4
styles = getSampleStyleSheet()

# ── Estilos personalizados ───────────────────────────────────────────────────
title_style = ParagraphStyle(
    "CustomTitle",
    parent=styles["Title"],
    fontSize=22,
    leading=28,
    textColor=colors.HexColor("#1a1a2e"),
    spaceAfter=6,
)
subtitle_style = ParagraphStyle(
    "Subtitle",
    parent=styles["Normal"],
    fontSize=11,
    textColor=colors.HexColor("#555555"),
    spaceAfter=4,
    alignment=TA_CENTER,
)
h1_style = ParagraphStyle(
    "H1",
    parent=styles["Heading1"],
    fontSize=15,
    textColor=colors.HexColor("#1a1a2e"),
    spaceBefore=18,
    spaceAfter=6,
    borderPad=4,
)
h2_style = ParagraphStyle(
    "H2",
    parent=styles["Heading2"],
    fontSize=12,
    textColor=colors.HexColor("#2d4a7a"),
    spaceBefore=14,
    spaceAfter=4,
)
body_style = ParagraphStyle(
    "Body",
    parent=styles["Normal"],
    fontSize=10,
    leading=15,
    spaceAfter=6,
    alignment=TA_JUSTIFY,
)
code_style = ParagraphStyle(
    "Code",
    parent=styles["Code"],
    fontSize=8.5,
    leading=13,
    backColor=colors.HexColor("#f4f4f8"),
    borderColor=colors.HexColor("#ccccdd"),
    borderWidth=0.5,
    borderPad=8,
    fontName="Courier",
    spaceAfter=8,
    spaceBefore=4,
)
note_style = ParagraphStyle(
    "Note",
    parent=styles["Normal"],
    fontSize=9.5,
    leading=14,
    backColor=colors.HexColor("#fff8e1"),
    borderColor=colors.HexColor("#f0a500"),
    borderWidth=1,
    borderPad=8,
    spaceAfter=10,
    spaceBefore=4,
    leftIndent=4,
)
change_style = ParagraphStyle(
    "Change",
    parent=styles["Normal"],
    fontSize=9.5,
    leading=14,
    backColor=colors.HexColor("#e8f5e9"),
    borderColor=colors.HexColor("#4caf50"),
    borderWidth=1,
    borderPad=8,
    spaceAfter=10,
    spaceBefore=4,
    leftIndent=4,
)
label_style = ParagraphStyle(
    "Label",
    parent=styles["Normal"],
    fontSize=8,
    textColor=colors.white,
    fontName="Helvetica-Bold",
)

def hr():
    return HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cccccc"), spaceAfter=6, spaceBefore=2)

def h1(text):
    return Paragraph(text, h1_style)

def h2(text):
    return Paragraph(text, h2_style)

def body(text):
    return Paragraph(text, body_style)

def code(text):
    # Escapar caracteres XML
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return Paragraph(f'<font name="Courier">{text}</font>', code_style)

def note(text):
    return Paragraph(f"<b>Nota:</b> {text}", note_style)

def change(text):
    return Paragraph(f"<b>Cambio introducido:</b> {text}", change_style)

def sp(n=1):
    return Spacer(1, n * 0.35 * cm)

# ── Tabla de endpoints ───────────────────────────────────────────────────────
def endpoint_table():
    header = ["Metodo", "Ruta", "Guard JWT", "Roles requeridos", "Descripcion"]
    rows = [
        ["GET",    "/cuestionarios",      "Si", "Cualquier rol",       "Lista de cuestionarios (filtro opcional por materiaId)"],
        ["GET",    "/cuestionarios/:id",  "Si", "Cualquier rol",       "Detalle del cuestionario con preguntas ordenadas"],
        ["POST",   "/cuestionarios",      "Si", "DOCENTE, ADMIN",      "Crea cuestionario con preguntas anidadas"],
        ["PATCH",  "/cuestionarios/:id",  "Si", "DOCENTE, ADMIN",      "Actualiza. Reemplaza todas las preguntas si se envian"],
        ["DELETE", "/cuestionarios/:id",  "Si", "DOCENTE, ADMIN",      "Elimina. Solo el autor o ADMIN pueden borrar"],
    ]

    method_colors = {
        "GET":    colors.HexColor("#1976d2"),
        "POST":   colors.HexColor("#388e3c"),
        "PATCH":  colors.HexColor("#f57c00"),
        "DELETE": colors.HexColor("#d32f2f"),
    }

    table_data = [
        [Paragraph(f"<b>{h}</b>", ParagraphStyle("th", parent=styles["Normal"],
            fontSize=9, textColor=colors.white, fontName="Helvetica-Bold"))
         for h in header]
    ]

    for row in rows:
        method = row[0]
        color = method_colors.get(method, colors.grey)
        method_cell = Paragraph(
            f'<font color="white"><b>{method}</b></font>',
            ParagraphStyle("mc", parent=styles["Normal"], fontSize=8.5,
                           fontName="Helvetica-Bold", alignment=TA_CENTER)
        )
        table_data.append([
            method_cell,
            Paragraph(f'<font name="Courier" size="8">{row[1]}</font>', styles["Normal"]),
            Paragraph(row[2], ParagraphStyle("c", parent=styles["Normal"], fontSize=9, alignment=TA_CENTER)),
            Paragraph(row[3], ParagraphStyle("r", parent=styles["Normal"], fontSize=9)),
            Paragraph(row[4], ParagraphStyle("d", parent=styles["Normal"], fontSize=9)),
        ])

    t = Table(table_data, colWidths=[1.5*cm, 4.2*cm, 1.8*cm, 3.2*cm, 5.3*cm])

    method_bg = {
        2: colors.HexColor("#1976d2"),
        3: colors.HexColor("#388e3c"),
        4: colors.HexColor("#f57c00"),
        5: colors.HexColor("#d32f2f"),
        6: colors.HexColor("#d32f2f"),
    }

    style_cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a1a2e")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7f7fb")]),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cccccc")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]

    for row_i, bg_color in method_bg.items():
        if row_i - 1 < len(table_data):
            style_cmds.append(("BACKGROUND", (0, row_i - 1), (0, row_i - 1), bg_color))

    t.setStyle(TableStyle(style_cmds))
    return t

# ── Tabla de autorizacion ────────────────────────────────────────────────────
def auth_table():
    data = [
        [Paragraph("<b>Capa</b>", ParagraphStyle("h", parent=styles["Normal"], fontSize=9, textColor=colors.white, fontName="Helvetica-Bold")),
         Paragraph("<b>Responsable</b>", ParagraphStyle("h", parent=styles["Normal"], fontSize=9, textColor=colors.white, fontName="Helvetica-Bold")),
         Paragraph("<b>Que verifica</b>", ParagraphStyle("h", parent=styles["Normal"], fontSize=9, textColor=colors.white, fontName="Helvetica-Bold")),
         Paragraph("<b>Si falla</b>", ParagraphStyle("h", parent=styles["Normal"], fontSize=9, textColor=colors.white, fontName="Helvetica-Bold"))],
        ["1 - HTTP", "JwtGuard + RolesGuard", "Token valido y rol suficiente", "401 / 403 inmediato"],
        ["2 - Negocio", "CuestionariosService", "Es el autor del cuestionario o es ADMIN", "ForbiddenException (403)"],
    ]
    t = Table(data, colWidths=[2.5*cm, 4.5*cm, 6.5*cm, 3.5*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2d4a7a")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7f7fb")]),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cccccc")),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return t

# ── STORY ────────────────────────────────────────────────────────────────────
story = []

# Portada
story.append(sp(2))
story.append(Paragraph("Modulo Cuestionarios", title_style))
story.append(Paragraph("Documentacion tecnica — ISMP 3D Anatomy Backend (NestJS)", subtitle_style))
story.append(Paragraph("Fecha: 16 de junio de 2026", subtitle_style))
story.append(sp(1))
story.append(hr())
story.append(sp(2))

# 1. Descripcion general
story.append(h1("1. Descripcion general"))
story.append(body(
    "El modulo <b>CuestionariosModule</b> es el nucleo academico del backend. "
    "Gestiona la creacion, consulta, actualizacion y eliminacion de cuestionarios de anatomia, "
    "junto con sus preguntas anidadas. Esta construido sobre NestJS con Prisma ORM y expone "
    "una API REST bajo el prefijo <font name='Courier'>/cuestionarios</font>."
))
story.append(sp())

story.append(h2("Archivos del modulo"))
files_data = [
    [Paragraph("<b>Archivo</b>", ParagraphStyle("h", parent=styles["Normal"], fontSize=9, textColor=colors.white, fontName="Helvetica-Bold")),
     Paragraph("<b>Responsabilidad</b>", ParagraphStyle("h", parent=styles["Normal"], fontSize=9, textColor=colors.white, fontName="Helvetica-Bold"))],
    ["cuestionarios.module.ts",    "Declara e importa el modulo en NestJS"],
    ["cuestionarios.controller.ts","Define los endpoints HTTP y aplica guards"],
    ["cuestionarios.service.ts",   "Logica de negocio y acceso a la base de datos via Prisma"],
    ["dto/create-cuestionario.dto.ts", "Forma esperada del body para crear un cuestionario"],
    ["dto/update-cuestionario.dto.ts", "Forma esperada del body para actualizar (campos opcionales)"],
]
ft = Table(files_data, colWidths=[7*cm, 9*cm])
ft.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a1a2e")),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7f7fb")]),
    ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cccccc")),
    ("FONTSIZE", (0, 1), (-1, -1), 9),
    ("TOPPADDING", (0, 0), (-1, -1), 5),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
]))
story.append(ft)
story.append(sp())

# 2. Cambios introducidos
story.append(hr())
story.append(h1("2. Cambios introducidos en esta sesion"))

story.append(h2("2.1 Guards movidos al nivel de clase"))
story.append(body(
    "Originalmente, los endpoints <b>GET /cuestionarios</b> y <b>GET /cuestionarios/:id</b> "
    "eran publicos (sin guards), permitiendo el acceso sin autenticacion. "
    "Los endpoints de escritura (POST, PATCH, DELETE) si tenian los guards declarados "
    "individualmente en cada metodo."
))
story.append(change(
    "Se movio <font name='Courier'>@UseGuards(JwtGuard, RolesGuard)</font> al nivel del "
    "decorador de clase <font name='Courier'>@Controller</font>, haciendo que todos los "
    "endpoints requieran token JWT valido. Los <font name='Courier'>@Roles</font> se "
    "mantienen en los metodos que los necesitan."
))

story.append(body("Antes del cambio (fragmento):"))
story.append(code(
    "// GET sin guard — cualquiera podia acceder\n"
    "@Get()\n"
    "findAll(@Query('materiaId') materiaId?: string) { ... }\n\n"
    "// POST con guard individual\n"
    "@UseGuards(JwtGuard, RolesGuard)\n"
    "@Roles(Role.DOCENTE, Role.ADMIN)\n"
    "@Post()\n"
    "create(...) { ... }"
))

story.append(body("Despues del cambio:"))
story.append(code(
    "@UseGuards(JwtGuard, RolesGuard)   // aplica a TODOS los endpoints\n"
    "@Controller('cuestionarios')\n"
    "export class CuestionariosController {\n\n"
    "  @Get()                           // solo JWT, sin restriccion de rol\n"
    "  findAll(...) { ... }\n\n"
    "  @Roles(Role.DOCENTE, Role.ADMIN) // JWT + rol (del guard de clase)\n"
    "  @Post()\n"
    "  create(...) { ... }\n"
    "}"
))

story.append(sp())

story.append(h2("2.2 Registro del modulo en AppModule"))
story.append(body(
    "El modulo existia en el sistema de archivos pero no estaba importado en "
    "<font name='Courier'>AppModule</font>, por lo que NestJS no lo cargaba y "
    "los endpoints no estaban disponibles en la API."
))
story.append(change(
    "Se agrego <font name='Courier'>CuestionariosModule</font> al array "
    "<font name='Courier'>imports</font> de <font name='Courier'>AppModule</font>. "
    "A partir de este cambio los endpoints <font name='Courier'>/cuestionarios</font> "
    "estan activos en el servidor."
))

story.append(code(
    "// backend/src/app.module.ts\n"
    "import { CuestionariosModule } from './cuestionarios/cuestionarios.module';\n\n"
    "@Module({\n"
    "  imports: [\n"
    "    ConfigModule.forRoot({ isGlobal: true }),\n"
    "    PrismaModule,\n"
    "    AuthModule,\n"
    "    UsersModule,\n"
    "    CuestionariosModule,  // <-- agregado\n"
    "  ],\n"
    "})\n"
    "export class AppModule {}"
))

story.append(sp())

# 3. Endpoints
story.append(hr())
story.append(h1("3. Endpoints disponibles"))
story.append(body(
    "Todos los endpoints requieren token JWT valido (Bearer token en el header "
    "<font name='Courier'>Authorization</font>). Los endpoints de escritura ademas "
    "exigen rol <b>DOCENTE</b> o <b>ADMIN</b>."
))
story.append(sp(0.5))
story.append(endpoint_table())
story.append(sp())

# 4. Modelo de autorizacion
story.append(hr())
story.append(h1("4. Modelo de autorizacion en dos capas"))
story.append(body(
    "El modulo implementa autorizacion en dos niveles independientes para separar "
    "la responsabilidad de validacion HTTP de la logica de negocio:"
))
story.append(sp(0.5))
story.append(auth_table())
story.append(sp())
story.append(note(
    "El guard de roles solo verifica si el usuario tiene un rol suficiente para "
    "intentar la operacion. La verificacion de ownership (si el docente es el autor "
    "del cuestionario que quiere modificar) la hace el service, no el guard."
))

# 5. Logica del service
story.append(hr())
story.append(h1("5. Logica clave del CuestionariosService"))

story.append(h2("5.1 Creacion con preguntas anidadas"))
story.append(body(
    "Al crear un cuestionario, las preguntas se insertan en la misma operacion Prisma "
    "usando la relacion anidada <font name='Courier'>preguntas.create</font>. "
    "Esto garantiza atomicidad: si alguna pregunta falla, el cuestionario tampoco se crea."
))
story.append(code(
    "prisma.cuestionario.create({\n"
    "  data: {\n"
    "    titulo, descripcion, materiaId, formato, autorId,\n"
    "    preguntas: {\n"
    "      create: dto.preguntas.map((p, i) => ({\n"
    "        orden: i, texto: p.texto, opciones: p.opciones,\n"
    "        correct: p.correcta, explicacion: p.explicacion ?? '',\n"
    "      })),\n"
    "    },\n"
    "  },\n"
    "})"
))

story.append(h2("5.2 Actualizacion con replace-all de preguntas"))
story.append(body(
    "Si el DTO de actualizacion incluye el campo <font name='Courier'>preguntas</font>, "
    "la estrategia es <b>reemplazar todas</b>: primero se borran las preguntas actuales "
    "con <font name='Courier'>deleteMany: {}</font> y luego se crean las nuevas. "
    "No existe edicion granular por pregunta individual."
))
story.append(code(
    "preguntas: {\n"
    "  deleteMany: {},   // borra todas las preguntas actuales\n"
    "  create: preguntas.map((p, i) => ({ orden: i, ...p })),\n"
    "}"
))
story.append(note(
    "Esta estrategia simplifica el codigo pero invalida cualquier "
    "<font name='Courier'>attemptId</font> o log que referenciara preguntas anteriores "
    "por su ID. A considerar cuando se implemente el modulo de intentos (Attempt)."
))

story.append(h2("5.3 Verificacion de ownership"))
story.append(body(
    "Tanto en <b>update</b> como en <b>remove</b>, el service verifica existencia "
    "primero y luego ownership antes de ejecutar la operacion:"
))
story.append(code(
    "if (existing.autorId !== requesterId && requesterRole !== Role.ADMIN) {\n"
    "  throw new ForbiddenException(\n"
    "    'Solo el autor o un administrador puede modificar este cuestionario',\n"
    "  );\n"
    "}"
))

# 6. Estado del modulo
story.append(hr())
story.append(h1("6. Estado actual del modulo"))

status_data = [
    [Paragraph("<b>Aspecto</b>", ParagraphStyle("h", parent=styles["Normal"], fontSize=9, textColor=colors.white, fontName="Helvetica-Bold")),
     Paragraph("<b>Estado</b>", ParagraphStyle("h", parent=styles["Normal"], fontSize=9, textColor=colors.white, fontName="Helvetica-Bold")),
     Paragraph("<b>Notas</b>", ParagraphStyle("h", parent=styles["Normal"], fontSize=9, textColor=colors.white, fontName="Helvetica-Bold"))],
    ["Endpoints CRUD",        "Completo",    "GET, POST, PATCH, DELETE implementados"],
    ["Autenticacion",         "Completo",    "JwtGuard en todos los endpoints"],
    ["Autorizacion por rol",  "Completo",    "RolesGuard + @Roles en escritura"],
    ["Ownership check",       "Completo",    "Validado en service para PATCH y DELETE"],
    ["Registro en AppModule", "Completo",    "Modulo activo en el servidor"],
    ["Modulo Attempts",       "Pendiente",   "Sin controller ni service aun"],
    ["Tests",                 "Pendiente",   "No hay test runner configurado en el proyecto"],
]

st = Table(status_data, colWidths=[4.5*cm, 3*cm, 8.5*cm])
ok_color = colors.HexColor("#e8f5e9")
pending_color = colors.HexColor("#fff3e0")
style_cmds = [
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a1a2e")),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cccccc")),
    ("FONTSIZE", (0, 1), (-1, -1), 9),
    ("TOPPADDING", (0, 0), (-1, -1), 5),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
]
for i, row in enumerate(status_data[1:], start=1):
    bg = pending_color if row[1] == "Pendiente" else ok_color
    style_cmds.append(("BACKGROUND", (1, i), (1, i), bg))
st.setStyle(TableStyle(style_cmds))
story.append(st)

story.append(sp(3))
story.append(hr())
story.append(Paragraph(
    "Documento generado automaticamente — ISMP 3D Anatomy Backend · 2026",
    ParagraphStyle("footer", parent=styles["Normal"], fontSize=8,
                   textColor=colors.grey, alignment=TA_CENTER)
))

doc.build(story)
print(f"PDF generado: {OUTPUT}")

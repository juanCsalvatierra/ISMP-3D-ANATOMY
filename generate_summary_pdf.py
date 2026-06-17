from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER

OUTPUT = "C:/Users/54385/Repositorios/ISMP-3D-ANATOMY/docs/BACKEND_RESUMEN.pdf"

doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    rightMargin=2*cm, leftMargin=2*cm,
    topMargin=2*cm, bottomMargin=2*cm
)

styles = getSampleStyleSheet()

title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=22, textColor=colors.HexColor('#1e293b'), spaceAfter=6)
subtitle_style = ParagraphStyle('Sub', parent=styles['Normal'], fontSize=13, textColor=colors.HexColor('#64748b'), spaceAfter=20)
h1_style = ParagraphStyle('H1', parent=styles['Heading1'], fontSize=15, textColor=colors.HexColor('#0f172a'), spaceBefore=18, spaceAfter=6)
h2_style = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=12, textColor=colors.HexColor('#1e40af'), spaceBefore=12, spaceAfter=4)
h3_style = ParagraphStyle('H3', parent=styles['Heading3'], fontSize=10, textColor=colors.HexColor('#334155'), spaceBefore=8, spaceAfter=4)
body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#475569'), leading=16)
code_style = ParagraphStyle('Code', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor('#1e40af'),
                             backColor=colors.HexColor('#f1f5f9'), fontName='Courier', leading=14,
                             leftIndent=10, rightIndent=10, spaceBefore=4, spaceAfter=4)
note_style = ParagraphStyle('Note', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor('#92400e'),
                              backColor=colors.HexColor('#fef3c7'), leading=14, leftIndent=8, spaceAfter=6)
green_style = ParagraphStyle('Green', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor('#166534'),
                              backColor=colors.HexColor('#dcfce7'), leading=14, leftIndent=8, spaceAfter=6)

def hr():
    return HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceAfter=8, spaceBefore=8)

def table_style():
    return TableStyle([
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

story = []

# ── PORTADA ───────────────────────────────────────────────────────────────────
story.append(Spacer(1, 2*cm))
story.append(Paragraph("ISMP 3D Anatomy — Backend", title_style))
story.append(Paragraph("Resumen de modulos implementados", subtitle_style))
story.append(Paragraph("Stack: NestJS + Prisma + PostgreSQL + JWT", ParagraphStyle('sub2', parent=styles['Normal'], fontSize=11, textColor=colors.HexColor('#94a3b8'), spaceAfter=20)))
story.append(hr())

# ── ARQUITECTURA GENERAL ──────────────────────────────────────────────────────
story.append(Paragraph("1. Arquitectura general", h1_style))
story.append(Paragraph(
    "El backend esta construido con NestJS, un framework para Node.js que organiza el codigo en modulos. "
    "Cada modulo agrupa un controller, un service y sus DTOs. "
    "La base de datos es PostgreSQL y se accede mediante Prisma ORM.",
    body_style))
story.append(Spacer(1, 0.3*cm))

arch_data = [
    ['Capa', 'Que hace', 'Ejemplo'],
    ['Controller', 'Recibe el request HTTP y llama al service', 'AuthController, UsersController'],
    ['Service', 'Contiene la logica de negocio', 'AuthService, UsersService'],
    ['Guard', 'Intercepta el request y verifica permisos', 'JwtGuard, RolesGuard'],
    ['DTO', 'Define y valida los datos del request', 'LoginDto, CreateUserDto'],
    ['Prisma', 'Hace las queries a PostgreSQL', 'prisma.user.findMany()'],
]
t = Table(arch_data, colWidths=[3.5*cm, 7*cm, 6.5*cm])
t.setStyle(table_style())
story.append(t)
story.append(Spacer(1, 0.3*cm))

story.append(Paragraph("Flujo de un request:", h3_style))
story.append(Paragraph(
    "Request HTTP  ->  JwtGuard (token valido?)  ->  RolesGuard (rol correcto?)  ->  Controller  ->  Service  ->  Prisma  ->  PostgreSQL  ->  Response JSON",
    code_style))

story.append(hr())

# ── MODULO PRISMA ─────────────────────────────────────────────────────────────
story.append(Paragraph("2. PrismaModule", h1_style))
story.append(Paragraph(
    "Es el modulo de conexion a la base de datos. Se configura una sola vez y queda disponible en toda la app gracias a @Global().",
    body_style))
story.append(Spacer(1, 0.2*cm))

story.append(Paragraph("Archivos:", h3_style))
prisma_files = [
    ['Archivo', 'Que hace'],
    ['prisma/schema.prisma', 'Define los 7 modelos de la BD (User, Carrera, Materia, Cuestionario, Question, Attempt, AnswerLog)'],
    ['prisma/seed.ts', 'Carga datos iniciales: 2 carreras, 4 materias, 7 usuarios, 2 cuestionarios'],
    ['src/prisma/prisma.service.ts', 'Extiende PrismaClient. Se conecta al iniciar y desconecta al cerrar'],
    ['src/prisma/prisma.module.ts', 'Registra y exporta PrismaService como global'],
]
t = Table(prisma_files, colWidths=[5.5*cm, 11.5*cm])
t.setStyle(table_style())
story.append(t)
story.append(Spacer(1, 0.2*cm))

story.append(Paragraph("Decoradores clave:", h3_style))
story.append(Paragraph("@Global()  ->  hace que PrismaService este disponible en TODOS los modulos sin necesidad de importarlo cada vez", code_style))
story.append(Paragraph("@Injectable()  ->  marca la clase como inyectable por NestJS (patron Singleton)", code_style))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph("Patron de diseno: Singleton — NestJS crea una sola instancia de PrismaService y la comparte en toda la app.", note_style))

story.append(hr())

# ── MODULO AUTH ───────────────────────────────────────────────────────────────
story.append(Paragraph("3. AuthModule", h1_style))
story.append(Paragraph(
    "Maneja la autenticacion del sistema. Genera y verifica tokens JWT. "
    "Tiene dos endpoints publicos y expone los guards para que otros modulos los usen.",
    body_style))
story.append(Spacer(1, 0.2*cm))

story.append(Paragraph("Endpoints:", h3_style))
auth_endpoints = [
    ['Metodo', 'Ruta', 'Descripcion', 'Protegido'],
    ['POST', '/auth/login', 'Recibe email y password. Devuelve JWT + datos del usuario', 'No'],
    ['GET', '/auth/me', 'Devuelve el usuario autenticado a partir del token', 'JwtGuard'],
]
t = Table(auth_endpoints, colWidths=[2*cm, 3.5*cm, 9*cm, 2.5*cm])
t.setStyle(table_style())
story.append(t)
story.append(Spacer(1, 0.2*cm))

story.append(Paragraph("Archivos:", h3_style))
auth_files = [
    ['Archivo', 'Que hace'],
    ['auth.controller.ts', 'Define las rutas POST /auth/login y GET /auth/me'],
    ['auth.service.ts', 'Logica de login (verifica password con bcrypt, genera JWT) y me (busca usuario por id)'],
    ['dto/login.dto.ts', 'Valida que el body tenga email valido y password de tipo string'],
    ['guards/jwt.guard.ts', 'Lee el header Authorization, verifica el token JWT, adjunta el usuario al request'],
    ['guards/roles.guard.ts', 'Lee el decorador @Roles(), verifica que el rol del usuario coincida'],
    ['decorators/user.decorator.ts', 'Extrae el usuario del request de forma limpia con @CurrentUser()'],
    ['decorators/roles.decorator.ts', 'Define @Roles() que etiqueta un endpoint con los roles permitidos'],
]
t = Table(auth_files, colWidths=[5.5*cm, 11.5*cm])
t.setStyle(table_style())
story.append(t)
story.append(Spacer(1, 0.2*cm))

story.append(Paragraph("Decoradores clave:", h3_style))
decorators_auth = [
    ['Decorador', 'Donde se usa', 'Que hace'],
    ['@Controller("auth")', 'AuthController', 'Define que esta clase maneja rutas que empiezan con /auth'],
    ['@Post("login")', 'Metodo login', 'Responde a POST /auth/login'],
    ['@Get("me")', 'Metodo me', 'Responde a GET /auth/me'],
    ['@UseGuards(JwtGuard)', 'Metodo me', 'Ejecuta JwtGuard antes de que llegue al metodo'],
    ['@Body()', 'Parametro dto', 'Lee el JSON del body del request'],
    ['@CurrentUser()', 'Parametro user', 'Extrae el usuario del token ya verificado'],
    ['@Injectable()', 'Guards y Services', 'Marca la clase como inyectable por NestJS'],
]
t = Table(decorators_auth, colWidths=[4.5*cm, 3.5*cm, 9*cm])
t.setStyle(table_style())
story.append(t)
story.append(Spacer(1, 0.2*cm))

story.append(Paragraph("Patrones de diseno: Proxy (JwtGuard intercepta requests), Chain of Responsibility (guards en cadena), Singleton (services).", note_style))

story.append(hr())

# ── MODULO USERS ──────────────────────────────────────────────────────────────
story.append(Paragraph("4. UsersModule", h1_style))
story.append(Paragraph(
    "CRUD completo de usuarios. Solo accesible por el rol ADMIN. "
    "Aplica JwtGuard y RolesGuard en toda la clase del controller.",
    body_style))
story.append(Spacer(1, 0.2*cm))

story.append(Paragraph("Endpoints:", h3_style))
users_endpoints = [
    ['Metodo', 'Ruta', 'Descripcion', 'Rol requerido'],
    ['GET', '/users', 'Lista todos los usuarios. Filtros: ?role= y ?carreraId=', 'ADMIN'],
    ['GET', '/users/:id', 'Ver datos de un usuario especifico', 'ADMIN'],
    ['POST', '/users', 'Crear usuario nuevo. Hashea la password automaticamente', 'ADMIN'],
    ['PATCH', '/users/:id', 'Editar campos del usuario. Si viene password la hashea', 'ADMIN'],
    ['DELETE', '/users/:id', 'Borrar usuario', 'ADMIN'],
]
t = Table(users_endpoints, colWidths=[2*cm, 3.5*cm, 7.5*cm, 4*cm])
t.setStyle(table_style())
story.append(t)
story.append(Spacer(1, 0.2*cm))

story.append(Paragraph("Archivos:", h3_style))
users_files = [
    ['Archivo', 'Que hace'],
    ['users.controller.ts', 'Define los 5 endpoints. Aplica guards y roles en toda la clase'],
    ['users.service.ts', 'Logica de cada operacion. Verifica email duplicado, hashea passwords, nunca devuelve passwordHash'],
    ['dto/create-user.dto.ts', 'Valida: name (string), email (email valido), password (min 6 chars), role (enum), carreraId (opcional)'],
    ['dto/update-user.dto.ts', 'Igual que create pero todos los campos son opcionales (?)'],
    ['users.module.ts', 'Registra el modulo e importa AuthModule para usar los guards'],
]
t = Table(users_files, colWidths=[5.5*cm, 11.5*cm])
t.setStyle(table_style())
story.append(t)
story.append(Spacer(1, 0.2*cm))

story.append(Paragraph("Decoradores clave:", h3_style))
decorators_users = [
    ['Decorador', 'Donde se usa', 'Que hace'],
    ['@UseGuards(JwtGuard, RolesGuard)', 'Clase UsersController', 'Protege TODOS los endpoints del controller'],
    ['@Roles(Role.ADMIN)', 'Clase UsersController', 'Solo ADMIN puede acceder a cualquier endpoint'],
    ['@Get()', '@Post()', '@Patch(":id")', '@Delete(":id")', 'Metodos del controller', 'Define el metodo HTTP y la ruta'],
    ['@Param("id")', 'Parametros', 'Lee el :id de la URL (ej: /users/abc123)'],
    ['@Query("role")', 'Parametros', 'Lee los query params de la URL (ej: ?role=DOCENTE)'],
    ['@IsString(), @IsEmail(), @IsEnum(), @MinLength()', 'DTOs', 'Validan los campos del body automaticamente'],
    ['@IsOptional()', 'DTOs', 'Marca el campo como no obligatorio'],
]
t = Table(decorators_users, colWidths=[5.5*cm, 3.5*cm, 8*cm])
t.setStyle(table_style())
story.append(t)

story.append(hr())

# ── SEGURIDAD ─────────────────────────────────────────────────────────────────
story.append(Paragraph("5. Niveles de seguridad implementados", h1_style))

story.append(Paragraph("5.1 Autenticacion con JWT", h2_style))
story.append(Paragraph(
    "Cuando el usuario hace login el backend genera un JWT firmado con una clave secreta (JWT_SECRET). "
    "El token contiene: id del usuario, email y rol. Dura 12 horas.",
    body_style))
story.append(Paragraph("Token = datos_del_usuario + firma_con_JWT_SECRET  ->  si alguien lo modifica la firma no coincide y es rechazado", code_style))

story.append(Paragraph("5.2 Autorizacion por roles", h2_style))
story.append(Paragraph(
    "Cada endpoint tiene un nivel de acceso definido por @Roles(). "
    "El RolesGuard verifica que el rol del token coincida con el requerido.",
    body_style))
story.append(Spacer(1, 0.2*cm))

security_data = [
    ['Situacion', 'Respuesta', 'Codigo HTTP'],
    ['Request sin token', 'Token no encontrado', '401 Unauthorized'],
    ['Token invalido o expirado', 'Token invalido o expirado', '401 Unauthorized'],
    ['Token valido pero rol incorrecto', 'No tenes permiso para realizar esta accion', '403 Forbidden'],
    ['Email o password incorrecto en login', 'Credenciales incorrectas', '401 Unauthorized'],
    ['Email ya en uso al crear usuario', 'El email ya esta en uso', '409 Conflict'],
    ['Usuario no encontrado por ID', 'Usuario con id X no encontrado', '404 Not Found'],
    ['Datos invalidos en el body', 'Lista de errores de validacion', '400 Bad Request'],
]
t = Table(security_data, colWidths=[6*cm, 6.5*cm, 4.5*cm])
t.setStyle(table_style())
story.append(t)
story.append(Spacer(1, 0.2*cm))

story.append(Paragraph("5.3 Proteccion de datos sensibles", h2_style))
security_points = [
    "Passwords hasheadas con bcrypt (factor 10) — nunca se guardan en texto plano",
    "passwordHash nunca se devuelve en ninguna respuesta (uso de select en Prisma)",
    "JWT_SECRET en variable de entorno .env — nunca en el codigo",
    "ValidationPipe con whitelist:true — campos extra del body son ignorados automaticamente",
    "Emails unicos — no se puede registrar dos usuarios con el mismo email",
]
for point in security_points:
    story.append(Paragraph(f"+ {point}", green_style))

story.append(hr())

# ── RESUMEN DE RUTAS ──────────────────────────────────────────────────────────
story.append(Paragraph("6. Todas las rutas disponibles", h1_style))

all_routes = [
    ['Metodo', 'Ruta', 'Descripcion', 'Acceso'],
    ['POST', '/auth/login', 'Login con email y password', 'Publico'],
    ['GET', '/auth/me', 'Usuario autenticado actual', 'Token JWT'],
    ['GET', '/users', 'Listar usuarios (filtros: ?role, ?carreraId)', 'ADMIN'],
    ['GET', '/users/:id', 'Ver un usuario', 'ADMIN'],
    ['POST', '/users', 'Crear usuario', 'ADMIN'],
    ['PATCH', '/users/:id', 'Editar usuario', 'ADMIN'],
    ['DELETE', '/users/:id', 'Borrar usuario', 'ADMIN'],
]
t = Table(all_routes, colWidths=[2*cm, 4.5*cm, 7.5*cm, 3*cm])
t.setStyle(table_style())
story.append(t)
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("Proximos modulos a implementar: Cuestionarios (DOCENTE/ADMIN) e Intentos (ESTUDIANTE).", note_style))

doc.build(story)
print(f"PDF generado en: {OUTPUT}")

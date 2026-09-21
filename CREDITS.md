# Créditos y licencias de contenido de terceros

Este documento detalla el origen y las condiciones de licencia de los activos de
terceros utilizados en **ISMP Anatomy** (modelos 3D, textos anatómicos e imágenes).
El código fuente de la aplicación es propiedad del equipo del ISMP; este archivo
cubre únicamente el **contenido** incorporado desde fuentes externas.

> **Resumen para el equipo:** todo el contenido anatómico de base
> (mallas 3D + textos) está bajo licencias **CC BY-SA** (Creative Commons
> Atribución – Compartir Igual). Esto obliga a: (1) **atribuir** a los autores
> originales, y (2) **licenciar bajo los mismos términos** cualquier obra
> derivada que se distribuya (mallas modificadas, textos adaptados, datasets
> derivados). Ver [Implicaciones prácticas](#implicaciones-prácticas).

---

## 1. Modelos 3D — `public/models/*.glb`

| Archivo | Sistema |
|---|---|
| `skeleton.glb` | Esqueleto |
| `muscles.glb` | Sistema muscular |
| `muscular_insertions.glb` | Inserciones musculares |
| `organs.glb` | Órganos / vísceras |
| `nervous.glb` | Sistema nervioso |
| `cardiovascular.glb` | Sistema cardiovascular |
| `lymph.glb` | Sistema linfático |
| `joints.glb` | Articulaciones y ligamentos |
| `skin.glb` | Piel / regiones de superficie |

### Fuente primaria: Z-Anatomy

- **Proyecto:** Z-Anatomy — atlas anatómico interactivo y open-source construido en Blender.
- **Sitio:** <https://www.z-anatomy.com/>
- **Repositorio:** <https://gitlab.com/LluciferMS/z-anatomy>
- **Autor / mantenedor:** LluciferMS y colaboradores.
- **Licencia:** **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**
  — <https://creativecommons.org/licenses/by-sa/4.0/>

Los archivos `.glb` de este repositorio se obtuvieron exportando las colecciones
del archivo `.blend` de Z-Anatomy mediante el exportador **Khronos glTF Blender I/O**.
Se conservan las convenciones de nomenclatura de Z-Anatomy:

- Sufijos `.r` / `.l` para estructuras pares (lado derecho / izquierdo).
- Nodos de agrupación numerados (`2: Muscular insertions`, `4: Muscular system`,
  `6: Lymphoid organs`, `8: Visceral systems`, …) correspondientes a las
  *colecciones* del proyecto original.
- Nombres de estructuras en inglés según la **Terminologia Anatomica**.

### Fuente secundaria (upstream de Z-Anatomy): BodyParts3D / Anatomography

Z-Anatomy deriva su geometría de **BodyParts3D**, la base de datos de modelos
anatómicos 3D del cuerpo humano.

- **Proyecto:** BodyParts3D / Anatomography
- **Responsable:** The Database Center for Life Science (DBCLS), Research
  Organization of Information and Systems (ROIS) — Universidad de Tokio, Japón.
- **Sitio:** <https://lifesciencedb.jp/bp3d/> · <https://dbcls.rois.ac.jp/>
- **Licencia:** **Creative Commons Attribution-ShareAlike 2.1 Japan (CC BY-SA 2.1 JP)**
  — <https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en>
- **Cita académica sugerida por los autores:**
  > Mitsuhashi N, Fujieda K, Tamura T, Kawamoto S, Takagi T, Okubo K.
  > *BodyParts3D: 3D structure database for anatomical concepts.*
  > Nucleic Acids Research. 2009 Jan;37(Database issue):D782-5.

### Texto de atribución recomendado (UI / "Acerca de")

> Modelos anatómicos 3D basados en **Z-Anatomy** (CC BY-SA 4.0,
> https://www.z-anatomy.com), derivado de **BodyParts3D**, © The Database Center
> for Life Science (DBCLS), licenciado bajo CC BY-SA 2.1 Japón.
> Modelos modificados (reexportados a glTF, materiales y agrupaciones ajustados)
> para ISMP Anatomy y distribuidos bajo CC BY-SA 4.0.

---

## 2. Textos anatómicos — `app/data/*.json`

### `anatomy.final.builded.json`

- **Contenido:** descripciones anatómicas por estructura (campo `sections[].content`).
- **Fuente:** artículos de **Wikipedia en inglés**, traducidos automáticamente al
  español. El origen de cada entrada está registrado en el campo `source` de
  cada nodo (p. ej. `"source": "https://en.wikipedia.org/wiki/Pectoralis_major"`).
  El archivo contiene ~2.640 referencias a `en.wikipedia.org`.
- Algunos fragmentos provienen de la **documentación de Z-Anatomy** (instrucciones
  de uso de "Secciones transversales", etc.).
- **Licencia:** el texto de Wikipedia está bajo
  **Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0)**
  y **GFDL**. Requiere atribución a "Wikipedia y sus colaboradores" y enlace a
  la licencia. Ver <https://en.wikipedia.org/wiki/Wikipedia:Reusing_Wikipedia_content>.

### `anatomy.skeleton.json`

- **Contenido:** descripciones ampliadas del esqueleto.
- **Fuente:** contenido mayormente **redactado por el equipo del ISMP**
  (`"source": ""`). ~84 entradas citan artículos de Wikipedia en inglés en el
  campo `source` y deben tratarse bajo CC BY-SA 4.0 (ver arriba).

### `imaging-studies.json`

- **Contenido:** catálogo de estudios de imagen (metadatos: título, tipo,
  estructuras vinculadas, notas clínicas). **No contiene imágenes** — el visor
  (`app/imaging/`) renderiza placeholders SVG. Metadatos y notas clínicas
  redactados por el equipo del ISMP.

### Texto de atribución recomendado (UI / "Acerca de")

> Descripciones anatómicas adaptadas de **Wikipedia** (colaboradores de
> Wikipedia), disponibles bajo CC BY-SA 4.0. Contenido adicional redactado por
> el equipo docente del ISMP.

---

## 3. Imágenes médicas (radiografías, TC, etc.)

**Actualmente el proyecto no incorpora ninguna imagen médica real.** El visor de
"Imágenes Médicas" utiliza marcadores de posición (SVG generados en el cliente).

Cuando se agreguen imágenes reales, **cada archivo debe documentarse en la
sección 4 de este archivo** con: fuente, autor, URL, licencia y fecha de
obtención. Fuentes con licencia compatible con uso educativo:

| Fuente | Contenido | Licencia |
|---|---|---|
| Radiopaedia (casos marcados "CC") | Rx, TC, RM | CC BY-NC-SA 3.0 (no comercial) |
| The Cancer Imaging Archive (TCIA) | Series DICOM | CC BY 3.0 / 4.0 |
| Wikimedia Commons — categorías de radiología | Rx, TC sueltas | CC BY-SA / dominio público |
| NLM Visible Human Project | Cortes anatómicos, TC, RM | Uso libre (requiere registro) |
| OpenStax *Anatomy & Physiology* | Ilustraciones de órganos | CC BY 4.0 |

> ⚠️ Nunca usar imágenes de pacientes reales sin anonimizar ni sin verificar
> licencia. Evitar fuentes con licencia "todos los derechos reservados".

---

## 4. Registro de imágenes incorporadas

_(vacío — completar a medida que se agreguen imágenes)_

| Archivo | Descripción | Fuente / URL | Autor | Licencia | Fecha obtención |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

---

## Implicaciones prácticas

Al estar el contenido de base bajo **CC BY-SA**, el equipo debe:

1. **Atribuir** de forma visible en la aplicación (pantalla "Acerca de" / pie de
   página / créditos): Z-Anatomy, BodyParts3D (DBCLS) y Wikipedia, con enlace a
   las licencias correspondientes.
2. **Compartir igual (ShareAlike):** si se distribuyen versiones modificadas de
   las mallas o de los textos (por ejemplo, publicando los `.glb` editados o un
   dataset derivado), esos archivos deben licenciarse bajo **CC BY-SA 4.0**.
   El "ShareAlike" aplica al contenido derivado, **no obliga** a liberar el
   código de la aplicación bajo CC BY-SA.
3. **Conservar los avisos de licencia:** mantener este archivo y
   `public/models/LICENSE` en el repositorio y en cualquier distribución.
4. **Compatibilidad de versiones:** BodyParts3D es CC BY-SA 2.1 JP; las obras
   derivadas pueden re-licenciarse bajo CC BY-SA 4.0 (permitido por la cláusula
   de "versiones posteriores" de Creative Commons).
5. **Uso comercial:** CC BY-SA permite uso comercial. Pero si se incorporan
   imágenes de Radiopaedia u otras fuentes **NC (no comercial)**, la
   distribución del conjunto queda restringida a uso no comercial.

---

_Última actualización: 2026-09-01._
_Si detectás una atribución faltante o incorrecta, abrí un issue en el repositorio._

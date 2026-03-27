# Claude Code — Reglas del proyecto backoffice-rrhh

## Parámetros opcionales en llamadas a la API (safe-action)

`next-safe-action` serializa `null` y `undefined` como `"$undefined"` en el protocolo de React Server Actions. El backend recibe el string literal `"$undefined"` y falla con 400.

**Regla:** si un parámetro no tiene valor, **no incluirlo en el objeto** usando spread condicional. Nunca pasar `null` ni `undefined` explícitamente a un `execute()` de safe-action.

```typescript
// Correcto — el campo se omite si no hay valor
execute({
  ...(filters.nombre && { fullName: filters.nombre }),
  ...(filters.codigo && { code: Number(filters.codigo) }),
  page: filters.page - 1,
  size: filters.pageSize,
});

// Evitar — safe-action serializa null/undefined como "$undefined"
execute({
  fullName: filters.nombre || null,
  code: filters.codigo ? Number(filters.codigo) : undefined,
});
```

- En schemas Zod usar `.nullish()` para que la validación acepte campos ausentes.
- Para GET con `params` de axios, omitir el campo sigue siendo correcto (axios ignora `undefined` en query params).

## Validaciones de campos numéricos en selects (Zod)

Los selects de Radix/shadcn envían `undefined` cuando no hay selección. `z.number()` sin `.coerce` convierte `undefined` a NaN y muestra "Expected number, received nan".

**Regla:** siempre usar `z.coerce.number()` con `invalid_type_error` en campos de select numéricos requeridos, y agregar `.min(1)` para asegurar que no pase el valor 0 vacío.

```typescript
// Correcto
fieldId: z.coerce
  .number({
    required_error: "El campo es requerido",
    invalid_type_error: "El campo es requerido",
  })
  .min(1, "El campo es requerido"),

// Evitar — z.number() sin coerce lanza "Expected number, received nan"
fieldId: z.number({ required_error: "El campo es requerido" }),
```

## Restricción de caracteres en inputs de filtro

Los inputs de filtro deben restringir caracteres directamente en el `onChange` usando las helpers de `@/utils/inputHelpers`:

```typescript
import { filterLettersOnly, filterDigitsOnly, filterIpAddress, filterPhone } from "@/utils/inputHelpers";

// Campos de nombre/texto
onChange={(e) => setName(filterLettersOnly(e.target.value))}

// Campos de ID numérico
onChange={(e) => setId(filterDigitsOnly(e.target.value))}

// Dirección IP
onChange={(e) => setIpAddress(filterIpAddress(e.target.value))}

// Teléfono (formato XXXX-XXXX)
onChange={(e) => setPhone(filterPhone(e.target.value))}
```

Funciones disponibles en `src/utils/inputHelpers.ts`:
- `filterLettersOnly` — letras con acentos españoles, espacios, guión, apóstrofe
- `filterDigitsOnly` — solo dígitos
- `filterIpAddress` — dígitos y puntos
- `filterPhone` — dígitos y guión
- `filterAlphanumericDash` — letras, dígitos, espacios, guión, guión bajo, puntos y paréntesis (equivalente a `inputType="alphanumericDash"`)

**Regla de tipos por campo:**
- Campos de nombre (`name`) → `filterLettersOnly`
- Campos de descripción (`description`) → `filterLettersOnly`
- Campos de código (`code`) → `filterAlphanumericDash` (pueden contener letras y números)
- Campos de serie/modelo/marca → `filterAlphanumericDash`
- Campos de ID numérico → `filterDigitsOnly` (**ver regla abajo: los IDs no deben mostrarse en filtros ni tablas**)

## IDs en tablas y filtros

**Regla:** **nunca** mostrar el campo `id` en columnas de tablas ni incluir un input de filtro por ID en los filtros de los catálogos. El ID es un dato interno del sistema y no debe ser visible ni filtrable por el usuario.

```tsx
// Evitar — columna ID en tabla
<TableHead>Id</TableHead>
<TableCell>{item.id}</TableCell>

// Evitar — input de filtro por ID
<Label>ID</Label>
<Input onChange={(e) => setId(filterDigitsOnly(e.target.value))} />

// Correcto — el ID se usa solo internamente (key, props de acciones)
<TableRow key={item.id}>
  <TableCell>{item.name}</TableCell>
  <TableCell><UpdateButton id={item.id} /></TableCell>
</TableRow>
```

Esto aplica a todos los catálogos: dependencias, tipo de documento, días no laborales, marcadores, estados, empleados, área, cargo, profesión, horario, etc.

## Consistencia de color en inputs y selects

Todos los controles de formulario deben usar `bg-popover` como fondo para ser visualmente consistentes:
- `Input` (base): `bg-popover`
- `SelectTrigger` (base): `bg-popover` (no `bg-transparent`)
- `Textarea` (base): `bg-popover` (no `bg-background`)
- `FormSelectSearch` Button: `bg-popover` en className
- `FormInputDate` / `FormCalendar` Buttons: `bg-popover` en className

## Borde rojo en error para todos los controles

Usar `aria-invalid:border-destructive` en la clase base de los componentes nativos (Input, SelectTrigger, Textarea) — `FormControl` de shadcn automáticamente aplica `aria-invalid={!!error}`.

Para componentes Button usados como date pickers (`FormInputDate`, `FormCalendar`, `FormSelectSearch`), acceder a `fieldState.error` en el render y agregar `border-destructive` condicionalmente:
```tsx
render={({ field, fieldState }) => (
  <Button className={cn("...", fieldState.error && "border-destructive")} />
)}
```

## Fechas inválidas ("Invalid date")

Siempre guardar con `isValid(field.value)` antes de formatear una fecha:
```tsx
import { isValid } from "date-fns";
// Correcto
{field.value && isValid(field.value) ? formatDate(field.value) : <span>Selecciona una fecha</span>}
// Evitar — puede mostrar "Invalid date"
{field.value ? formatDate(field.value) : <span>Selecciona una fecha</span>}
```

## Validación de fechas en Zod (error "Invalid date" en FormMessage)

`z.coerce.date()` convierte `undefined` → `new Date(undefined)` (Invalid Date object, instanceof Date = true). Zod emite `ZodIssueCode.invalid_date` cuyo mensaje por defecto es **"Invalid date"**. Este código de error NO es `invalid_type`, por lo que `invalid_type_error` no lo sobreescribe.

**Regla:** usar `z.preprocess(normDate, z.date({ required_error: "..." }))` para campos de fecha requeridos. El helper `normDate` convierte `undefined`/Invalid Date → `undefined` antes de que Zod valide.

```typescript
// Helper en el archivo de validación
const normDate = (val: unknown): Date | undefined => {
  if (val === undefined || val === null) return undefined;
  const d = val instanceof Date ? val : new Date(val as string);
  return isNaN(d.getTime()) ? undefined : d;
};

// Correcto — undefined e Invalid Date muestran el required_error personalizado
FechaExpedicion: z.preprocess(normDate, z.date({ required_error: "La fecha de expedición es requerida" })),

// Evitar — z.coerce.date() convierte undefined → Invalid Date → ZodIssueCode.invalid_date → "Invalid date"
FechaExpedicion: z.coerce.date({ required_error: "...", invalid_type_error: "..." }),
```

Aplica a todos los campos de fecha requeridos (`FechaExpedicion`, `FechaExpiracion`, `StartDate`, `birthDate`, `BirthDate`, etc.).

Además: `parseDateDMY` en `date-helpers.ts` debe verificar `isNaN(d.getTime())` y retornar `null` si la fecha es inválida, para evitar que Invalid Date (que es truthy) se propague a los valores del formulario.

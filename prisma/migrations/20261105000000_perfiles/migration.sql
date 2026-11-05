CREATE TABLE "PerfilConfiguracion" (
  "tipoFuncionario" "TipoFuncionario" NOT NULL,
  "secciones" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PerfilConfiguracion_pkey" PRIMARY KEY ("tipoFuncionario")
);
-- Matriz inicial provisional: pendiente de validación funcional institucional.
INSERT INTO "PerfilConfiguracion" ("tipoFuncionario", "secciones")
SELECT tipo, '{"datos_personales":{"visible":true,"obligatorio":true},"formacion_academica":{"visible":true,"obligatorio":false},"capacitacion":{"visible":true,"obligatorio":false}}'::jsonb
FROM unnest(enum_range(NULL::"TipoFuncionario")) AS tipo;

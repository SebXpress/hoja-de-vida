-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('FUNCIONARIO', 'TALENTO_HUMANO', 'ADMIN');

-- CreateEnum
CREATE TYPE "TipoFuncionario" AS ENUM ('DOCENTE', 'ADMINISTRATIVO', 'DIRECTIVO');

-- CreateEnum
CREATE TYPE "EstadoValidacion" AS ENUM ('PENDIENTE', 'VALIDADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "NivelFormacion" AS ENUM ('TECNICO', 'TERCER_NIVEL', 'ESPECIALIZACION', 'MAESTRIA', 'DOCTORADO');

-- CreateEnum
CREATE TYPE "OrigenRegistro" AS ENUM ('MANUAL', 'BUS_DATOS');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'FUNCIONARIO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Funcionario" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "tipoFuncionario" "TipoFuncionario" NOT NULL,
    "cargo" TEXT,
    "departamento" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Funcionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Capacitacion" (
    "id" SERIAL NOT NULL,
    "funcionarioId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "institucion" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "horas" INTEGER NOT NULL,
    "evidenciaUrl" TEXT NOT NULL,
    "estado" "EstadoValidacion" NOT NULL DEFAULT 'PENDIENTE',
    "observacionRevision" TEXT,
    "revisadoPorId" INTEGER,
    "revisadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Capacitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormacionAcademica" (
    "id" SERIAL NOT NULL,
    "funcionarioId" INTEGER NOT NULL,
    "nivel" "NivelFormacion" NOT NULL,
    "titulo" TEXT NOT NULL,
    "institucion" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "fechaObtencion" TIMESTAMP(3) NOT NULL,
    "numeroRegistroSenescyt" TEXT,
    "origen" "OrigenRegistro" NOT NULL DEFAULT 'MANUAL',
    "evidenciaUrl" TEXT,
    "estado" "EstadoValidacion" NOT NULL DEFAULT 'PENDIENTE',
    "observacionRevision" TEXT,
    "revisadoPorId" INTEGER,
    "revisadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormacionAcademica_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Funcionario_usuarioId_key" ON "Funcionario"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Funcionario_cedula_key" ON "Funcionario"("cedula");

-- CreateIndex
CREATE INDEX "Capacitacion_funcionarioId_idx" ON "Capacitacion"("funcionarioId");

-- CreateIndex
CREATE INDEX "Capacitacion_estado_idx" ON "Capacitacion"("estado");

-- CreateIndex
CREATE INDEX "FormacionAcademica_funcionarioId_idx" ON "FormacionAcademica"("funcionarioId");

-- CreateIndex
CREATE INDEX "FormacionAcademica_estado_idx" ON "FormacionAcademica"("estado");

-- AddForeignKey
ALTER TABLE "Funcionario" ADD CONSTRAINT "Funcionario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Capacitacion" ADD CONSTRAINT "Capacitacion_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "Funcionario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormacionAcademica" ADD CONSTRAINT "FormacionAcademica_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "Funcionario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

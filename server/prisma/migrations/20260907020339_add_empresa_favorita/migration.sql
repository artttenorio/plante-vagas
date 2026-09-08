-- CreateTable
CREATE TABLE "EmpresaFavorita" (
    "id" SERIAL NOT NULL,
    "candidatoId" INTEGER NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmpresaFavorita_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmpresaFavorita_candidatoId_empresaId_key" ON "EmpresaFavorita"("candidatoId", "empresaId");

-- AddForeignKey
ALTER TABLE "EmpresaFavorita" ADD CONSTRAINT "EmpresaFavorita_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "UserCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpresaFavorita" ADD CONSTRAINT "EmpresaFavorita_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "UserCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

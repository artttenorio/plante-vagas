-- CreateTable
CREATE TABLE "VagaFavorita" (
    "id" SERIAL NOT NULL,
    "candidatoId" INTEGER NOT NULL,
    "vagaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VagaFavorita_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VagaFavorita_candidatoId_vagaId_key" ON "VagaFavorita"("candidatoId", "vagaId");

-- AddForeignKey
ALTER TABLE "VagaFavorita" ADD CONSTRAINT "VagaFavorita_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "UserCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VagaFavorita" ADD CONSTRAINT "VagaFavorita_vagaId_fkey" FOREIGN KEY ("vagaId") REFERENCES "Vaga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

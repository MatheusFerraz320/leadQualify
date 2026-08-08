-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "utmAnuncioId" TEXT,
ADD COLUMN     "utmCampanha" TEXT,
ADD COLUMN     "utmGrupoAnuncio" TEXT,
ADD COLUMN     "utmPalavraChave" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

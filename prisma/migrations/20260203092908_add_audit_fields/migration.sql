-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TranslationKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stringName" TEXT NOT NULL,
    "remarks" TEXT,
    "projectId" TEXT NOT NULL,
    "lastModifiedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TranslationKey_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TranslationKey_lastModifiedById_fkey" FOREIGN KEY ("lastModifiedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TranslationKey" ("createdAt", "id", "projectId", "remarks", "stringName", "updatedAt") SELECT "createdAt", "id", "projectId", "remarks", "stringName", "updatedAt" FROM "TranslationKey";
DROP TABLE "TranslationKey";
ALTER TABLE "new_TranslationKey" RENAME TO "TranslationKey";
CREATE INDEX "TranslationKey_stringName_idx" ON "TranslationKey"("stringName");
CREATE UNIQUE INDEX "TranslationKey_projectId_stringName_key" ON "TranslationKey"("projectId", "stringName");
CREATE TABLE "new_TranslationValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "languageCode" TEXT NOT NULL,
    "content" TEXT,
    "translationKeyId" TEXT NOT NULL,
    "lastModifiedById" TEXT,
    CONSTRAINT "TranslationValue_translationKeyId_fkey" FOREIGN KEY ("translationKeyId") REFERENCES "TranslationKey" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TranslationValue_lastModifiedById_fkey" FOREIGN KEY ("lastModifiedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TranslationValue" ("content", "id", "languageCode", "translationKeyId") SELECT "content", "id", "languageCode", "translationKeyId" FROM "TranslationValue";
DROP TABLE "TranslationValue";
ALTER TABLE "new_TranslationValue" RENAME TO "TranslationValue";
CREATE UNIQUE INDEX "TranslationValue_translationKeyId_languageCode_key" ON "TranslationValue"("translationKeyId", "languageCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

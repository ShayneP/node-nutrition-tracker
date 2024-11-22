/*
  Warnings:

  - Added the required column `participantIdentity` to the `FoodConsumption` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FoodConsumption" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "participantIdentity" TEXT NOT NULL,
    "foodName" TEXT NOT NULL,
    "calories" INTEGER,
    "protein" REAL,
    "carbs" REAL,
    "fats" REAL,
    "consumedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_FoodConsumption" ("calories", "carbs", "consumedAt", "fats", "foodName", "id", "protein") SELECT "calories", "carbs", "consumedAt", "fats", "foodName", "id", "protein" FROM "FoodConsumption";
DROP TABLE "FoodConsumption";
ALTER TABLE "new_FoodConsumption" RENAME TO "FoodConsumption";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateTable
CREATE TABLE "FoodConsumption" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "foodName" TEXT NOT NULL,
    "calories" INTEGER,
    "protein" REAL,
    "carbs" REAL,
    "fats" REAL,
    "consumedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

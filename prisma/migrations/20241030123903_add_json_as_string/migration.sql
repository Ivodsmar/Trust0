-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "bio" TEXT,
    "balance" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "interests" TEXT NOT NULL,
    "totalFunds" REAL,
    "availableFunds" REAL,
    "loans" TEXT
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "pendingAmount" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "intervals" TEXT NOT NULL DEFAULT '[]',
    "smsTemplate" TEXT NOT NULL DEFAULT 'Tamara ##PENDING_AMOUNT## Chintanbhai ne apvana baki che, aje api desho.'
);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_phoneNumber_key" ON "Contact"("phoneNumber");

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "originalName" TEXT,
    "originalType" TEXT,
    "originalData" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL DEFAULT 'Unknown',
    "role" TEXT NOT NULL DEFAULT '',
    "jdLang" TEXT,
    "score" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'To apply',
    "coverLang" TEXT,
    "jdOriginal" TEXT,
    "jdEnglish" TEXT,
    "analysis" TEXT,
    "compat" TEXT,
    "tailored" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_userId_key" ON "Resume"("userId");

-- CreateIndex
CREATE INDEX "Application_userId_idx" ON "Application"("userId");

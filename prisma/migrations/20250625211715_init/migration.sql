-- CreateTable
CREATE TABLE "emails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "responded" BOOLEAN NOT NULL DEFAULT false,
    "response" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "emailId" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientId" TEXT,
    "topic" TEXT,
    "summary" TEXT,
    "language" TEXT,
    "sentiment" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "purchaseProbability" REAL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "conversations_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "emails" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "conversations_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client_profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "client_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "preferredLanguage" TEXT,
    "budgetRange" TEXT,
    "travelStyle" TEXT,
    "groupSize" INTEGER,
    "seasonPreference" TEXT,
    "hotelPreference" TEXT,
    "averageSpend" REAL,
    "bookingFrequency" TEXT,
    "responseTime" INTEGER,
    "loyaltyScore" REAL,
    "valueScore" REAL,
    "engagementScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "client_interactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "sentiment" TEXT,
    "value" REAL,
    "outcome" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "client_interactions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client_profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "conversationId" TEXT,
    "destination" TEXT NOT NULL,
    "checkIn" DATETIME NOT NULL,
    "checkOut" DATETIME NOT NULL,
    "guests" INTEGER NOT NULL,
    "totalValue" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "hotel" TEXT,
    "roomType" TEXT,
    "attractions" TEXT,
    "transportation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bookings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client_profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ml_models" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "accuracy" REAL,
    "parameters" TEXT,
    "trainedAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "prediction_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelName" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "prediction" TEXT NOT NULL,
    "confidence" REAL,
    "actual" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "purchase_alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "readinessScore" REAL NOT NULL,
    "estimatedValue" REAL,
    "estimatedCloseTime" TEXT,
    "readySignals" TEXT NOT NULL,
    "immediateActions" TEXT NOT NULL,
    "nextSteps" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" DATETIME,
    "resolvedBy" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "purchase_alerts_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "purchase_readiness_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientEmail" TEXT NOT NULL,
    "readinessScore" REAL NOT NULL,
    "confidence" REAL NOT NULL,
    "estimatedValue" REAL,
    "estimatedCloseTime" TEXT,
    "readySignals" TEXT NOT NULL,
    "immediateActions" TEXT NOT NULL,
    "reasoning" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hotels" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "priceRange" TEXT NOT NULL,
    "rating" REAL,
    "amenities" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "attractions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priceRange" TEXT NOT NULL,
    "hours" TEXT,
    "rating" REAL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "restaurants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cuisine" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "priceRange" TEXT NOT NULL,
    "rating" REAL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "knowledge_base" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "agent_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "emailAccount" TEXT,
    "agentName" TEXT NOT NULL DEFAULT 'Dubai Travel Assistant',
    "responseTemplate" TEXT,
    "autoReply" BOOLEAN NOT NULL DEFAULT false,
    "maxResponseTime" INTEGER NOT NULL DEFAULT 24,
    "workingHours" TEXT,
    "signature" TEXT,
    "settings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "emails_messageId_key" ON "emails"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_emailId_key" ON "conversations"("emailId");

-- CreateIndex
CREATE UNIQUE INDEX "client_profiles_email_key" ON "client_profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ml_models_name_key" ON "ml_models"("name");

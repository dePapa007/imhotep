-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('UNMARKED', 'PRESENT', 'ABSENT');

-- AlterTable
ALTER TABLE "TrainingRegistration" ADD COLUMN     "attendanceStatus" "AttendanceStatus" NOT NULL DEFAULT 'UNMARKED',
ADD COLUMN     "attendanceNotes" TEXT,
ADD COLUMN     "attendanceMarkedAt" TIMESTAMP(3),
ADD COLUMN     "attendanceMarkedById" TEXT;

-- CreateIndex
CREATE INDEX "TrainingRegistration_attendanceMarkedById_idx" ON "TrainingRegistration"("attendanceMarkedById");

-- AddForeignKey
ALTER TABLE "TrainingRegistration" ADD CONSTRAINT "TrainingRegistration_attendanceMarkedById_fkey" FOREIGN KEY ("attendanceMarkedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  await prisma.verificationLog.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleared existing data");

  const passwordHash = await bcrypt.hash("password123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin Recruiter",
      email: "admin@test.com",
      passwordHash,
    },
  });

  console.log(`Created Admin User: ${admin.email}`);

  const candidatesData = [
    {
      fullName: "Alice Johnson",
      email: "alice.johnson@example.com",
      phone: "9876543210",
      aadhaarNumber: "123412341234", // Will pass: doesn't start with 0000 or end with 9999
      panNumber: "ABCDE1234F",       // Will pass: doesn't start with XYZ or end with X
      dob: new Date("1995-08-15"),
      address: "123 Park Avenue, Sector 4, Bangalore, Karnataka",
      status: "VERIFIED",
    },
    {
      fullName: "Bob Smith",
      email: "bob.smith@example.com",
      phone: "9812345678",
      aadhaarNumber: "000000009999", // Fail: starts with 0000 AND ends with 9999
      panNumber: "XYZDE5678X",       // Fail: starts with XYZ AND ends with X
      dob: new Date("1990-11-23"),
      address: "456 Oak Road, Bandra West, Mumbai, Maharashtra",
      status: "FAILED",
    },
    {
      fullName: "Carol Shelby",
      email: "carol.shelby@example.com",
      phone: "9944556677",
      aadhaarNumber: "123456789012", // Pass: valid Aadhaar
      panNumber: "XYZAB9012X",       // Fail: starts with XYZ
      dob: new Date("1998-04-02"),
      address: "789 Pine Drive, Gachibowli, Hyderabad, Telangana",
      status: "PARTIAL",
    },
    {
      fullName: "David Miller",
      email: "david.miller@example.com",
      phone: "9123456789",
      aadhaarNumber: "888899991111", // Will pass when verified
      panNumber: "FGHIJ5678K",       // Will pass when verified
      dob: new Date("1992-05-12"),
      address: "101 Maple Court, Salt Lake City, Kolkata, West Bengal",
      status: "PENDING",
    },
  ];

  for (const item of candidatesData) {
    const candidate = await prisma.candidate.create({
      data: {
        fullName: item.fullName,
        email: item.email,
        phone: item.phone,
        aadhaarNumber: item.aadhaarNumber,
        panNumber: item.panNumber,
        dob: item.dob,
        address: item.address,
        status: item.status,
        createdById: admin.id,
      },
    });

    console.log(`Added candidate: ${candidate.fullName} [${candidate.status}]`);

    if (item.status !== "PENDING") {
      const aadhaarPassed = item.status === "VERIFIED" || item.status === "PARTIAL";
      const panPassed = item.status === "VERIFIED";

      await prisma.verificationLog.create({
        data: {
          candidateId: candidate.id,
          verificationType: "AADHAAR",
          requestPayload: JSON.stringify({ aadhaarNumber: candidate.aadhaarNumber }),
          responsePayload: JSON.stringify({
            status: aadhaarPassed ? "verified" : "failed",
            nameMatch: aadhaarPassed,
            dobMatch: aadhaarPassed,
            message: aadhaarPassed
              ? "Aadhaar verified successfully"
              : "Aadhaar number not found in UIDAI database",
          }),
          verificationStatus: aadhaarPassed ? "VERIFIED" : "FAILED",
        },
      });

      await prisma.verificationLog.create({
        data: {
          candidateId: candidate.id,
          verificationType: "PAN",
          requestPayload: JSON.stringify({ panNumber: candidate.panNumber }),
          responsePayload: JSON.stringify({
            status: panPassed ? "verified" : "failed",
            panStatus: panPassed ? "active" : "inactive",
            message: panPassed
              ? "PAN verified successfully"
              : "PAN is invalid or deactivated by NSDL",
          }),
          verificationStatus: panPassed ? "VERIFIED" : "FAILED",
        },
      });

      console.log(`   📋 Created verification logs for ${candidate.fullName}`);
    }
  }

  console.log("\n🎉 Database seeding completed successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Login: admin@test.com / password123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

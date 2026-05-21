// src/services/candidate.service.ts
import { prisma } from "../prisma/client";
import { NotFoundError } from "../utils/errors";

export interface CandidateInput {
  fullName: string;
  email: string;
  phone: string;
  aadhaarNumber: string;
  panNumber: string;
  dob: string;
  address: string;
}

export class CandidateService {
  static async createCandidate(data: CandidateInput, userId: string) {
    return prisma.candidate.create({
      data: {
        fullName: data.fullName,
        email: data.email.toLowerCase().trim(),
        phone: data.phone,
        aadhaarNumber: data.aadhaarNumber,
        panNumber: data.panNumber.toUpperCase(),
        dob: new Date(data.dob),
        address: data.address,
        status: "PENDING",
        createdById: userId,
      },
    });
  }

  static async listCandidates(
    userId: string,
    options: { search?: string; status?: string; page?: number; limit?: number } = {}
  ) {
    const { search, status, page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    // Build query filters
    const whereClause: any = {
      createdById: userId,
    };

    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { panNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch in parallel for speed and count
    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.candidate.count({ where: whereClause }),
    ]);

    return {
      candidates,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCandidateById(id: string, userId: string) {
    const candidate = await prisma.candidate.findFirst({
      where: {
        id,
        createdById: userId,
      },
      include: {
        verificationLogs: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!candidate) {
      throw new NotFoundError("Candidate not found or unauthorized");
    }

    return candidate;
  }

  static async updateCandidate(id: string, data: Partial<CandidateInput>, userId: string) {
    // Check if exists and user owns it
    await this.getCandidateById(id, userId);

    const updateData: any = { ...data };
    if (data.dob) {
      updateData.dob = new Date(data.dob);
    }
    if (data.email) {
      updateData.email = data.email.toLowerCase().trim();
    }
    if (data.panNumber) {
      updateData.panNumber = data.panNumber.toUpperCase();
    }

    return prisma.candidate.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteCandidate(id: string, userId: string) {
    // Check if exists and user owns it
    await this.getCandidateById(id, userId);

    // Delete verification logs first to maintain referential integrity
    await prisma.verificationLog.deleteMany({
      where: { candidateId: id },
    });

    return prisma.candidate.delete({
      where: { id },
    });
  }
}

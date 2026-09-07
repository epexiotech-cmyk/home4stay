import { prisma } from "@/lib/database/prisma";
import { Prisma } from "@prisma/client";

export class PartnerRepository {
  // Onboarding Session
  static async getOnboardingSessionByPropertyId(propertyId: string) {
    return prisma.onboardingSession.findUnique({
      where: { propertyId },
      include: {
        progress: true,
        drafts: true
      }
    });
  }

  static async createOnboardingSession(data: Prisma.OnboardingSessionUncheckedCreateInput) {
    return prisma.onboardingSession.create({
      data,
      include: {
        progress: true,
        drafts: true
      }
    });
  }

  static async upsertWizardDraft(sessionId: string, stepId: string, data: any) {
    return prisma.wizardDraft.upsert({
      where: {
        onboardingSessionId_stepId: {
          onboardingSessionId: sessionId,
          stepId
        }
      },
      create: {
        onboardingSessionId: sessionId,
        stepId,
        data: data || {}
      },
      update: {
        data: data || {}
      }
    });
  }

  static async upsertPropertySetupProgress(sessionId: string, stepId: string, status: string) {
    return prisma.propertySetupProgress.upsert({
      where: {
        onboardingSessionId_stepId: {
          onboardingSessionId: sessionId,
          stepId
        }
      },
      create: {
        onboardingSessionId: sessionId,
        stepId,
        status
      },
      update: {
        status
      }
    });
  }

  static async updateOnboardingSessionStatus(propertyId: string, status: string, currentStep: string) {
    return prisma.onboardingSession.update({
      where: { propertyId },
      data: {
        status,
        currentStep
      }
    });
  }

  static async launchPropertyTransaction(
    propertyId: string,
    sessionId: string,
    userId: string,
    propertyDraft: any,
    pricingDraft: any
  ) {
    return prisma.$transaction([
      prisma.property.update({
        where: { id: propertyId },
        data: {
          status: "LIVE",
          publishedAt: new Date(),
          title: propertyDraft.title || undefined,
          onboardingStatus: "COMPLETED"
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          legalBusinessName: pricingDraft.enableBusinessBilling ? pricingDraft.legalBusinessName : null,
          gstin: pricingDraft.enableBusinessBilling ? pricingDraft.gstin : null,
          billingAddress: pricingDraft.enableBusinessBilling ? pricingDraft.billingAddress : null,
          billingState: pricingDraft.enableBusinessBilling ? pricingDraft.billingState : null,
          billingPincode: pricingDraft.enableBusinessBilling ? pricingDraft.billingPincode : null,
          billingContact: pricingDraft.enableBusinessBilling ? pricingDraft.billingContact : null,
        }
      }),
      prisma.onboardingSession.update({
        where: { propertyId },
        data: {
          status: "LIVE",
          currentStep: "launch"
        }
      }),
      prisma.propertySetupProgress.upsert({
        where: {
          onboardingSessionId_stepId: {
            onboardingSessionId: sessionId,
            stepId: "launch"
          }
        },
        create: {
          onboardingSessionId: sessionId,
          stepId: "launch",
          status: "COMPLETED",
          completedAt: new Date()
        },
        update: {
          status: "COMPLETED",
          completedAt: new Date()
        }
      })
    ]);
  }
}

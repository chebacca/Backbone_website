/**
 * 🔥 LICENSING WEBSITE - SHARED FIREBASE FUNCTIONS INTEGRATION
 * 
 * This file provides a bridge between the Express.js server and shared Firebase Functions
 * while maintaining the existing Prisma database integration.
 */

import { Request, Response } from 'express';
import {
  // Auth functions
  loginUser,
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  checkEmailAvailability,
  validateSession,
  refreshUserClaims,
  getAuthStatus,
  
  // Project functions
  createProject,
  listProjects,
  updateProject,
  deleteProject,
  
  // Dataset functions
  createDataset,
  listDatasets,
  updateDataset,
  deleteDataset,
  
  // Session functions
  createSession,
  listSessions,
  updateSession,
  deleteSession,
  
  // License functions
  createLicense,
  listLicenses,
  updateLicense,
  deleteLicense,
  
  // Payment functions
  createPayment,
  listPayments,
  updatePayment,
  deletePayment
} from 'shared-firebase-functions';

// ============================================================================
// SHARED FUNCTION WRAPPERS
// ============================================================================

export class SharedFunctionsService {
  // Auth Functions
  static async handleLoginUser(data: any, context: any) {
    return await loginUser(data, context);
  }

  static async handleRegisterUser(data: any, context: any) {
    return await registerUser(data, context);
  }

  static async handleVerifyEmail(data: any, context: any) {
    return await verifyEmail(data, context);
  }

  static async handleResendVerificationEmail(data: any, context: any) {
    return await resendVerificationEmail(data, context);
  }

  static async handleForgotPassword(data: any, context: any) {
    return await forgotPassword(data, context);
  }

  static async handleResetPassword(data: any, context: any) {
    return await resetPassword(data, context);
  }

  static async handleCheckEmailAvailability(data: any, context: any) {
    return await checkEmailAvailability(data, context);
  }

  static async handleValidateSession(data: any, context: any) {
    return await validateSession(data, context);
  }

  static async handleRefreshUserClaims(data: any, context: any) {
    return await refreshUserClaims(data, context);
  }

  static async handleGetAuthStatus(data: any, context: any) {
    return await getAuthStatus(data, context);
  }

  // Project Functions
  static async handleCreateProject(data: any, context: any) {
    return await createProject(data, context);
  }

  static async handleListProjects(data: any, context: any) {
    return await listProjects(data, context);
  }

  static async handleUpdateProject(data: any, context: any) {
    return await updateProject(data, context);
  }

  static async handleDeleteProject(data: any, context: any) {
    return await deleteProject(data, context);
  }

  // Dataset Functions
  static async handleCreateDataset(data: any, context: any) {
    return await createDataset(data, context);
  }

  static async handleListDatasets(data: any, context: any) {
    return await listDatasets(data, context);
  }

  static async handleUpdateDataset(data: any, context: any) {
    return await updateDataset(data, context);
  }

  static async handleDeleteDataset(data: any, context: any) {
    return await deleteDataset(data, context);
  }

  // Session Functions
  static async handleCreateSession(data: any, context: any) {
    return await createSession(data, context);
  }

  static async handleListSessions(data: any, context: any) {
    return await listSessions(data, context);
  }

  static async handleUpdateSession(data: any, context: any) {
    return await updateSession(data, context);
  }

  static async handleDeleteSession(data: any, context: any) {
    return await deleteSession(data, context);
  }

  // License Functions
  static async handleCreateLicense(data: any, context: any) {
    return await createLicense(data, context);
  }

  static async handleListLicenses(data: any, context: any) {
    return await listLicenses(data, context);
  }

  static async handleUpdateLicense(data: any, context: any) {
    return await updateLicense(data, context);
  }

  static async handleDeleteLicense(data: any, context: any) {
    return await deleteLicense(data, context);
  }

  // Payment Functions
  static async handleCreatePayment(data: any, context: any) {
    return await createPayment(data, context);
  }

  static async handleListPayments(data: any, context: any) {
    return await listPayments(data, context);
  }

  static async handleUpdatePayment(data: any, context: any) {
    return await updatePayment(data, context);
  }

  static async handleDeletePayment(data: any, context: any) {
    return await deletePayment(data, context);
  }
}

// ============================================================================
// EXPRESS ROUTE HANDLERS
// ============================================================================

export const createSharedFunctionRoute = (sharedFunction: Function) => {
  return async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const context = { auth: req.user }; // Assuming auth middleware sets req.user
      
      const result = await sharedFunction(data, context);
      res.json(result);
    } catch (error) {
      console.error('Shared function error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

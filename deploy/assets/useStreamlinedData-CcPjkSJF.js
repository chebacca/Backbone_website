var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import { r as reactExports } from "./vendor-Cu2L4Rr-.js";
import { unifiedDataService } from "./UnifiedDataService-BWUSusTA.js";
import { u as useAuth } from "./index-BeFtug-f.js";
function useCurrentUser() {
  const [data, setData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const { isAuthenticated, isLoading: authLoading, user: authUser } = useAuth();
  const fetchUser = reactExports.useCallback(() => __async(this, null, function* () {
    if (authLoading || !isAuthenticated) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const user = yield unifiedDataService.getCurrentUser();
      setData(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user");
    } finally {
      setLoading(false);
    }
  }), [authLoading, isAuthenticated]);
  reactExports.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchUser();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
      setData(null);
    }
  }, [authLoading, isAuthenticated, fetchUser]);
  reactExports.useEffect(() => {
    if (authLoading) {
      setLoading(true);
    }
  }, [authLoading]);
  return {
    data,
    loading: loading || authLoading,
    error,
    refetch: fetchUser
  };
}
function useUserProjects() {
  const [data, setData] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const fetchProjects = reactExports.useCallback(() => __async(this, null, function* () {
    try {
      setLoading(true);
      setError(null);
      const projects = yield unifiedDataService.getProjectsForUser();
      setData(projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }), []);
  reactExports.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  return {
    data,
    loading,
    error,
    refetch: fetchProjects
  };
}
function useOrganizationContext() {
  const [data, setData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const { data: currentUser, loading: userLoading } = useCurrentUser();
  const fetchContext = reactExports.useCallback(() => __async(this, null, function* () {
    if (userLoading || !currentUser) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const context = yield unifiedDataService.getOrganizationContext();
      setData(context);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch organization context");
    } finally {
      setLoading(false);
    }
  }), [userLoading, currentUser]);
  reactExports.useEffect(() => {
    if (!userLoading && currentUser) {
      fetchContext();
    } else if (!userLoading && !currentUser) {
      setLoading(false);
      setData(null);
    }
  }, [userLoading, currentUser, fetchContext]);
  reactExports.useEffect(() => {
    if (userLoading) {
      setLoading(true);
    }
  }, [userLoading]);
  return {
    data,
    loading: loading || userLoading,
    error,
    refetch: fetchContext
  };
}
function useOrganizationLicenses() {
  const [data, setData] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const { data: currentUser, loading: userLoading } = useCurrentUser();
  const fetchLicenses = reactExports.useCallback(() => __async(this, null, function* () {
    if (userLoading || !currentUser) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const licenses = yield unifiedDataService.getLicensesForOrganization();
      setData(licenses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch licenses");
    } finally {
      setLoading(false);
    }
  }), [userLoading, currentUser]);
  reactExports.useEffect(() => {
    if (!userLoading && currentUser) {
      fetchLicenses();
    } else if (!userLoading && !currentUser) {
      setLoading(false);
      setData([]);
    }
  }, [userLoading, currentUser, fetchLicenses]);
  reactExports.useEffect(() => {
    if (userLoading) {
      setLoading(true);
    }
  }, [userLoading]);
  return {
    data,
    loading: loading || userLoading,
    error,
    refetch: fetchLicenses
  };
}
function useUpdateLicense() {
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const mutate = reactExports.useCallback((_0) => __async(this, [_0], function* ({ licenseId, updates }) {
    try {
      setLoading(true);
      setError(null);
      yield unifiedDataService.updateLicense(licenseId, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update license");
      throw err;
    } finally {
      setLoading(false);
    }
  }), []);
  return {
    mutate,
    loading,
    error
  };
}
function useAssignLicense() {
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const mutate = reactExports.useCallback((_0) => __async(this, [_0], function* ({ licenseId, userId }) {
    try {
      setLoading(true);
      setError(null);
      yield unifiedDataService.assignLicense(licenseId, userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign license");
      throw err;
    } finally {
      setLoading(false);
    }
  }), []);
  return {
    mutate,
    loading,
    error
  };
}
function useUnassignLicense() {
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const mutate = reactExports.useCallback((_0) => __async(this, [_0], function* ({ licenseId }) {
    try {
      setLoading(true);
      setError(null);
      yield unifiedDataService.unassignLicense(licenseId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unassign license");
      throw err;
    } finally {
      setLoading(false);
    }
  }), []);
  return {
    mutate,
    loading,
    error
  };
}
function useOrganizationTeamMembers() {
  const [data, setData] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const fetchTeamMembers = reactExports.useCallback(() => __async(this, null, function* () {
    try {
      setLoading(true);
      setError(null);
      const teamMembers = yield unifiedDataService.getTeamMembersForOrganization();
      setData(teamMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch team members");
    } finally {
      setLoading(false);
    }
  }), []);
  reactExports.useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);
  return {
    data,
    loading,
    error,
    refetch: fetchTeamMembers
  };
}
function useInviteTeamMember() {
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const mutate = reactExports.useCallback((memberData) => __async(this, null, function* () {
    try {
      setLoading(true);
      setError(null);
      const memberId = yield unifiedDataService.inviteTeamMember(memberData);
      return memberId;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite team member");
      throw err;
    } finally {
      setLoading(false);
    }
  }), []);
  return {
    mutate,
    loading,
    error
  };
}
function useUpdateTeamMember() {
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const mutate = reactExports.useCallback((_0) => __async(this, [_0], function* ({ memberId, updates }) {
    try {
      setLoading(true);
      setError(null);
      yield unifiedDataService.updateTeamMember(memberId, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update team member");
      throw err;
    } finally {
      setLoading(false);
    }
  }), []);
  return {
    mutate,
    loading,
    error
  };
}
function useChangeTeamMemberPassword() {
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const mutate = reactExports.useCallback((_0) => __async(this, [_0], function* ({ memberId, newPassword }) {
    try {
      setLoading(true);
      setError(null);
      yield unifiedDataService.changeTeamMemberPassword(memberId, newPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
      throw err;
    } finally {
      setLoading(false);
    }
  }), []);
  return {
    mutate,
    loading,
    error
  };
}
function useRemoveTeamMember() {
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const mutate = reactExports.useCallback((_0) => __async(this, [_0], function* ({ memberId }) {
    try {
      console.log("🔄 [useRemoveTeamMember] Starting team member removal:", memberId);
      setLoading(true);
      setError(null);
      yield unifiedDataService.removeTeamMember(memberId);
      console.log("✅ [useRemoveTeamMember] Team member removal completed successfully");
    } catch (err) {
      console.error("❌ [useRemoveTeamMember] Error removing team member:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to remove team member";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }), []);
  return {
    mutate,
    loading,
    error
  };
}
function useUserPermissions() {
  var _a, _b, _c;
  const { data: user } = useCurrentUser();
  return {
    canCreateProjects: ((_a = user == null ? void 0 : user.license) == null ? void 0 : _a.canCreateProjects) || false,
    canManageTeam: ((_b = user == null ? void 0 : user.license) == null ? void 0 : _b.canManageTeam) || false,
    isAccountOwner: (user == null ? void 0 : user.userType) === "ACCOUNT_OWNER",
    isTeamMember: (user == null ? void 0 : user.userType) === "TEAM_MEMBER",
    isAdmin: (user == null ? void 0 : user.userType) === "ADMIN",
    organizationTier: ((_c = user == null ? void 0 : user.organization) == null ? void 0 : _c.tier) || "BASIC"
  };
}
export {
  useOrganizationTeamMembers as a,
  useCurrentUser as b,
  useOrganizationContext as c,
  useUserProjects as d,
  useUserPermissions as e,
  useUpdateLicense as f,
  useAssignLicense as g,
  useUnassignLicense as h,
  useInviteTeamMember as i,
  useUpdateTeamMember as j,
  useRemoveTeamMember as k,
  useChangeTeamMemberPassword as l,
  useOrganizationLicenses as u
};

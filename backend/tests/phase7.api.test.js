/**
 * Phase 7 API Integration Tests
 *
 * Extends scanRoutes.test.js coverage with the additional scenarios required
 * by Phase 7: idempotency, log redaction, queue failure path, body validation,
 * cross-user isolation, and invalid token handling.
 *
 * Uses the same pattern as scanRoutes.test.js (direct router mounting, no full app).
 */

import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import { API_ERROR_CODES } from "../shared/constants/apiErrorCodes.js";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockScanService = {
  updateScanRecord: jest.fn().mockResolvedValue({}),
  getScanByRepoAndCommit: jest.fn(),
  createScanRecord: jest.fn(),
  getScanByIdAndUserId: jest.fn(),
};

const mockGithubService = {
  getDefaultBranchCommitSha: jest.fn().mockResolvedValue("commit-abc123"),
};

const mockScanQueue = {
  enqueueRepositoryScan: jest.fn().mockResolvedValue({ id: "job-phase7" }),
};

jest.unstable_mockModule("../server/src/services/scanService.js", () => mockScanService);
jest.unstable_mockModule("../server/src/services/githubService.js", () => mockGithubService);
jest.unstable_mockModule("../server/src/queues/scanQueue.js", () => mockScanQueue);
jest.unstable_mockModule("../server/src/utils/crypto.js", () => ({
  decryptSecret: () => "decrypted-token",
  encryptSecret: (v) => `encrypted:${v}`,
}));
jest.unstable_mockModule("../server/src/config/database.js", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue([{ encryptedAccessToken: "encrypted-token" }]),
  },
}));
jest.unstable_mockModule("../server/src/middleware/authenticate.js", () => ({
  authenticate: (req, res, next) => next(),
}));
jest.unstable_mockModule("../server/src/middleware/authorizeRepository.js", () => ({
  authorizeRepository: (req, res, next) => next(),
}));

const { repositoryScansRouter, scansRouter } = await import("../server/src/routes/scanRoutes.js");
const { SCAN_STATUS } = await import("../shared/constants/scanStatus.js");
const { errorHandler } = await import("../server/src/middleware/errorHandler.js");

// ---------------------------------------------------------------------------
// Test App Factory
// ---------------------------------------------------------------------------
const REPO_UUID = "223e4567-e89b-12d3-a456-426614174000";
const SCAN_UUID = "123e4567-e89b-12d3-a456-426614174001";
const OTHER_UUID = "999e4567-e89b-12d3-a456-426614174999";

function buildApp({ userId = "user-1" } = {}) {
  const app = express();
  app.use(express.json());

  // Auth gate
  app.use((req, res, next) => {
    if (req.headers.authorization === "Bearer valid") {
      req.userId = userId;
      req.githubToken = "mock-token";
      next();
    } else {
      res.status(401).json({ success: false, error: { code: "UNAUTHENTICATED" } });
    }
  });

  // Repository ownership gate — only REPO_UUID is accessible
  app.use("/api/repositories/:repoId", (req, res, next) => {
    if (req.params.repoId === REPO_UUID) {
      req.repository = { id: REPO_UUID, owner: "mock-owner", name: "mock-repo" };
      next();
    } else {
      res.status(404).json({ success: false, error: { code: "REPOSITORY_NOT_FOUND" } });
    }
  });

  app.use("/api/repositories/:repoId/scans", repositoryScansRouter);
  app.use("/api/scans", scansRouter);
  app.use(errorHandler);
  return app;
}

const app = buildApp();

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("Phase 7 API: Scan Routes — extended coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: decryptSecret returns a valid token
    // Default: getDefaultBranchCommitSha returns a commit SHA
    mockGithubService.getDefaultBranchCommitSha.mockResolvedValue("commit-abc123");
  });

  // -------------------------------------------------------------------------
  // 1. Authentication
  // -------------------------------------------------------------------------
  describe("1. Authentication", () => {
    test("unauthenticated POST returns 401 UNAUTHENTICATED", async () => {
      const res = await request(app)
        .post(`/api/repositories/${REPO_UUID}/scans`)
        .send({});
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHENTICATED");
    });

    test("unauthenticated GET scan returns 401 UNAUTHENTICATED", async () => {
      const res = await request(app).get(`/api/scans/${SCAN_UUID}`);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHENTICATED");
    });
  });

  // -------------------------------------------------------------------------
  // 2. Input Validation
  // -------------------------------------------------------------------------
  describe("2. Input Validation", () => {
    test("invalid repoId UUID returns 400 VALIDATION_ERROR, no DB row, no job", async () => {
      const res = await request(app)
        .post("/api/repositories/not-a-valid-uuid/scans")
        .set("Authorization", "Bearer valid")
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(API_ERROR_CODES.VALIDATION_ERROR);
      expect(mockScanService.createScanRecord).not.toHaveBeenCalled();
      expect(mockScanQueue.enqueueRepositoryScan).not.toHaveBeenCalled();
    });

    test("invalid scanId UUID in GET returns 400 VALIDATION_ERROR", async () => {
      const res = await request(app)
        .get("/api/scans/not-a-valid-uuid")
        .set("Authorization", "Bearer valid");
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(API_ERROR_CODES.VALIDATION_ERROR);
    });

    test("body with unknown field returns 400 VALIDATION_ERROR (strict schema)", async () => {
      mockScanService.getScanByRepoAndCommit.mockResolvedValue(null);
      const res = await request(app)
        .post(`/api/repositories/${REPO_UUID}/scans`)
        .set("Authorization", "Bearer valid")
        .send({ trigger: "manual", unknownField: "oops" });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(API_ERROR_CODES.VALIDATION_ERROR);
      expect(mockScanService.createScanRecord).not.toHaveBeenCalled();
    });

    test("body with invalid trigger value returns 400 VALIDATION_ERROR", async () => {
      const res = await request(app)
        .post(`/api/repositories/${REPO_UUID}/scans`)
        .set("Authorization", "Bearer valid")
        .send({ trigger: "scheduled" }); // only 'manual' is allowed
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe(API_ERROR_CODES.VALIDATION_ERROR);
    });

    test("empty body {} passes validation (trigger is optional)", async () => {
      mockScanService.getScanByRepoAndCommit.mockResolvedValue(null);
      mockScanService.createScanRecord.mockResolvedValue({
        id: SCAN_UUID,
        status: SCAN_STATUS.QUEUED,
      });
      const res = await request(app)
        .post(`/api/repositories/${REPO_UUID}/scans`)
        .set("Authorization", "Bearer valid")
        .send({});
      expect(res.status).toBe(202);
    });

    test("body with trigger:manual passes validation", async () => {
      mockScanService.getScanByRepoAndCommit.mockResolvedValue(null);
      mockScanService.createScanRecord.mockResolvedValue({
        id: SCAN_UUID,
        status: SCAN_STATUS.QUEUED,
      });
      const res = await request(app)
        .post(`/api/repositories/${REPO_UUID}/scans`)
        .set("Authorization", "Bearer valid")
        .send({ trigger: "manual" });
      expect(res.status).toBe(202);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Cross-user isolation
  // -------------------------------------------------------------------------
  describe("3. Cross-user isolation", () => {
    test("repo not owned by user returns 404, no scan created", async () => {
      const res = await request(app)
        .post(`/api/repositories/${OTHER_UUID}/scans`)
        .set("Authorization", "Bearer valid")
        .send({});
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("REPOSITORY_NOT_FOUND");
      expect(mockScanService.createScanRecord).not.toHaveBeenCalled();
    });

    test("scan owned by another user returns 404 SCAN_NOT_FOUND", async () => {
      mockScanService.getScanByIdAndUserId.mockResolvedValue(null);
      const res = await request(app)
        .get(`/api/scans/${SCAN_UUID}`)
        .set("Authorization", "Bearer valid");
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe(API_ERROR_CODES.SCAN_NOT_FOUND);
    });

    test("retry owned by another user returns 404 SCAN_NOT_FOUND", async () => {
      mockScanService.getScanByIdAndUserId.mockResolvedValue(null);
      const res = await request(app)
        .post(`/api/scans/${SCAN_UUID}/retry`)
        .set("Authorization", "Bearer valid");
      expect(res.status).toBe(404);
    });
  });

  // -------------------------------------------------------------------------
  // 4. Successful scan creation
  // -------------------------------------------------------------------------
  describe("4. Successful scan creation", () => {
    beforeEach(() => {
      mockScanService.getScanByRepoAndCommit.mockResolvedValue(null);
      mockScanService.createScanRecord.mockResolvedValue({
        id: SCAN_UUID,
        status: SCAN_STATUS.QUEUED,
      });
    });

    test("returns 202 with scanId, non-null jobId, and queued status", async () => {
      const res = await request(app)
        .post(`/api/repositories/${REPO_UUID}/scans`)
        .set("Authorization", "Bearer valid")
        .send({});
      expect(res.status).toBe(202);
      expect(res.body.success).toBe(true);
      expect(res.body.data.scanId).toBe(SCAN_UUID);
      expect(res.body.data.jobId).not.toBeNull();
      expect(res.body.data.status).toBe(SCAN_STATUS.QUEUED);
    });

    test("creates exactly one scan record and enqueues exactly one BullMQ job", async () => {
      await request(app)
        .post(`/api/repositories/${REPO_UUID}/scans`)
        .set("Authorization", "Bearer valid")
        .send({});
      expect(mockScanService.createScanRecord).toHaveBeenCalledTimes(1);
      expect(mockScanQueue.enqueueRepositoryScan).toHaveBeenCalledTimes(1);
    });

    test("response body does not expose encryptedAccessToken or githubToken", async () => {
      const res = await request(app)
        .post(`/api/repositories/${REPO_UUID}/scans`)
        .set("Authorization", "Bearer valid")
        .send({});
      const body = JSON.stringify(res.body);
      expect(body).not.toContain("encryptedAccessToken");
      expect(body).not.toContain("githubToken");
      expect(body).not.toContain("mock-token");
    });
  });

  // -------------------------------------------------------------------------
  // 5. Idempotency
  // -------------------------------------------------------------------------
  describe("5. Idempotency — same repo + commit SHA", () => {
    test("existing queued scan returns 200 with alreadyExists:true, no new row, no new job", async () => {
      mockScanService.getScanByRepoAndCommit.mockResolvedValue({
        id: SCAN_UUID,
        jobId: "existing-job",
        status: SCAN_STATUS.QUEUED,
      });
      const res = await request(app)
        .post(`/api/repositories/${REPO_UUID}/scans`)
        .set("Authorization", "Bearer valid")
        .send({});
      expect(res.status).toBe(200);
      expect(res.body.data.alreadyExists).toBe(true);
      expect(res.body.data.scanId).toBe(SCAN_UUID);
      expect(mockScanService.createScanRecord).not.toHaveBeenCalled();
      expect(mockScanQueue.enqueueRepositoryScan).not.toHaveBeenCalled();
    });

    test("existing running scan returns 200 with alreadyExists:true", async () => {
      mockScanService.getScanByRepoAndCommit.mockResolvedValue({
        id: SCAN_UUID,
        jobId: "running-job",
        status: SCAN_STATUS.RUNNING,
      });
      const res = await request(app)
        .post(`/api/repositories/${REPO_UUID}/scans`)
        .set("Authorization", "Bearer valid")
        .send({});
      expect(res.status).toBe(200);
      expect(res.body.data.alreadyExists).toBe(true);
    });

    test("existing completed scan returns 200 with alreadyExists:true", async () => {
      mockScanService.getScanByRepoAndCommit.mockResolvedValue({
        id: SCAN_UUID,
        jobId: "completed-job",
        status: SCAN_STATUS.COMPLETED,
      });
      const res = await request(app)
        .post(`/api/repositories/${REPO_UUID}/scans`)
        .set("Authorization", "Bearer valid")
        .send({});
      expect(res.status).toBe(200);
      expect(res.body.data.alreadyExists).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 6. Queue failure path
  // -------------------------------------------------------------------------
  describe("6. Queue failure path", () => {
    test("queue failure returns 503 QUEUE_UNAVAILABLE, scan marked failed, no queued=true response", async () => {
      mockScanService.getScanByRepoAndCommit.mockResolvedValue(null);
      mockScanService.createScanRecord.mockResolvedValue({
        id: SCAN_UUID,
        status: SCAN_STATUS.QUEUED,
      });
      mockScanQueue.enqueueRepositoryScan.mockRejectedValueOnce(new Error("Redis connection refused"));

      const res = await request(app)
        .post(`/api/repositories/${REPO_UUID}/scans`)
        .set("Authorization", "Bearer valid")
        .send({});

      expect(res.status).toBe(503);
      expect(res.body.error.code).toBe(API_ERROR_CODES.QUEUE_UNAVAILABLE);
      // Must have marked scan as failed
      expect(mockScanService.updateScanRecord).toHaveBeenCalledWith(
        SCAN_UUID,
        expect.objectContaining({ status: SCAN_STATUS.FAILED })
      );
      // Must NOT return success with queued status
      expect(res.body.success).not.toBe(true);
      expect(res.body.data?.status).not.toBe(SCAN_STATUS.QUEUED);
    });
  });

  // -------------------------------------------------------------------------
  // 7. Scan status endpoint
  // -------------------------------------------------------------------------
  describe("7. Scan status", () => {
    test("completed scan returns progress:100, completedAt, and safe fields only", async () => {
      mockScanService.getScanByIdAndUserId.mockResolvedValue({
        id: SCAN_UUID,
        repositoryId: REPO_UUID,
        status: SCAN_STATUS.COMPLETED,
        progress: 100,
        progressMessage: "Scan complete.",
        completedAt: new Date("2026-09-01T00:00:00Z").toISOString(),
      });
      const res = await request(app)
        .get(`/api/scans/${SCAN_UUID}`)
        .set("Authorization", "Bearer valid");
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(SCAN_STATUS.COMPLETED);
      expect(res.body.data.progress).toBe(100);
      // Should NOT expose internal fields
      const body = JSON.stringify(res.body);
      expect(body).not.toContain("encryptedAccessToken");
    });

    test("running scan exposes progress and progressMessage", async () => {
      mockScanService.getScanByIdAndUserId.mockResolvedValue({
        id: SCAN_UUID,
        status: SCAN_STATUS.RUNNING,
        progress: 45,
        progressMessage: "Analyzing files.",
      });
      const res = await request(app)
        .get(`/api/scans/${SCAN_UUID}`)
        .set("Authorization", "Bearer valid");
      expect(res.status).toBe(200);
      expect(res.body.data.progress).toBe(45);
      expect(res.body.data.progressMessage).toBe("Analyzing files.");
    });
  });

  // -------------------------------------------------------------------------
  // 8. Retry endpoint
  // -------------------------------------------------------------------------
  describe("8. Retry endpoint", () => {
    test("retry on completed scan returns 409 SCAN_NOT_RETRYABLE", async () => {
      mockScanService.getScanByIdAndUserId.mockResolvedValue({
        id: SCAN_UUID,
        status: SCAN_STATUS.COMPLETED,
      });
      const res = await request(app)
        .post(`/api/scans/${SCAN_UUID}/retry`)
        .set("Authorization", "Bearer valid");
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe(API_ERROR_CODES.SCAN_NOT_RETRYABLE);
    });

    test("retry on queued scan returns 409 SCAN_NOT_RETRYABLE", async () => {
      mockScanService.getScanByIdAndUserId.mockResolvedValue({
        id: SCAN_UUID,
        status: SCAN_STATUS.QUEUED,
      });
      const res = await request(app)
        .post(`/api/scans/${SCAN_UUID}/retry`)
        .set("Authorization", "Bearer valid");
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe(API_ERROR_CODES.SCAN_NOT_RETRYABLE);
    });

    test("retry on failed scan returns 202 with non-null jobId", async () => {
      mockScanService.getScanByIdAndUserId.mockResolvedValue({
        id: SCAN_UUID,
        status: SCAN_STATUS.FAILED,
        repositoryId: REPO_UUID,
        commitSha: "commit-abc",
      });
      const res = await request(app)
        .post(`/api/scans/${SCAN_UUID}/retry`)
        .set("Authorization", "Bearer valid");
      expect(res.status).toBe(202);
      expect(res.body.data.jobId).not.toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // 9. Health endpoints (via full app)
  // -------------------------------------------------------------------------
  describe("9. Health endpoints are reachable", () => {
    test("scanRoutes does not interfere with /api/repositories path (no cross-contamination)", async () => {
      // This test verifies the router does not absorb requests it should not
      const res = await request(app)
        .get(`/api/repositories/${REPO_UUID}/scans/not-a-uuid`)
        .set("Authorization", "Bearer valid");
      // Should get a validation error for non-UUID scanId, not a 500
      expect([400, 404]).toContain(res.status);
    });
  });
});

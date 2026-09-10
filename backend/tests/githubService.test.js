import { jest } from '@jest/globals';
import { ApiError } from '../server/src/utils/apiError.js';
import { API_ERROR_CODES } from '../shared/constants/apiErrorCodes.js';

const mockGetCommit = jest.fn();
const mockPaginate = jest.fn();

// We must mock Octokit before importing the service
jest.unstable_mockModule('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => {
      return {
        rest: {
          repos: {
            getCommit: mockGetCommit
          }
        },
        paginate: mockPaginate
      };
    })
  };
});

// Now dynamically import the service
const { getDefaultBranchCommitSha, listGitHubRepositories } = await import('../server/src/services/githubService.js');

describe('githubService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDefaultBranchCommitSha', () => {
    test('throws immediately without calling Octokit if repository owner is missing', async () => {
      const repository = { id: 'repo-1', name: 'Jobify' };
      
      await expect(getDefaultBranchCommitSha(repository, 'fake-token')).rejects.toMatchObject({
        statusCode: 502,
        code: API_ERROR_CODES.GITHUB_COMMIT_LOOKUP_FAILED,
      });
    });

    test('throws immediately without calling Octokit if repository name is missing', async () => {
      const repository = { id: 'repo-1', owner: 'rajat-dev-1' };
      
      await expect(getDefaultBranchCommitSha(repository, 'fake-token')).rejects.toMatchObject({
        statusCode: 502,
        code: API_ERROR_CODES.GITHUB_COMMIT_LOOKUP_FAILED,
      });
    });
  });

  describe('listGitHubRepositories', () => {
    test('throws GITHUB_REAUTH_REQUIRED on 401 error', async () => {
      mockPaginate.mockRejectedValueOnce({ status: 401 });

      await expect(listGitHubRepositories('fake-token')).rejects.toMatchObject({
        statusCode: 401,
        code: API_ERROR_CODES.GITHUB_REAUTH_REQUIRED,
      });
    });

    test('throws GITHUB_RATE_LIMITED on 429 error', async () => {
      mockPaginate.mockRejectedValueOnce({ status: 429 });

      await expect(listGitHubRepositories('fake-token')).rejects.toMatchObject({
        statusCode: 429,
        code: API_ERROR_CODES.GITHUB_RATE_LIMITED,
      });
    });

    test('throws GITHUB_API_UNAVAILABLE on 500 error', async () => {
      mockPaginate.mockRejectedValueOnce({ status: 500 });

      await expect(listGitHubRepositories('fake-token')).rejects.toMatchObject({
        statusCode: 502,
        code: API_ERROR_CODES.GITHUB_API_UNAVAILABLE,
      });
    });
  });
});

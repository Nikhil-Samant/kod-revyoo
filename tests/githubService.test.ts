import { App, Octokit } from 'octokit';
import { describe, jest, it, expect } from '@jest/globals';
import {
  handleWebhookEvent,
  handlePrEvent,
  getPullRequestFiles,
  postComment
} from '../src/githubService.ts';

import { GeneralComment } from '../src/types/models.ts';

let app: App;
let octokit: Octokit;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let payload: any;

beforeEach(() => {
  const appOptions = {
    appId: 123,
    privateKey: 'private-key',
    webhooks: {
      secret: 'mysecret'
    }
  };

  app = new App(appOptions);
  octokit = new Octokit();
  payload = {
    repository: {
      owner: {
        login: 'owner'
      },
      name: 'repo'
    },
    pull_request: {
      number: 123
    }
  };
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('handleWebhookEvent', () => {
  it('should handle pull_request.opened event', async () => {
    const onMethod = jest.spyOn(app.webhooks, 'on').mockImplementationOnce(() => {});

    handleWebhookEvent(app);

    expect(onMethod).toHaveBeenCalledWith('pull_request.opened', expect.any(Function));
  });
});

describe('handlePrEvent', () => {
  it('should get list of files from pull request', async () => {
    const files = jest.spyOn(octokit.rest.pulls, 'listFiles').mockImplementation();
    await handlePrEvent(octokit, payload);

    expect(files).toHaveBeenCalledWith({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      pull_number: payload.pull_request.number
    });
  });

  it('should log error if get list fails', async () => {
    const error = new Error('Test error');
    const consoleError = jest.spyOn(console, 'error').mockReturnValueOnce();
    jest.spyOn(octokit.rest.pulls, 'listFiles').mockImplementation(() => Promise.reject(error));

    await handlePrEvent(octokit, payload);

    expect(consoleError).toHaveBeenCalledWith(`Error! Message: ${error}`);
  });

  it('should log error if creating comment fails', async () => {
    const error = new Error('Test error');
    const consoleError = jest.spyOn(console, 'error').mockReturnValueOnce();
    jest.spyOn(octokit.rest.pulls, 'listFiles').mockReturnValue({
      data: [
        {
          sha: 'sha',
          filename: 'filename',
          status: 'status',
          additions: 1,
          deletions: 1,
          changes: 1,
          blob_url: 'blob_url',
          raw_url: 'raw_url',
          contents_url: 'contents_url',
          patch: 'patch'
        }
      ]
    });
    jest.spyOn(octokit.rest.pulls, 'createReview').mockImplementation(() => Promise.reject(error));
    jest
      .spyOn(octokit.rest.issues, 'createComment')
      .mockImplementation(() => Promise.reject(error));

    await handlePrEvent(octokit, payload);

    expect(consoleError).toHaveBeenCalledWith(`Error! Message: ${error}`);
  });
  // TODO: Add test for failure in other cases where other api fails
});

describe('getPullRequestFiles', () => {
  it('should get list of files from pull request', async () => {
    const filesApi = jest.spyOn(octokit.rest.pulls, 'listFiles').mockReturnValue({
      data: [
        {
          sha: 'sha',
          filename: 'filename',
          status: 'added',
          additions: 1,
          deletions: 1,
          changes: 1,
          blob_url: 'blob_url',
          raw_url: 'raw_url',
          contents_url: 'contents_url',
          patch: 'patch'
        }
      ]
    });

    const files = await getPullRequestFiles(octokit, payload);

    expect(filesApi).toHaveBeenCalledWith({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      pull_number: payload.pull_request.number
    });
    expect(files.data).toEqual([
      {
        sha: 'sha',
        filename: 'filename',
        status: 'added',
        additions: 1,
        deletions: 1,
        changes: 1,
        blob_url: 'blob_url',
        raw_url: 'raw_url',
        contents_url: 'contents_url',
        patch: 'patch'
      }
    ]);
  });
});

describe('postComment', () => {
  it('should create a comment on pull request', async () => {
    const createComment = jest.spyOn(octokit.rest.issues, 'createComment').mockImplementation();
    const comment: GeneralComment = {
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: payload.pull_request.number,
      body: 'Hello from my app. Things have changed'
    };

    await postComment(octokit, payload);

    expect(createComment).toHaveBeenCalledWith(comment);
  });
});

// describe('createReviewOnPr', () => {
//   it('should create a review on pull request', async () => {
//     const files: PullRequestFile[] = [
//       {
//         sha: 'sha',
//         filename: 'filename',
//         status: PullRequestFileStatus.added,
//         additions: 1,
//         deletions: 1,
//         changes: 1,
//         blob_url: 'blob_url',
//         raw_url: 'raw_url',
//         contents_url: 'contents_url',
//         patch: 'patch'
//       }
//     ];
//     const createComment = jest.spyOn(octokit.rest.pulls, 'createReview').mockImplementation();
//     const comment: PullRequestReview = {
//       owner: payload.repository.owner.login,
//       repo: payload.repository.name,
//       pull_number: payload.pull_request.number,
//       body: 'This is a review comment',
//       comments: [
//         {
//           path: files[0].filename,
//           body: 'commenting on the first file',
//           position: 1
//         }
//       ],
//       event: 'COMMENT'
//     };

//     // mock generateReview
//     mockGenerateReview.mockResolvedValueOnce(comment);

//     await createReviewOnPr(octokit, payload, files);

//     expect(createComment).toHaveBeenCalledWith(comment);
//   });
// });

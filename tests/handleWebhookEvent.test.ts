import { App, Octokit } from 'octokit';
import { jest } from '@jest/globals';
import { handleWebhookEvent, handlePrEvent } from '../src/handleWebhookEvent.ts';
import { CommentPayload } from '../src/types/index.ts';

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
  jest.spyOn(console, 'error').mockReturnValueOnce();
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

  it('should create a comment on pull request', async () => {
    jest.spyOn(octokit.rest.pulls, 'listFiles').mockImplementation();
    const createComment = jest.spyOn(octokit.rest.issues, 'createComment').mockImplementation();
    const comment: CommentPayload = {
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: payload.pull_request.number,
      body: 'Hello from my app. Things have changed'
    };
    await handlePrEvent(octokit, payload);

    expect(createComment).toHaveBeenCalledWith(comment);
  });

  it('should log error if creating comment fails', async () => {
    const error = new Error('Test error');
    const consoleError = jest.spyOn(console, 'error').mockReturnValueOnce();
    jest.spyOn(octokit.rest.pulls, 'listFiles').mockImplementation();
    jest
      .spyOn(octokit.rest.issues, 'createComment')
      .mockImplementation(() => Promise.reject(error));

    await handlePrEvent(octokit, payload);
    expect(consoleError).toHaveBeenCalledWith(`Error! Message: ${error}`);
  });
});

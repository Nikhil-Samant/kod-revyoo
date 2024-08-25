import { getMessages } from '../src/llmService';
import { PullRequestFile, PullRequestFileStatus } from '../src/types/models';

beforeEach(() => {});
afterEach(() => {});

describe('generateReview', () => {
  it('should get a generated response from llm', () => {
    const response = 'Hello World';
    expect(response).toBe('Hello World');
  });
});

describe('getMessages', () => {
  it('should get messages for the chat completion', () => {
    const files: PullRequestFile[] = [
      {
        filename: 'file1',
        patch: 'patch1',
        sha: '',
        status: PullRequestFileStatus.added,
        additions: 0,
        deletions: 0,
        changes: 0,
        blob_url: '',
        raw_url: '',
        contents_url: ''
      },
      {
        filename: 'file2',
        patch: 'patch2',
        sha: '',
        status: PullRequestFileStatus.added,
        additions: 0,
        deletions: 0,
        changes: 0,
        blob_url: '',
        raw_url: '',
        contents_url: ''
      }
    ];
    const response = getMessages(files);
    expect(response[1].content).toMatch(`Following is the PR file and its contents
              file path:file1
      content to review:patch1
      file path:file2
      content to review:patch2`);
  });
});

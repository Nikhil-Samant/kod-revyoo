import { PullRequestFile, PullRequestFileStatus } from '../src/types';
import { generateReview } from '../src/llmService';

beforeEach(() => {});
afterEach(() => {});

describe('generateReview', () => {
  it('should get a generated response from llm', async () => {
    const files: PullRequestFile[] = [
      {
        sha: '123',
        filename: 'file.txt',
        status: PullRequestFileStatus.added,
        additions: 1,
        deletions: 0,
        changes: 1,
        blob_url: 'blob_url',
        raw_url: 'raw_url',
        contents_url: 'contents_url',
        patch: 'patch'
      }
    ];

    const response = await generateReview(files);

    expect(response).toBe('Hello World');
  });
});

import { z } from 'zod';

export interface GeneralComment {
  owner: string;
  repo: string;
  issue_number: number;
  body: string;
}

export interface PullRequestReview {
  owner?: string;
  repo?: string;
  pull_number?: number;
  body: string;
  comments: ReviewComment[];
  event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
}

export interface ReviewComment {
  path: string;
  body: string;
  position?: number;
  line?: number;
  side?: 'LEFT' | 'RIGHT';
  start_line?: number;
  start_side?: 'LEFT' | 'RIGHT';
}

export interface PullRequestFilesRequest {
  owner: string;
  repo: string;
  pull_number: number;
}

export interface PullRequestFilesResponse {
  data: PullRequestFile[];
}

export interface PullRequestFile {
  sha: string;
  filename: string;
  status: PullRequestFileStatus;
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch: string;
}

export enum PullRequestFileStatus {
  added = 'added',
  modified = 'modified',
  removed = 'removed',
  renamed = 'renamed',
  copied = 'copied',
  changed = 'changed',
  unchanged = 'unchanged'
}

export const ReviewFormatParameters = z.object({
  body: z.string().describe('overall comment for the PR'),
  event: z
    .enum(['APPROVE', 'REQUEST_CHANGES', 'COMMENT'])
    .describe(
      'status for the PR. If review score is greate than 8, this will be APPROVE, if less than 3, this will be REQUEST_CHANGES, else COMMENT'
    ),
  comments: z
    .array(
      z.object({
        path: z.string().describe('path to the file'),
        body: z.string().describe('comment for the file'),
        position: z
          .number()
          .optional()
          .describe('position for the comment. Should be 1 if not provided')
      })
    )
    .describe('comments for the PR')
});

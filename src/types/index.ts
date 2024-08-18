import { Octokit } from 'octokit';

export interface AppOptions {
  appId: number;
  privateKey: string;
  webhooks: {
    secret: string;
  };
  Octokit?: typeof Octokit;
}

export interface GeneralCommentPayload {
  owner: string;
  repo: string;
  issue_number: number;
  body: string;
}

export interface PullRequestReviewPayload {
  owner: string;
  repo: string;
  pull_number: number;
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

export interface PullRequestFilesRequestPayload {
  owner: string;
  repo: string;
  pull_number: number;
}

export interface PullRequestFilesResponsePayload {
  data: PullRequestFile[];
}

export interface PullRequestFile {
  sha: string;
  filename: string;
  status: PullReuqestFileStatus;
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch: string;
}

export enum PullReuqestFileStatus {
  added = 'added',
  modified = 'modified',
  removed = 'removed',
  renamed = 'renamed',
  copied = 'copied',
  changed = 'changed',
  unchanged = 'unchanged'
}

import { Octokit } from 'octokit';

export interface AppOptions {
  appId: number;
  privateKey: string;
  webhooks: {
    secret: string;
  };
  Octokit?: typeof Octokit;
}

export interface CommentPayload {
  owner: string;
  repo: string;
  issue_number: number;
  body: string;
}

export interface PullRequestFilesPayload {
  owner: string;
  repo: string;
  pull_number: number;
}

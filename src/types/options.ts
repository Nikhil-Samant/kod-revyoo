import { Octokit } from 'octokit';

export interface AppOptions {
  appId: number;
  privateKey: string;
  webhooks: {
    secret: string;
  };
  Octokit?: typeof Octokit;
}

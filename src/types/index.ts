import { Octokit } from 'octokit';

export interface AppOptions {
  appId: number;
  privateKey: string;
  webhooks: {
    secret: string;
  };
  Octokit?: typeof Octokit;
}

export interface Payload {
  repository: {
    owner: {
      login: string;
    };
    name: string;
  };
  pull_request: {
    number: number;
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { App } from 'octokit';
import {
  GeneralCommentPayload,
  PullRequestFile,
  PullRequestFilesResponsePayload,
  PullRequestFilesRequestPayload,
  PullRequestReviewPayload
} from './types/index.ts';

export function handleWebhookEvent(app: App): void {
  app.webhooks.on(
    'pull_request.opened',
    async ({ octokit, payload }) => await handlePrEvent(octokit, payload)
  );

  app.webhooks.onError((error: Error) => {
    app.octokit.log.error(`Error processing request: ${error.message}`, error);
  });
}

export async function handlePrEvent(octokit: any, payload: any): Promise<void> {
  try {
    console.log(`Received a pull request event for #${payload.pull_request.number}`);
    const response = await getPullRequestFiles(octokit, payload);
    await createReviewOnPr(octokit, payload, response.data);
    await postComment(octokit, payload);
    console.log('Comment created successfully');
  } catch (error) {
    console.error(`Error! Message: ${error}`);
  }
}

export async function postComment(octokit: any, payload: any): Promise<void> {
  const commentPayload: GeneralCommentPayload = {
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    issue_number: payload.pull_request.number,
    body: 'Hello from my app. Things have changed'
  };

  await octokit.rest.issues.createComment(commentPayload);
}

export async function getPullRequestFiles(
  octokit: any,
  payload: any
): Promise<PullRequestFilesResponsePayload> {
  const listPrFilesPayload: PullRequestFilesRequestPayload = {
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    pull_number: payload.pull_request.number
  };

  const files = await octokit.rest.pulls.listFiles(listPrFilesPayload);
  return files;
}

export async function createReviewOnPr(
  octokit: any,
  payload: any,
  files: PullRequestFile[]
): Promise<void> {
  console.log('Creating a review on the pull request');
  const reviewCommentPayload: PullRequestReviewPayload = {
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    pull_number: payload.pull_request.number,
    body: 'This is a review comment',
    comments: [
      {
        path: files[0].filename,
        body: 'commenting on the first file',
        position: 1
      }
    ],
    event: 'COMMENT'
  };

  await octokit.rest.pulls.createReview(reviewCommentPayload);
  console.log('Review created successfully');
}

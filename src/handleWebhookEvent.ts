import { App } from 'octokit';
import { CommentPayload, PullRequestFilesPayload } from './types';

export function handleWebhookEvent(app: App): void {
  app.webhooks.on(
    'pull_request.opened',
    async ({ octokit, payload }) => await handlePrEvent(octokit, payload)
  );

  app.webhooks.onError((error: Error) => {
    app.octokit.log.error(`Error processing request: ${error.message}`, error);
  });
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handlePrEvent(octokit: any, payload: any): Promise<void> {
  try {
    console.log(`Received a pull request event for #${payload.pull_request.number}`);
    await getPullRequestFiles(payload, octokit);
    await postComment(payload, octokit);
    console.log('Comment created successfully');
  } catch (error) {
    console.error(`Error! Message: ${error}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function postComment(payload: any, octokit: any) {
  const commentPayload: CommentPayload = {
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    issue_number: payload.pull_request.number,
    body: 'Hello from my app. Things have changed'
  };

  await octokit.rest.issues.createComment(commentPayload);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPullRequestFiles(payload: any, octokit: any) {
  const listPrFilesPayload: PullRequestFilesPayload = {
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    pull_number: payload.pull_request.number
  };

  const files = await octokit.rest.pulls.listFiles(listPrFilesPayload);
  console.log('Files in the pull request:', files);
}

import { App } from 'octokit';

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
  console.log(`Received a pull request event for #${payload.pull_request.number}`);
  try {
    await octokit.rest.issues.createComment({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: payload.pull_request.number,
      body: 'Hello from my app. Things have changed'
    });
    console.log('Comment created successfully');
  } catch (error) {
    console.error(`Error! Message: ${error}`);
  }
}

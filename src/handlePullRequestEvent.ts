import { App } from 'octokit';

// write an export function that takes a GitHub event payload and returns a string
export function handlePullRequestEvent(app: App): void {
  app.webhooks.on('pull_request.opened', async ({ octokit, payload }) => {
    console.log(`Received a pull request event for #${payload.pull_request.number}`);
    try {
      await octokit.rest.issues.createComment({
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        issue_number: payload.pull_request.number,
        body: 'Hello from my app. Things have changed'
      });
    } catch (error) {
      console.error(`Error! Message: ${error}`);
    }
  });

  app.webhooks.onError((error: Error) => {
    app.octokit.log.error(`Error processing request: ${error.message}`, error);
  });
}

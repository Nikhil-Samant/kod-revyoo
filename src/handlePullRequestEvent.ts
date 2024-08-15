import { Octokit } from 'octokit';
import { Payload } from './types';

export async function handlePullRequestEvent({
  octokit,
  payload
}: {
  octokit: Octokit;
  payload: Payload;
}): Promise<void> {
  console.log(`Received a pull request event for #${payload.pull_request.number}`);
  try {
    await octokit.rest.issues.createComment({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: payload.pull_request.number,
      body: 'Hello from my app'
    });
  } catch (error) {
    console.error(`Error! Message: ${error}`);
  }
}

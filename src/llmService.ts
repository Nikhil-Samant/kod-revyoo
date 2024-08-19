import { PullRequestFile } from './types/index.ts';

export async function generateReview(data: PullRequestFile[]): Promise<string> {
  console.log('Generating review', data);
  return 'Hello World';
}

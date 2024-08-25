import { PullRequestFile, PullRequestReview, ReviewFormatParameters } from './types/models.ts';
import { AzureOpenAI } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { ResponseFormatJSONObject } from 'openai/resources/shared';
import mustache from 'mustache';

export async function generateReview(data: PullRequestFile[]): Promise<PullRequestReview> {
  const messages = getMessages(data);
  const llmResponse = await getLlmResponse(messages);
  const result = ReviewFormatParameters.safeParse(llmResponse);
  if (!result.success) {
    console.error('Validation failed:', result.error);
    return {
      body: 'Error in generating review',
      comments: [],
      event: 'COMMENT'
    };
  } else {
    const prReview: PullRequestReview = {
      body: result.data.body,
      comments: result.data.comments,
      event: result.data.event
    };
    return prReview;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getLlmResponse(messages: ChatCompletionMessageParam[]): Promise<any> {
  const endpoint = process.env.AZURE_ENDPOINT || '<endpoint>';
  const apiKey = process.env.API_KEY || '<api key>';
  const apiVersion = process.env.API_VERSION || '2024-04-01-preview';
  const deployment = process.env.LLM_MODEL_DEPLOYMENT_NAME || 'gpt-4o-2024-08-06';

  try {
    const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment: deployment });
    const resFormat: ResponseFormatJSONObject = { type: 'json_object' };
    const response = await client.chat.completions.create({
      model: deployment,
      messages: messages,
      response_format: resFormat
    });
    const responseMessage = response.choices[0].message;
    if (responseMessage?.content) {
      return JSON.parse(responseMessage.content);
    }
  } catch (error) {
    console.error(`Error! Message: ${error}`);
  }
}

export function getMessages(data: PullRequestFile[]): ChatCompletionMessageParam[] {
  const filePrompt = mustache.render(
    `{{#.}}
      file path:{{filename}}
      content to review:{{patch}}
    {{/.}}`,
    data
  );
  console.log('File Prompt:', filePrompt);
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `Imagine you are an experienced Tech Lead of the team. 
Your job is to review the pull requests and provide recommendations regarding the code changes and improvements. 
Your goal is to provide insightful, accurate, and concise review to the code changes made by the developer.
Review each file and provide feedback on the code quality, readability, and maintainability. Precisely mention the position where the comment should be placed.

Note: The position value equals the number of lines down from the first "@@" hunk header in the file you want to add a comment. 
The line just below the "@@" line is position 1, the next line is position 2, and so on. The position in the diff continues to increase through lines of whitespace and additional hunks until the beginning of a new file.

You can ask questions, provide suggestions, and give recommendations to the developer.
If the developer has written a nice code, appreciate the developer for the good work.
Generate a review score for the overall pull request. if the review score is more than 8, approve the pull request. Otherwise, comment.
Response should only be in the following JSON format:
{
  body: 'overall comment for the PR',
  event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT',
  comments: [
    {
        path: 'file path',
        body: 'comment for the file',
        position: line number
    }
    ]
}
`
    },
    {
      role: 'user',
      content: `Following is the PR file and its contents
        ${filePrompt}`
    }
  ];
  return messages;
}

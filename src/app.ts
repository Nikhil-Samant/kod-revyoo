import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { Octokit, App } from 'octokit';
import { createNodeMiddleware } from '@octokit/webhooks';
import * as http from 'http';

dotenv.config();

// set up constants from the env file

const appId = process.env.APP_ID;
const webhookSecret = process.env.WEBHOOK_SECRET;
const privateKey = process.env.PRIVATE_KEY_PATH;

const enterpriseHostname = process.env.ENTERPRISE_HOSTNAME

// throw an error if the constants are not set
if (!appId || !webhookSecret || !privateKey) {
  throw new Error('Missing required configuration');
}

// read the private key from the file
const privateKeyContent = fs.readFileSync(privateKey, 'utf8');

// Create an authenticated Octokit client authenticated as a GitHub App
const app = new App({
  appId: parseInt(appId, 10),
  privateKey: privateKeyContent,
  webhooks: {
    secret: webhookSecret,
  },
  ...(enterpriseHostname && {
    Octokit: Octokit.defaults({
      baseUrl: `https://${enterpriseHostname}/api/v3`
    })
  })
});

// Optional: Get & log the authenticated app's name
app.octokit.request('/app').then(({ data }: { data: any }) => app.octokit.log.debug(`Authenticated as '${data.name}'`));

// Read more about custom logging: https://github.com/octokit/core.js#logging


// Subscribe to the "pull_request.opened" webhook event
app.webhooks.on('pull_request.opened', async ({ octokit, payload }) => {
    console.log(`Received a pull request event for #${payload.pull_request.number}`);
    try {
        await octokit.rest.issues.createComment({
            owner: payload.repository.owner.login,
            repo: payload.repository.name,
            issue_number: payload.pull_request.number,
            body: "Hello from my app"
        });
    } catch (error: any) {
        if (error.response) {
            console.error(`Error! Status: ${error.response.status}. Message: ${error.response.data.message}`);
        } else {
            console.error(error);
        }
    }
});
  
// Optional: Handle errors
app.webhooks.onError((error: any) => {
    if (error.name === 'AggregateError') {
        // Log Secret verification errors
        console.log(`Error processing request: ${error.event}`);
    } else {
        console.log(error);
    }
});
  
  // Launch a web server to listen for GitHub webhooks
  const port = process.env.PORT || 3000
  const path = '/api/webhook'
  const localWebhookUrl = `http://localhost:${port}${path}`
  
  // See https://github.com/octokit/webhooks.js/#createnodemiddleware for all options
  const middleware = createNodeMiddleware(app.webhooks, { path })
  
  http.createServer(middleware).listen(port, () => {
    console.log(`Server is listening for events at: ${localWebhookUrl}`)
    console.log('Press Ctrl + C to quit.')
  })
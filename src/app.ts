import dotenv from 'dotenv';
import fs from 'fs';
import { Octokit, App } from 'octokit';
import { createNodeMiddleware } from '@octokit/webhooks';
import { createServer } from 'node:http';
import { AppOptions } from './types';
import { handleWebhookEvent } from './handleWebhookEvent.ts';

dotenv.config();

export function readPrivateKey(privateKeyPath: string): string {
  if (!fs.existsSync(privateKeyPath)) {
    throw new Error(`Private key file not found: ${privateKeyPath}`);
  }
  return fs.readFileSync(privateKeyPath, 'utf8');
}

export function createApp(
  appId: number,
  privateKey: string,
  webhookSecret: string,
  enterpriseHostname?: string
): App {
  const appOptions: AppOptions = {
    appId,
    privateKey,
    webhooks: {
      secret: webhookSecret
    }
  };

  if (enterpriseHostname) {
    appOptions.Octokit = Octokit.defaults({
      baseUrl: `https://${enterpriseHostname}/api/v3`
    });
  }

  return new App(appOptions);
}

function startWebhooksServer(app: App, port: number, path: string): void {
  const localWebhookUrl = `http://localhost:${port}${path}`;
  const middleware = createNodeMiddleware(app.webhooks, { path });

  createServer(middleware).listen(port, () => {
    console.log(`Server is listening for events at: ${localWebhookUrl}`);
    console.log('Press Ctrl + C to quit.');
  });
}

export function main(): void {
  const appId = process.env.APP_ID;
  const webhookSecret = process.env.WEBHOOK_SECRET;
  const privateKeyPath = process.env.PRIVATE_KEY_PATH;
  const enterpriseHostname = process.env.ENTERPRISE_HOSTNAME;
  const port = 3000;
  const path = '/api/webhook';

  if (!appId || !webhookSecret || !privateKeyPath) {
    throw new Error('Missing required configuration');
  }

  const privateKeyContent = readPrivateKey(privateKeyPath);
  const app = createApp(parseInt(appId, 10), privateKeyContent, webhookSecret, enterpriseHostname);

  //   app.octokit.request('/app').then(({ data }: { data: any }) => {
  //     app.octokit.log.debug(`Authenticated as '${data.name}'`);
  //   });

  handleWebhookEvent(app);

  startWebhooksServer(app, port, path);
}

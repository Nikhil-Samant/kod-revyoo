import { createApp, readPrivateKey } from '../src/app';
import { jest } from '@jest/globals';
import fs from 'fs';

afterEach(() => {
  jest.restoreAllMocks();
});

describe('App', () => {
  it('should create an instance of App', () => {
    const appId = 123;
    const privateKey = 'private-key';
    const webhookSecret = 'mysecret';

    const app = createApp(appId, privateKey, webhookSecret);

    expect(app).toBeDefined();
  });
  it('should create an instance of App for an enterprise', () => {
    const appId = 123;
    const privateKey = 'private-key';
    const webhookSecret = 'mysecret';
    const enterpriseHostname = 'github.mycompany.com';

    const app = createApp(appId, privateKey, webhookSecret, enterpriseHostname);

    expect(app).toBeDefined();
  });
});

describe('readPrivateKey', () => {
  it('should read the private key from a file if file path', () => {
    const privateKey = 'private-key';
    jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => privateKey);

    const key = readPrivateKey('path/to/private-key');

    expect(key).toEqual(privateKey);
  });

  it('should throw exception when file path not exists', () => {
    jest.spyOn(fs, 'existsSync').mockImplementation(() => false);

    expect(() => readPrivateKey('path/to/private-key')).toThrow();
  });
});

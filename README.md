# Kod Revyoo Project

Improve your code quality with the help of AI.
This application uses Github REST apis via Ocktokit in order to interact with Github events

## Project Structure

The project has the following structure:

```
typescript-project
├── src
│   ├── app.ts
│   ├── githubService.ts
│   ├── llmService.ts
│   ├── index.ts
│   └── types
│       └── index.ts
├── tests
│   ├── app.test.ts
│   ├── githubService.test.ts
│   └── llmService.test.ts
├── package.json
├── tsconfig.json
└── README.md

```

## Getting Started

To set up and use this TypeScript project, follow these steps:

1. Clone the repository.
2. Install the dependencies by running `npm install`.
3. Run the tests by running `npm test`.
4. Run the smee test client `npx smee -u SMEE_WEBPROXY_URL -t http://localhost:3000/api/webhook`
5. Start the application by running `npm start`.

Happy coding!

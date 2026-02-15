# open-synapse

Open Synapse is a open-source agent tool that help you do whatever you want.

## Quick start

1. Make sure you have bun and docker installed
2. Go to `projects/backend`, check `ConfigReader.ts` and `docker-compose.yml` to create a valid `.env` file
3. Run `docker compose up -d` to bring up dependent services
4. Go back to root dir and run `bun i` to install all dependencies.
5. Then run `bun dev` to bring up everything.
6. Now you can visit the browser to see how it goes.

## Architecture

The system is composed of three main components: the backend, the UI, and the synapse. Everything is built with TypeScript.

### Backend

The backend serves 2 purposes:

1. Store and manage the agent context, so that the context can be easily shared and persisted.
2. Orchestrate the execution of the agent, including the interaction with the synapse and the UI.

It basically combined with 2 services:

1. The API server, provides RESTful APIs for the UI and the synapse to interact with the system.
2. The worker, responsible for executing the agent logic, including calling the LLM and others.

### UI

The UI is built with React and provides a user-friendly interface for users to interact with the system. It basically provides 3 functions:

1. Chat interface, where users can chat with the agent and see the response.
2. A2UI interface, where users can see the agent's thought process and the action it wants to take, and decide whether to allow it or not. And the artifacts (text, images, interactive UIs) that agent creates during the execution.
3. Management interface, where users can manage lots of things, like account, agent configuration, and so on.

### Synapse

The synapse is how the agent interacts with the outside world. It can be installed on someone's local machine, and provide some tools for the agent to use. The synapse will pull commands from the backend, execute them in the local environment, and then push the results back to the backend.

Synapse is also included alone with UI in the client app, to make it easier to be used.

## Development

In previous quick start, we have already set up the development environment. Here are some tips for development:

1. To debug the backend, you can run `bun dev --filter frontend` to only start the frontend. And then you can press `F5` in VSCode to start and debug the backend.

2. To debug the UI, you should just follow the quick start guide, and then open the browser dev tool to debug the UI.

## Contributing

Contributions are welcome! If you want to contribute, please follow these principles:

1. Be responsible for your code. Leveraging AI to write code is fine, but make sure to know what is the right thing to do.
2. Follow the existing code patterns and styles. Try to keep the codebase consistent. If you think there is a better way to do things, please discuss it in the issue or the PR first.
3. Our goal is to build a universal platform with minimal implementation. So please try to consider if the feature you want to add is really compatible with the existing mechanism.

## Features

Here are the features it needs to make it a universal platform:

### User self info management

Of course we need this. This is the most basic feature, user information is stored centrally in the backend, and can be easily accessed and updated by the UI.

### Extension

This is one of the most important features. The system should be able to support various extensions, which can be easily added and removed by users.

Extension works like a MCP server and is installed and run in the Synapse. It can provide various tools to be called by the llm, like executing shell commands, read and write files, and so on. The backend will send the command to the synapse, and then the synapse will execute the command and send the result back to the backend.

### AI generated UI

This is the same important as the extension. The system should be able to support AI generated UI.

The AI generated UI including two parts:

#### The instant, blocking UI

It typically used for confirmation, selection, and other interactions that need to be handled immediately. For example, when the agent wants to delete some files, it can pop up a confirmation UI to ask the user whether to allow it or not. Or when the agent wants to choose a tool to use, it can pop up a selection UI to let the user choose which tool to use.

This kind of UI is typically generated and rendered immediately, and then get the user input immediately.

The tool may also use it for other scenarios, like asking for additional approval when the agent want to all some critical operations.

#### The artifact, non-blocking UI

It typically used for displaying some information that is considered as the output of the agent. This kind of UI is considered as static and will not have any side effect to the real world.

We may allow JS or other code in the UI but we do not encourage to let it to actually modify the real world, because we should never trust instant code generated by agent.

### Agent permission control

This is actually a combination of the above two features.

The permission control is about these parts:

1. When creating an extension, we define a set of methods that can be called by the agent. We also define a set of permission categories, and then we can assign each method to one or more permission categories. Just like the scope concept in the OAuth.

2. When we start a conversation, we can decide what extensions and what permission categories the agent can use in this conversation. And what kind of permissions require user approval. For example, we can allow the agent to use the file system extension, but require user approval when it wants to write files.

3. The permissions can be more granular, for example, we can allow the agent to write files, but only in a specific directory. Or we can allow the agent to use the network extension, but only to access specific domains.

4. We may also create a set of permissions that are from different extensions, and then we can assign them to the conversation, or even set it as the default permissions for all conversations. Or other rules.

### Cross device synchronization

Since the agent context is stored in the backend, we can easily support cross device synchronization. Users can log in from different devices and see the same conversation history and agent context.

So that user can start a context on the workstation and require that agent to refactor some code, and then go grab some coffee. And when the agent wants to commit the code, and this is a operation that requires user approval, the user can receive the notification on the mobile phone, and then approve it immediately or just ask the agent to check if the UTs are passed before committing.

## Related work

1. Extension marketplace
2. Cloud synapse service, so that users do not need to set up synapse on their local machine, this can be useful when we need to provide some features that does not require to access local resources, like using some online tools.

## Future work

### Extension UI

Currently the extension is just like a MCP server, which can only provide some APIs for the agent to call. But in the future, we may want to allow the extension to also provide some UI for the agent to use, so that the extension can have a better interaction with the user.

### Skills

Users can define skills, just like other AI agent tools.

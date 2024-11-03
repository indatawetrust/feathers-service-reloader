# feathers-service-reloader

**feathers-service-reloader** is a plugin designed for [FeathersJS](https://feathersjs.com/) v5 applications, enabling real-time service reloading during development. It watches specified service files for changes and dynamically reloads them without requiring a full restart of your FeathersJS app. This is especially useful for a smooth development workflow, where changes to service files, schemas, and shared modules are immediately applied.

> **Note**: This package specifically handles changes to service files only, allowing you to apply modifications to your services without restarting the entire application. As the number of services in a project grows, restarting the whole application with tools like `nodemon` can take several seconds. With **feathers-service-reloader**, individual services reload in milliseconds, making development faster and more efficient.

> **Compatibility**: This package is designed to work exclusively with FeathersJS v5.

## Features

- Watches FeathersJS service files for changes
- Automatically reloads modified services
- Clears module cache to apply the latest updates
- Removes AJV schemas and reloads them dynamically

## Installation

Install the package via npm:

```bash
npm install feathers-service-reloader --save-dev
```

## Usage
Add feathers-service-reloader as a plugin in your FeathersJS v5 application to enable dynamic service reloading.

Example
```js
import { serviceReloader } from 'feathers-service-reloader';

const app: Application = express(feathers())

// Initialize the service reloader plugin
if (process.env.NODE_ENV === 'development') {
  serviceReloader(app)
}

```

## Configuration
feathers-service-reloader uses a default configuration to watch for changes in *.class.ts, *.schema.ts, *.shared.ts, and *.ts files within the services directory. When a change is detected, the service is automatically reloaded, and AJV schemas associated with the service are removed and refreshed.

## Updating validators.ts
To ensure proper schema reloading, make sure that dataValidator in your validators.ts file is set up as follows:

```js
export const dataAjv = new Ajv({});
export const dataValidator: Ajv = addFormats(dataAjv, formats);
```

## Recommended dev Script
To prevent nodemon from restarting your application when files in the src/services/ directory are modified, you can use the following dev script in your package.json:

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development nodemon --ignore src/services/ -x ts-node src/index.ts",
  }
}
```

This setup will ignore changes in the src/services/ directory, allowing feathers-service-reloader to handle those changes without restarting the entire application.

## API
serviceReloader(app)
app: Your FeathersJS application instance.
This function takes in a FeathersJS app instance and sets up file watching on the specified service files.

## How It Works
- File Watching: The plugin watches for changes in specified files (class, schema, shared, and .ts).
- Module Cache Clearing: It clears the require cache, ensuring that the latest version of the modified files is loaded.
- Schema Update: Uses AJV's removeSchema method to delete outdated schemas, allowing the latest ones to be applied on reload.

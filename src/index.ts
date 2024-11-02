import fs from "node:fs";
import path from "node:path";

function camelCase(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

function pascalCase(str: string) {
  const camel = camelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

const FILE_REGEX = /^([^\\/]+)\/([^\\/]+)\.(class|schema|shared|ts)$/;

export function serviceReloader(app: any) {
  const watchPath = path.resolve(process.cwd(), "./src/services");

  fs.watch(watchPath, { recursive: true }, async (_, filename) => {
    if (filename && FILE_REGEX.test(filename)) {
      console.time("reload time");

      const service = filename.match(FILE_REGEX)?.[1];

      if (!service) {
        return;
      }

      const servicePath = path.join(
        process.cwd(),
        `./src/services/${service}/${service}`
      );

      const mainSchemaName = pascalCase(service);

      try {
        delete require.cache[require.resolve(servicePath)];
        delete require.cache[require.resolve(`${servicePath}.class.ts`)];
        delete require.cache[require.resolve(`${servicePath}.schema.ts`)];
        delete require.cache[require.resolve(`${servicePath}.shared.ts`)];
      } catch (error) {
        const err = error as Error;
        console.warn(`Error occurred while clearing cache: ${err.message}`);
      }

      // @ts-ignore
      const { dataAjv } = await import(
        path.resolve(process.cwd(), "./src/validators")
      );
      const schemaNames = [
        mainSchemaName,
        `${mainSchemaName}Data`,
        `${mainSchemaName}Patch`,
      ];

      schemaNames.forEach((name) => {
        if (dataAjv.getSchema(name)) {
          dataAjv.removeSchema(name);
        }
      });

      const feathersService = await import(
        path.resolve(process.cwd(), `./src/services/${service}/${service}.ts`)
      );

      try {
        app.unuse(service);
        app.configure(feathersService[camelCase(service)]);
        console.log(`Service ${service} has been reloaded`);
      } catch (error) {
        const err = error as Error;
        console.error(
          `An error occurred while reinstalling the service: ${err.message}`
        );
      }

      console.timeEnd("reload time");
    }
  });
}

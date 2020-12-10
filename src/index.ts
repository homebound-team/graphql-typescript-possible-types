import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import { GraphQLObjectType } from "graphql";
import { Code, code, imp } from "ts-poet";
import PluginOutput = Types.PluginOutput;

/** Generates a `possibleTypes` config object for apollo. */
export const plugin: PluginFunction<Config> = async (schema, _doc, configFromFile) => {
  const unionTypesConfig = { ...defaultUnionTypesConfig, ...configFromFile.possibleTypes?.unionTypes };

  // Create a map of interface -> implementing types
  const interfaceImpls: Record<string, string[]> = {};
  Object.values(schema.getTypeMap()).forEach(type => {
    if (type instanceof GraphQLObjectType) {
      for (const i of type.getInterfaces()) {
        if (interfaceImpls[i.name] === undefined) {
          interfaceImpls[i.name] = [];
        }
        interfaceImpls[i.name].push(type.name);
      }
    }
  });
  const chunks: Code[] = [];

  chunks.push(code`
    export const possibleTypes = {
      ${Object.entries(interfaceImpls).map(([name, impls]) => {
        return `${name}: [${impls.map(n => `"${n}"`).join(", ")}],`;
      })}
    };
  `);

  if (unionTypesConfig.generate) {
    chunks.push(...addUnionTypes(interfaceImpls, unionTypesConfig));
  }

  const content = await code`${chunks}`.toStringWithImports();
  return { content } as PluginOutput;
};

// Also add type unions of the possible types for use in code if desired
function addUnionTypes(interfaceImpls: Record<string, string[]>, config: UnionTypesConfig): Code[] {
  return Object.entries(interfaceImpls).map(
    ([name, impls]) => code`
  export type ${name}Types = ${joinCodes(
      impls.map(entityName =>
        config.nonEntityTypes.includes(entityName)
          ? entityName
          : toImp(config.entityImportPattern.replace(entityNamePlaceholder, entityName)),
      ),
      " | ",
    )};
  `,
  );
}

interface Config {
  possibleTypes?: Partial<PossibleTypesConfig>;
}

interface PossibleTypesConfig {
  unionTypes?: UnionTypesConfig;
}

/**
 * generate: Indicates whether or not the union types should be generated (default `false`)
 * entityImportPattern: Used to generate import statements for entities (default `src/entities#[ENTITY]`)
 * nonEntityTypes: Specify types which are not entities, and thus don't need an import statement (default `[]`)
 */
interface UnionTypesConfig {
  generate: boolean;
  entityImportPattern: string;
  nonEntityTypes: string[];
}

const entityNamePlaceholder = "[ENTITY]";
const defaultUnionTypesConfig: UnionTypesConfig = {
  generate: false,
  entityImportPattern: `src/entities#${entityNamePlaceholder}`,
  nonEntityTypes: [],
};

/** A `.join(...)` that doesn't `toString()` elements so that they can stay codes. */
export function joinCodes(elements: unknown[], delimiter: string): unknown[] {
  const result: unknown[] = [delimiter];
  for (let i = 0; i < elements.length; i++) {
    result.push(elements[i]);
    if (i !== elements.length - 1) {
      result.push(delimiter);
    }
  }
  return result;
}

// Maps the graphql-code-generation convention of `@src/context#Context` to ts-poet's `Context@@src/context`.
export function toImp(spec: string | undefined): unknown {
  if (!spec) {
    return undefined;
  }
  const [path, symbol] = spec.split("#");
  return imp(`${symbol}@${path}`);
}

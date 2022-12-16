import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import { GraphQLObjectType, GraphQLUnionType } from "graphql";
import { code } from "ts-poet";
import PluginOutput = Types.PluginOutput;

/** Generates a `possibleTypes` config object for apollo. */
export const plugin: PluginFunction<{}> = async (schema) => {
  // Create a map of interface -> implementing types
  const interfaceImpls: Record<string, string[]> = {};
  Object.values(schema.getTypeMap()).forEach((type) => {
    if (type instanceof GraphQLObjectType) {
      for (const i of type.getInterfaces()) {
        if (interfaceImpls[i.name] === undefined) {
          interfaceImpls[i.name] = [];
        }
        interfaceImpls[i.name].push(type.name);
      }
    }
    if (type instanceof GraphQLUnionType) {
      interfaceImpls[type.name] = [];
      for (const i of type.getTypes()) {
        interfaceImpls[type.name].push(i.name);
      }
    }
  });

  const content = await code`
    export const possibleTypes = {
      ${Object.entries(interfaceImpls).map(([name, impls]) => {
        return `${name}: [${impls.map((n) => `"${n}"`).join(", ")}],`;
      })}
    };
  `.toStringWithImports();
  return { content } as PluginOutput;
};

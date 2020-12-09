import { GraphQLObjectType } from "graphql";
import { code } from "ts-poet";
import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import PluginOutput = Types.PluginOutput;

/** Generates a `possibleTypes` config object for apollo. */
export const plugin: PluginFunction<{}> = async schema => {
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

  const content = await code`
    export const possibleTypes = {
      ${Object.entries(interfaceImpls).map(([name, impls]) => {
        return `${name}: [${impls.map(n => `"${n}"`).join(", ")}],`;
      })}
    };
    
    ${addUnionTypes(interfaceImpls)}
  `.toStringWithImports();

  // Also add type unions of the possible types for use in code if desired


  return { content } as PluginOutput;
};

function addUnionTypes(interfaceImpls: Record<string, string[]>) {
  return Object.entries(interfaceImpls).map(([name, impls]) => `
  export type ${name}Types = ${impls.join(" | ")};
  `).join("");
}

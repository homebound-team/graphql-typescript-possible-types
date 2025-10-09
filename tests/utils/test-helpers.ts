import { buildSchema, GraphQLSchema, Source } from "graphql";
import { plugin } from "../../src/index";

/**
 * Test helper to create a GraphQL schema from SDL string
 */
export function createTestSchema(sdl: string, schemaFileName: string = "root.graphql"): GraphQLSchema {
  const source = new Source(sdl, schemaFileName);
  return buildSchema(source);
}

/**
 * Test helper to run the plugin with a given schema and config.
 * Returns the generated content string.
 */
export async function runPlugin(schema: GraphQLSchema, config: {} = {}): Promise<string> {
  const result = await plugin(schema, [], config);
  if (typeof result === "string") {
    return result;
  }
  return result.content;
}

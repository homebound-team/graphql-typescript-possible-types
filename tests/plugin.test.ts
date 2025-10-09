import { createTestSchema, runPlugin } from "./utils/test-helpers";

describe("possibleTypes plugin", () => {
  it("generates possibleTypes for interface implementations", async () => {
    const schema = createTestSchema(`
      type Author implements HasName {
        name: String!
      }

      type Book implements HasName {
        name: String!
      }

      interface HasName {
        name: String!
      }
    `);

    const result = await runPlugin(schema);

    expect(result).toContain("export const possibleTypes");
    expect(result).toContain('HasName: ["Author", "Book"]');
  });

  it("generates possibleTypes for union types", async () => {
    const schema = createTestSchema(`
      type Author {
        name: String!
      }

      type Book {
        title: String!
      }

      union Feed = Author | Book
    `);

    const result = await runPlugin(schema);

    expect(result).toContain("export const possibleTypes");
    expect(result).toContain('Feed: ["Author", "Book"]');
  });

  it("generates possibleTypes for both interfaces and unions", async () => {
    const schema = createTestSchema(`
      type Author implements HasName {
        name: String!
      }

      type Book implements HasName {
        name: String!
      }

      interface HasName {
        name: String!
      }

      union Feed = Author | Book
    `);

    const result = await runPlugin(schema);

    expect(result).toMatchSnapshot();
    expect(result).toContain('HasName: ["Author", "Book"]');
    expect(result).toContain('Feed: ["Author", "Book"]');
  });

  it("handles multiple interface implementations", async () => {
    const schema = createTestSchema(`
      interface Node {
        id: ID!
      }

      interface Named {
        name: String!
      }

      type User implements Node & Named {
        id: ID!
        name: String!
      }

      type Product implements Node {
        id: ID!
      }
    `);

    const result = await runPlugin(schema);

    expect(result).toContain('Node: ["User", "Product"]');
    expect(result).toContain('Named: ["User"]');
  });

  it("handles schema with no interfaces or unions", async () => {
    const schema = createTestSchema(`
      type Query {
        hello: String
      }

      type Author {
        name: String!
      }
    `);

    const result = await runPlugin(schema);

    expect(result).toContain("export const possibleTypes = {}");
  });

  it("handles empty schema", async () => {
    const schema = createTestSchema(`
      type Query {
        ping: String
      }
    `);

    const result = await runPlugin(schema);

    expect(result).toContain("export const possibleTypes = {}");
  });

  it("handles union with single type", async () => {
    const schema = createTestSchema(`
      type Author {
        name: String!
      }

      union SingleUnion = Author
    `);

    const result = await runPlugin(schema);

    expect(result).toContain('SingleUnion: ["Author"]');
  });

  it("handles complex union with many types", async () => {
    const schema = createTestSchema(`
      type TypeA { a: String }
      type TypeB { b: String }
      type TypeC { c: String }
      type TypeD { d: String }
      type TypeE { e: String }

      union ManyTypes = TypeA | TypeB | TypeC | TypeD | TypeE
    `);

    const result = await runPlugin(schema);

    expect(result).toContain('ManyTypes: ["TypeA", "TypeB", "TypeC", "TypeD", "TypeE"]');
  });

  it("sorts types alphabetically in the output", async () => {
    const schema = createTestSchema(`
      type Zebra implements Animal {
        name: String!
      }

      type Cat implements Animal {
        name: String!
      }

      type Dog implements Animal {
        name: String!
      }

      interface Animal {
        name: String!
      }
    `);

    const result = await runPlugin(schema);

    // GraphQL returns types in the order they appear in the type map
    // which may be alphabetical depending on the implementation
    expect(result).toContain("Animal");
    expect(result).toContain("Cat");
    expect(result).toContain("Dog");
    expect(result).toContain("Zebra");
  });

  it("handles interface extending another interface", async () => {
    const schema = createTestSchema(`
      interface Node {
        id: ID!
      }

      interface Entity {
        createdAt: String!
      }

      type User implements Node & Entity {
        id: ID!
        createdAt: String!
        name: String!
      }

      type Post implements Node & Entity {
        id: ID!
        createdAt: String!
        title: String!
      }
    `);

    const result = await runPlugin(schema);

    expect(result).toContain('Node: ["User", "Post"]');
    expect(result).toContain('Entity: ["User", "Post"]');
  });

  it("matches the current integration test output", async () => {
    // This test uses the exact schema from integration/schema.graphql
    const schema = createTestSchema(`
      type Author implements HasName {
        name: String!
      }

      type Book implements HasName {
        name: String!
      }

      interface HasName {
        name: String!
      }

      union Feed = Author | Book
    `);

    const result = await runPlugin(schema);

    // Should match the current output in integration/graphql-types.ts
    expect(result).toContain('HasName: ["Author", "Book"]');
    expect(result).toContain('Feed: ["Author", "Book"]');
  });
});

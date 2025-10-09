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

    expect(result).toMatchInlineSnapshot(`
     "export const possibleTypes = { HasName: ["Author", "Book"] };
     "
    `);
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

    expect(result).toMatchInlineSnapshot(`
     "export const possibleTypes = { Feed: ["Author", "Book"] };
     "
    `);
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

    expect(result).toMatchInlineSnapshot(`
     "export const possibleTypes = { HasName: ["Author", "Book"], Feed: ["Author", "Book"] };
     "
    `);
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

    expect(result).toMatchInlineSnapshot(`
     "export const possibleTypes = { Node: ["User", "Product"], Named: ["User"] };
     "
    `);
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

    expect(result).toMatchInlineSnapshot(`
     "export const possibleTypes = {};
     "
    `);
  });

  it("handles empty schema", async () => {
    const schema = createTestSchema(`
      type Query {
        ping: String
      }
    `);

    const result = await runPlugin(schema);

    expect(result).toMatchInlineSnapshot(`
     "export const possibleTypes = {};
     "
    `);
  });

  it("handles union with single type", async () => {
    const schema = createTestSchema(`
      type Author {
        name: String!
      }

      union SingleUnion = Author
    `);

    const result = await runPlugin(schema);

    expect(result).toMatchInlineSnapshot(`
     "export const possibleTypes = { SingleUnion: ["Author"] };
     "
    `);
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

    expect(result).toMatchInlineSnapshot(`
     "export const possibleTypes = { ManyTypes: ["TypeA", "TypeB", "TypeC", "TypeD", "TypeE"] };
     "
    `);
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

    expect(result).toMatchInlineSnapshot(`
     "export const possibleTypes = { Node: ["User", "Post"], Entity: ["User", "Post"] };
     "
    `);
  });
});

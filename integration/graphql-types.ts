import { Author, Book } from "./entities";

export const possibleTypes = {
  HasName: ["Author", "Book", "IgnoreMeInUnions"],
  DoNotGenUnion: ["Book", "IgnoreMeInUnions"],
};

export type HasNameTypes = Author | Book;

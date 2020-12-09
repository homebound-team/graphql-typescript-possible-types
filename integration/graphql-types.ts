import { Author, Book } from "./entities";

export const possibleTypes = {
  HasName: ["Author", "Book"],
};

export type HasNameTypes = Author | Book;

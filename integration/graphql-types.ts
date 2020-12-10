import { Author, Book } from "./entities";

export const possibleTypes = {
  HasName: ["Author", "Book", "NoImportNeeded"],
};

export type HasNameTypes = Author | Book | NoImportNeeded;

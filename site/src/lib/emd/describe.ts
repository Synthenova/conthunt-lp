import { docTitle, libraryFor, toolAbout, type EmdDoc } from "./library";
import { COLLECTION, DISCLAIMER, PICK, type EmdPage } from "./pages";

export function docDescription(page: EmdPage, doc: EmdDoc): string {
  const copy = libraryFor(page);
  switch (doc.kind) {
    case "category":
      return copy.brief;
    case "conthunt":
      return PICK;
    case "method":
      return DISCLAIMER;
    case "related":
      return COLLECTION;
    case "entries":
      return `Practical entries for ${page.query}. ${copy.entries[0]?.blurb ?? PICK}`;
    case "entry":
      return doc.entry.blurb;
    case "tools":
      return `Tools people use when they search ${page.query}. ${PICK}`;
    case "tool":
      return toolAbout(doc.tool).about;
    default: {
      const _never: never = doc;
      return docTitle(page, _never);
    }
  }
}

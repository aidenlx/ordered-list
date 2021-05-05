import { MbBookNote } from "@alx-plugins/marginnote";
import { SeqRegex_iterate } from "./setChildTitleOfNote";

export const SeqRegex_manual = /^(?<prefix>(?:\d+?\.)*)(?<suffix>x) /;

type previous = { prefix: string; suffix: number } | undefined;

function readPrevious(): previous {
  return self.previous;
}
function writePrevious(prefix: string, suffix: number) {
  if (Number.isInteger(suffix)) self.previous = { prefix, suffix };
  else throw new Error("suffix is not integer");
}

export function setSeqTitleOf(note: MbBookNote): boolean {
  const { noteTitle: srcTitle } = note;

  let newTitle: string | undefined;

  if (srcTitle && SeqRegex_manual.test(srcTitle)) {
    const match = srcTitle.match(SeqRegex_manual) as RegExpMatchArray;
    if (!match.groups) throw new Error();

    const titleBody = srcTitle.substring(match[0].length);
    const { prefix } = match.groups;
    const suffix = 1;
    newTitle = prefix + suffix + " " + titleBody;
    writePrevious(prefix, suffix);
  } else if (!srcTitle || !SeqRegex_iterate.test(srcTitle)) {
    newTitle = srcTitle ?? "";
    const previous = readPrevious();
    if (previous) {
      let { prefix, suffix } = previous;
      newTitle = prefix + ++suffix + " " + newTitle;
      writePrevious(prefix, suffix);
    }
  }
  if (newTitle) setTitle(note, newTitle);
  return Boolean(newTitle);
}

function setTitle(note: MbBookNote, newTitle: string) {
  if (!note.notebookId)
    throw new Error("MbBookNote missing notebookId, unable to update title");

  const { notebookId } = note;

  UndoManager.sharedInstance().undoGrouping("ordered-list", notebookId, () => {
    note.noteTitle = newTitle;
    Database.sharedInstance().setNotebookSyncDirty(notebookId);
  });
  NSNotificationCenter.defaultCenter().postNotificationNameObjectUserInfo(
    "RefreshAfterDBChange",
    self,
    { topicid: notebookId }
  );
}

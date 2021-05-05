import { MbBookNote } from "@alx-plugins/marginnote";

export const SeqRegex_iterate = /^(?<seq>(?:\d+?\.)*\d+) /;

function getSeq_iterate(title: string): { seq: string; body: string; } | null {
  if (!SeqRegex_iterate.test(title))
    return null;
  else {
    const match = title.match(SeqRegex_iterate) as RegExpMatchArray;
    if (!match.groups)
      throw new Error();

    const body = title.substring(match[0].length);
    return { seq: match.groups.seq, body };
  }
}
export function setChildTitleOf(note: MbBookNote): boolean {
  const { notebookId, noteTitle: title } = note;

  if (!notebookId)
    throw new Error("MbBookNote missing notebookId, unable to update title");

  function iterateChildren(note: MbBookNote, previous: string) {
    let i = 1;
    // skip childNotes when branch is closed
    if (note.mindmapBranchClose)
      return;

    for (const child of note.childNotes) {
      let title = child.noteTitle ?? "";
      let temp;
      if ((temp = getSeq_iterate(title))) {
        title = temp.body;
      }
      let currentSeq = previous + "." + i;
      child.noteTitle = currentSeq + " " + title;
      iterateChildren(child, currentSeq);
      i++;
    }
  }

  let result: ReturnType<typeof getSeq_iterate>;
  if (title && (result = getSeq_iterate(title))) {
    const { seq } = result;

    UndoManager.sharedInstance().undoGrouping(
      "ordered-list",
      notebookId,
      () => {
        iterateChildren(note, seq);
        Database.sharedInstance().setNotebookSyncDirty(notebookId);
      }
    );
    NSNotificationCenter.defaultCenter().postNotificationNameObjectUserInfo(
      "RefreshAfterDBChange",
      self,
      { topicid: notebookId }
    );

    return true;
  } else
    return false;
}

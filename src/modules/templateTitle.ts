import { MbBookNote } from "@alx-plugins/marginnote";

export const SeqRegex_iterate = /^(?<prefix>.+?)(?<suffix>(?:\.@)+) /;

function getSeq_iterate(title: string): { prefix: string; level: number, body: string; } | null {
  if (!SeqRegex_iterate.test(title))
    return null;
  else {
    const match = title.match(SeqRegex_iterate) as RegExpMatchArray;
    if (!match.groups)
      throw new Error();

    const { prefix, suffix }=match.groups;

    const level = suffix.match(/\.@/g)?.length ?? 0

    const body = title.substring(match[0].length);
    return { prefix, level, body };
  }
}
export function templateTitle(note: MbBookNote): boolean {
  const { notebookId, noteTitle: title } = note;

  if (!notebookId)
    throw new Error("MbBookNote missing notebookId, unable to update title");

  function iterateChildren(note: MbBookNote, previous: string,limit:number, nest: number) {
    let i = 1;
    // skip childNotes when branch is closed
    if (note.mindmapBranchClose)
      return;
    
    if (nest > limit) return;

    for (const child of note.childNotes) {
      const title = child.noteTitle ?? "";
      const currentSeq = previous + "." + i;
      child.noteTitle = currentSeq + " " + title;
      iterateChildren(child, currentSeq, limit, nest + 1);
      i++;
    }
  }

  let result: ReturnType<typeof getSeq_iterate>;
  if (title && (result = getSeq_iterate(title))) {
    const { prefix, level } = result;

    UndoManager.sharedInstance().undoGrouping(
      "ordered-list",
      notebookId,
      () => {
        iterateChildren(note, prefix, level, 1);
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

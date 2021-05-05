import {
  MbBookNote,
  PopupMenuOnNote_Sender,
  PopupMenuOnSelection_Sender,
} from "@alx-plugins/marginnote";
import { addonOnName } from "basic";
import { copy, showHUD } from "modules/tools";

const SeqRegex_manual = /^(?<prefix>(?:\d+?\.)*)(?<suffix>x) /;

type previous = { prefix: string; suffix: number } | undefined;

function readPrevious(): previous {
  return self.previous;
}
function writePrevious(prefix: string, suffix: number) {
  if (Number.isInteger(suffix)) self.previous = { prefix, suffix };
  else throw new Error("suffix is not integer");
}

export function onPopupMenuOnNote(sender: PopupMenuOnNote_Sender) {
  if (
    !Application.sharedInstance().checkNotifySenderInWindow(sender, self.window)
  )
    return; //Don't process message from other window

  if (!self[addonOnName]) return;  

  const note = sender.userInfo.note;

  if (!note) {
    showHUD("no note in sender");
    return;
  }

  try {
    if (!note.groupNoteId) {
      const { noteTitle: srcTitle } = note;
      const previous = readPrevious();

      let newTitle: string | undefined;

      if (!srcTitle || !SeqRegex_manual.test(srcTitle)){ // title is missing leading sequence
        newTitle = srcTitle ?? ""
        if (previous) {
          let { prefix, suffix } = previous;
          newTitle = prefix + ++suffix + " " + newTitle;
          writePrevious(prefix, suffix);
        }
      } else {
        const match = srcTitle.match(SeqRegex_manual) as RegExpMatchArray;
        if (!match.groups) throw new Error();

        const titleBody = srcTitle.substring(match[0].length);

        let { prefix, suffix:suffixStr } = match.groups;
        let suffix: number;
        if (suffixStr==="x"){
          suffix = 1;
          newTitle = prefix + suffix + " " + titleBody;
        } else 
          suffix = +suffixStr;
        writePrevious(prefix,suffix);
      }
      if (newTitle) setTitle(note, newTitle);
    }
  } catch (error) {
    showHUD(error.toString());
  }
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

const SeqRegex_iterate = /^(?<seq>(?:\d+?\.)*\d+) /;
function getSeq_iterate(title: string): { seq: string; body: string } | null {
  if (!SeqRegex_iterate.test(title)) return null;
  else {
    const match = title.match(SeqRegex_iterate) as RegExpMatchArray;
    if (!match.groups) throw new Error();

    const body = title.substring(match[0].length);
    return { seq: match.groups.seq, body };
  }
}

function setChildTitleOf(note: MbBookNote) {
  const { notebookId, noteTitle: title } = note;

  if (!notebookId)
    throw new Error("MbBookNote missing notebookId, unable to update title");

  function iterateChildren(note: MbBookNote, previous: string) {
    let i = 1;
    // skip childNotes when branch is closed
    if (note.mindmapBranchClose) return;
    
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
  }
}


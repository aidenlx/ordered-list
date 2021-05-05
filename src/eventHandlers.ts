import {
  MbBookNote,
  PopupMenuOnNote_Sender,
  PopupMenuOnSelection_Sender,
} from "@alx-plugins/marginnote";
import { addonOnName } from "basic";
import { copy, showHUD } from "modules/tools";

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
  
  function readPrevious(): {prefix:string,suffix:number}|undefined {
    return self.previous;
  }
  function writePrevious(prefix:string,suffix:number) {
    if (Number.isInteger(suffix))
      self.previous = { prefix, suffix };
    else throw new Error("suffix is not integer");
    
  }

  try {
    if (!note.groupNoteId) {
      const { noteTitle: srcTitle } = note;
      const regex = /^(?<prefix>(?:\d+?\.)*)(?<suffix>\d+|x) /;
      const previous = readPrevious();

      let newTitle: string | undefined;

      if (!srcTitle || !regex.test(srcTitle)){ // title is missing leading sequence
        newTitle = srcTitle ?? ""
        if (previous) {
          let { prefix, suffix } = previous;
          newTitle = prefix + ++suffix + " " + newTitle;
          writePrevious(prefix, suffix);
        }
      } else {
        const match = srcTitle.match(regex) as RegExpMatchArray;
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

function setTitle(note:MbBookNote, newTitle: string) {
  if (!note.notebookId) throw new Error("MbBookNote missing notebookId, unable to update title")
  
  const { notebookId } = note;

  UndoManager.sharedInstance().undoGrouping(
    "ordered-list",
    notebookId,
    () => {
      note.noteTitle = newTitle;
      Database.sharedInstance().setNotebookSyncDirty(notebookId);
    }
  );
  NSNotificationCenter.defaultCenter().postNotificationNameObjectUserInfo(
    "RefreshAfterDBChange",
    self,
    { topicid: notebookId }
  );
}

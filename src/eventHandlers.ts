import {
  PopupMenuOnNote_Sender,
} from "@alx-plugins/marginnote";
import { addonOnName } from "basic";
import { showHUD } from "modules/tools";
import { setChildTitleOf } from "./modules/setChildTitleOfNote";
import { setSeqTitleOf } from "./modules/setSeqTitleOfNote";

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
      const result1 = setSeqTitleOf(note);
      if (!result1) {
        const result2 = setChildTitleOf(note);
        if (result2) self.previous = undefined;
      }
    }
  } catch (error) {
    showHUD(error.toString());
  }
}



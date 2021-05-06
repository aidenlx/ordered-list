import {
  PopupMenuOnNote_Sender,
} from "@alx-plugins/marginnote";
import { addonOnName } from "basic";
import { templateTitle } from "modules/templateTitle";
import { showHUD } from "modules/tools";

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
      templateTitle(note);
    }
  } catch (error) {
    showHUD(error.toString());
  }
}



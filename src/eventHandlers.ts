import {
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

  try {
    copy(note.noteId??"");
  } catch (error) {
    showHUD(error.toString());
  }
}

export function onPopupMenuOnSelection(sender: PopupMenuOnSelection_Sender) {
  if (
    !Application.sharedInstance().checkNotifySenderInWindow(sender, self.window)
  )
    return; //Don't process message from other window

  if (!self[addonOnName]) return;

  const { selectionText: selection } = sender.userInfo
    .documentController;

  try {
    if (selection && selection.length) {
      copy(selection);
    }
  } catch (error) {
    showHUD(error.toString());
  }
}

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
    
  } catch (error) {
    showHUD(error.toString());
  }
}
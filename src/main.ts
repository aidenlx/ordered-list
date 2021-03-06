
import { InstMembers, ClsMembers } from "@alx-plugins/marginnote";
import { addonOnName, pluginName, toggleHandlerName, togglePlugin } from "basic";
import { bindEventHandlers, getObjCClassDeclar as getDeclar, showHUD } from "modules/tools";
import { onPopupMenuOnNote } from "./eventHandlers";

const bindEvt = bindEventHandlers([
  { event: "PopupMenuOnNote", handler: onPopupMenuOnNote },
]);

const inst: InstMembers = {
  ...bindEvt.handlers,
  notebookWillOpen(notebookid) {
    bindEvt.add();
    self[addonOnName] = NSUserDefaults.standardUserDefaults().objectForKey(
      `marginnote_${pluginName}`
    );
  },
  notebookWillClose(notebookid) {
    bindEvt.remove();
  },
  queryAddonCommandStatus() {
    if (Application.sharedInstance().studyController(self.window).studyMode < 3)
      return {
        image: "title.png",
        object: self,
        selector: toggleHandlerName + ":",
        checked: self[addonOnName] ? true : false,
      };
    return null;
  },
  [toggleHandlerName] : togglePlugin
};

const cls: ClsMembers = {};

JSB.newAddon = function (mainPath) {
  return JSB.defineClass(getDeclar(pluginName,"JSExtension"), inst, cls);
};



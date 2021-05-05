import { NotifySender } from "@alx-plugins/marginnote";
import { showHUD } from "modules/tools";

export const pluginName = "ordered-list";

export const toggleHandlerName = `toggle${pluginName}`

export const addonOnName = `${pluginName}_on`

export function togglePlugin(sender: NotifySender) {
  let lan = NSLocale.preferredLanguages().length
    ? NSLocale.preferredLanguages()[0].substring(0, 2)
    : "en";
  let cnTips, enTips;

  if (self[addonOnName]) {
    cnTips = "序号创建已停止";
    enTips = `disabled`;
    self.previous = undefined;
  } else {
    cnTips = "开始创建序号，第一个选中的笔记将被作为初始值";
    enTips = "enabled";
  }

  self[addonOnName] = !self[addonOnName]
  showHUD(lan === "zh" ? cnTips : enTips);
  NSUserDefaults.standardUserDefaults().setObjectForKey(
    self[addonOnName],
    `marginnote_${pluginName}`
  );
  Application.sharedInstance()
    .studyController(self.window)
    .refreshAddonCommands();
}

import {
  ChangeExcerptRange_Sender,
  EventHandler,
  MbBookNote,
  NotifySender,
  PopupMenuOnNote_Sender,
  PopupMenuOnSelection_Sender,
  ProcessNewExcerpt_Sender,
} from "@alx-plugins/marginnote";

const baseProps = (function () {
  let allProps: any[] = [],
    curr = {};
  do {
    let props = Object.getOwnPropertyNames(curr);
    props.forEach(function (prop) {
      if (allProps.indexOf(prop) === -1) allProps.push(prop);
    });
  } while ((curr = Object.getPrototypeOf(curr)));
  return allProps;
})();

export const getAllProperties = (obj: object) => {
  let allProps: any[] = [],
    curr = obj;
  do {
    let props = Object.getOwnPropertyNames(curr);
    props.forEach(function (prop) {
      if (allProps.indexOf(prop) === -1 && baseProps.indexOf(prop) === -1)
        allProps.push(prop);
    });
  } while ((curr = Object.getPrototypeOf(curr)));
  return allProps;
};

function isMbBookNote(obj: any): obj is MbBookNote {
  return (
    obj?.noteId !== undefined &&
    obj?.childNotes !== undefined &&
    Array.isArray(obj.childNotes)
  );
}

export function scanObject(obj: any, depth = 1): any {
  function scan(obj: any, dive?: boolean, accu: number = 0): any {
    if (typeof obj !== "undefined" && obj !== null) {
      let out: any = {};
      for (const k of getAllProperties(obj)) {
        let value;
        if (accu < depth) {
          if (
            k === "parentNote" &&
            (dive === undefined || !dive) &&
            isMbBookNote(obj[k])
          ) {
            try {
              value = scan(obj[k], false, accu + 1);
            } catch (error) {
              value = `Error scaning: ${k} accu: ${accu}`;
            }
          } else if (
            k === "childNotes" &&
            (dive === undefined || dive) &&
            Array.isArray(obj[k])
          ) {
            try {
              value = (obj[k] as any[]).map((v) => scan(v, true, accu + 1));
            } catch (error) {
              value = `Error scaning: ${k} accu: ${accu}`;
            }
          } else if (k === "excerptPic") {
            try {
              value = scan(obj[k], false, accu + 1);
            } catch (error) {
              value = `Error scaning: ${k} accu: ${accu}`;
            }
          } else value = obj[k];
        } else value = obj[k];
        Object.defineProperty(out, k, {
          value,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
      return out;
    } else {
      return undefined;
    }
  }

  return scan(obj);
}

export { showHUD, alert, copy, debug };

function showHUD(message: string, duration: number = 2) {
  Application.sharedInstance().showHUD(message, self.window, duration);
}

function alert(message: string) {
  Application.sharedInstance().alert(message);
}

/**
 * Copy to Clipboard
 */
function copy(content: string) {
  // @ts-ignore
  let pasteBoard = UIPasteboard.generalPasteboard();
  pasteBoard.string = content;
}

function debug(obj: any) {
  const replacer = (k: string, value: any) => {
    if (value === undefined) {
      return "UNDEFINED";
    } else if (typeof value === "function") {
      return value.toString();
    } else return value;
  };

  try {
    return JSON.stringify(scanObject(obj), replacer, 2);
  } catch (error) {
    showHUD(error.toString());
    return null;
  }
}

/**
 * Get Objective-C class declaration
 */
export const getObjCClassDeclar = (name: string, type: string) =>
  `${name} : ${type}`;

type HanlderBasic<T extends NotifySender> = {
  handler: EventHandler<T>;
  event: T["name"];
};

type Hanlder =
  | HanlderBasic<PopupMenuOnSelection_Sender>
  | HanlderBasic<ProcessNewExcerpt_Sender>
  | HanlderBasic<ChangeExcerptRange_Sender>
  | HanlderBasic<PopupMenuOnNote_Sender>;

export function bindEventHandlers(
  handlerList: Hanlder[]
): {
  add: () => void;
  remove: () => void;
  handlers: { [k: string]: (sender: any) => void };
} {
  const handlers: { [k: string]: (sender: any) => void } = {};
  handlerList.forEach((v) => {
    handlers["on" + v.event] = v.handler;
  });

  function add() {
    handlerList.forEach((v) => {
      NSNotificationCenter.defaultCenter().addObserverSelectorName(
        self,
        `on${v.event}:`,
        v.event
      );
    });
  }

  function remove() {
    handlerList.forEach((v) => {
      NSNotificationCenter.defaultCenter().removeObserverName(self, v.event);
    });
  }

  return { add, remove, handlers };
}

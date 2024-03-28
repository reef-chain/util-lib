import { ReplaySubject } from "rxjs";
import { SELECTED_EXTENSION_IDENT } from "../extension";

const selectedExtensionSubj: ReplaySubject<string> = new ReplaySubject<string>(
  1
);

export const selectedExtension$ = selectedExtensionSubj.asObservable();
export const setSelectedExtension = (extIdent: string): void => {
  if (extIdent) {
    try {
      localStorage.setItem(SELECTED_EXTENSION_IDENT, extIdent);
    } catch (e) {
      // when cookies disabled localStorage can throw
    }
  }
  selectedExtensionSubj.next(extIdent);
};
selectedExtension$.subscribe(extIdent =>
  console.log("SELECTED EXTENSION=", extIdent)
);

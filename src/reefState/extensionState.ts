import { ReplaySubject } from "rxjs";

const selectedExtensionSubj: ReplaySubject<string> = new ReplaySubject<string>(
  1
);

export const selectedExtension$ = selectedExtensionSubj.asObservable();
export const setSelectedExtension = (extIdent: string): void => {
  selectedExtensionSubj.next(extIdent);
};
selectedExtension$.subscribe(extIdent =>
  console.log("SELECTED EXTENSION=", extIdent)
);

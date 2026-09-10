// unusedFile.js — exports a function that is not imported by any other scanned file
export function unusedHelperFunction() {
  return 'this export is never imported internally';
}

export const UNUSED_CONSTANT = 'never referenced by other scanned files';

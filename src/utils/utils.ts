export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function getLocale() {
  if (navigator.languages !== undefined) return navigator.languages[0];
  return navigator.language;
}

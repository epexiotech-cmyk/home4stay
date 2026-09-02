export function cn(...classes: (string | undefined | null | boolean | { [key: string]: any })[]) {
  return classes
    .filter(Boolean)
    .map((c) => {
      if (typeof c === "object") {
        return Object.entries(c!)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key)
          .join(" ");
      }
      return c;
    })
    .join(" ")
    .trim();
}

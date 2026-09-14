export const TOKEN_COLORS = [
  /**
   * Leads the list because it leads the picker, and it leads the picker because
   * it is the right answer more often than any hue: "Backlog" and "To do" are
   * states without a colour, and a palette that forces a hue onto them makes
   * every board louder than the work sitting on it.
   */
  "slate",
  "indigo",
  "violet",
  "blue",
  "teal",
  "green",
  "amber",
  "orange",
  "rose",
] as const;

export type TokenColor = (typeof TOKEN_COLORS)[number];

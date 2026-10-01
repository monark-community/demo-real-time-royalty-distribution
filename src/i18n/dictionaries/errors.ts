/** Tiny client-safe copy for the error boundary (avoids shipping whole dictionaries). */
export const errorCopy = {
  en: {
    title: "Something went off the rails.",
    body: "The page hit an unexpected error. Your demo data is safe in this browser.",
    retry: "Try again",
  },
  fr: {
    title: "Quelque chose a déraillé.",
    body: "La page a rencontré une erreur inattendue. Vos données de démo restent intactes dans ce navigateur.",
    retry: "Réessayer",
  },
}

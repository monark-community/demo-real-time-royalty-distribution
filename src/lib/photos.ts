import bandRoom from "../../public/images/band-room.jpg"
import producerConsole from "../../public/images/producer-console.jpg"
import songwriterNotes from "../../public/images/songwriter-notes.jpg"

/** Every photo on the site (free Unsplash License), with its credit. See docs/assets.md. */
export const photos = {
  songwriter: {
    src: songwriterNotes,
    photographer: "Soundtrap",
    profile: "https://unsplash.com/@soundtrap",
    page: "https://unsplash.com/photos/woman-in-black-and-white-striped-long-sleeve-shirt-writing-on-white-paper-5Wj_tk8_Ens",
    usedOn: "home",
  },
  band: {
    src: bandRoom,
    photographer: "Cyril Perronace",
    profile: "https://unsplash.com/@cyril_perronace",
    page: "https://unsplash.com/photos/a-group-of-people-playing-music-in-a-room-maf-hR6Q8Bw",
    usedOn: "home",
  },
  producer: {
    src: producerConsole,
    photographer: "Bee Balogun",
    profile: "https://unsplash.com/@bee_balogun",
    page: "https://unsplash.com/photos/man-in-front-of-mixing-console-KGyzk-EvTwQ",
    usedOn: "how-it-works",
  },
} as const

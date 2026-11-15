// Every achievement on RIVIERA.OS. Unlock one with useOs.getState().unlock(id, `Achievement: ${title}`).
// The Achievements app lists them; locked ones show their hint, never their trigger.
export interface Achievement {
  id: string;
  title: string;
  description: string; // shown once unlocked
  hint: string; // shown while locked
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-command", title: "Hello, terminal", description: "Ran your first command.", hint: "The terminal is waiting." },
  { id: "coffee", title: "Root barista", description: "Made coffee as root.", hint: "Some things need superuser powers." },
  { id: "shiba-cli", title: "Command-line dog whisperer", description: "Called the Shiba from the terminal.", hint: "Dogs answer to their name." },
  { id: "shiba-pet", title: "Good boy", description: "Petted the Shiba.", hint: "Someone on the desk wants attention." },
  { id: "shiba-zoomies", title: "Zoomies", description: "Petted the Shiba until it lost it.", hint: "Keep petting." },
  { id: "map-explorer", title: "Local guide", description: "Opened the map of Antibes.", hint: "There is a map on the wall." },
  { id: "map-secret", title: "Treasure hunter", description: "Found the hidden note on the map.", hint: "Not every place on the map is labelled." },
  { id: "konami", title: "Old school", description: "Entered the Konami code.", hint: "↑ ↑ ↓ ↓ …" },
  { id: "matrix", title: "Follow the white rabbit", description: "Entered the Matrix.", hint: "There is no spoon." },
  { id: "vroom", title: "Vroom", description: "Revved the motorcycle.", hint: "Something on the shelf has an engine." },
  { id: "pi", title: "Tinkerer", description: "Opened the lab bench.", hint: "Small boards do big things." },
  { id: "mouse-door", title: "Tiny tenant", description: "Knocked on the tiny door.", hint: "Look down, near the floor." },
  { id: "night-owl", title: "Night owl", description: "Switched to night mode.", hint: "Lights down." },
  { id: "keyboard", title: "Keyboard warrior", description: "Typed on the real keyboard.", hint: "The keyboard is not just for show." },
  { id: "explorer", title: "Code tourist", description: "Opened five different projects.", hint: "Projects are worth a look." },
  { id: "sudo-fail", title: "Nice try", description: "Tried sudo without the right words.", hint: "Root is picky." },
  { id: "lite", title: "Travel light", description: "Switched to Lite mode.", hint: "Not everyone needs 3D." },
];

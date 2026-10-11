

export const VERSIONS_AVAILABLE = [
    "1.6.1",
    "Beta2.0",
    "Beta2.1",
    "2.1",
    "2.2",
    "2.5",
    "AprilFools",
    "2.65beta",
    "2.65.4"
] as const


export type VersionAvailable = (typeof VERSIONS_AVAILABLE)[number]
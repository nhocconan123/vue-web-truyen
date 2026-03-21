// Export all stores from a central location for easier imports
export { useAuthStore, type User, type AuthState, type LoginCredentials, type LoginResponse, type RegisterPayload } from './auth'
export { useCounterStore, type CounterState } from './counter'
export { useGenreStore, type Genre, type GenreState } from './genres'
export { useStoriesStore, type Story, type Chapter, type StoryStatus, type StoriesState } from './stories'

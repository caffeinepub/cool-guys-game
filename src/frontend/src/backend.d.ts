import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PlayerData {
    score: Score;
    profile: Profile;
}
export interface PlayerInput {
    username: string;
    highestLevel: bigint;
    highScore: bigint;
    devilFruit: string;
}
export interface Profile {
    username: string;
    devilFruit: string;
}
export interface Score {
    highestLevel: bigint;
    highScore: bigint;
}
export interface backendInterface {
    getLeaderboard(): Promise<Array<PlayerData>>;
    getPlayerData(): Promise<PlayerData>;
    setPlayerData(input: PlayerInput): Promise<void>;
}

// Generated by dts-bundle v0.7.3

declare module 'youtube-music-ts-api' {
    export { default } from "youtube-music-ts-api/service/youtube-music";
    export * from "youtube-music-ts-api/interfaces-primary";
    export * from "youtube-music-ts-api/interfaces-supplementary";
}

declare module 'youtube-music-ts-api/service/youtube-music' {
    import { IYouTubeMusic, IYouTubeMusicAuthenticated, IYouTubeMusicGuest } from "youtube-music-ts-api/interfaces-primary";
    export default class YouTubeMusic implements IYouTubeMusic {
        authenticate(cookiesStr: string): Promise<IYouTubeMusicAuthenticated>;
        guest(): Promise<IYouTubeMusicGuest>;
    }
}

declare module 'youtube-music-ts-api/interfaces-primary' {
    import { IPlaylistDetail, IPlaylistSummary } from "youtube-music-ts-api/interfaces-supplementary";
    export interface IYouTubeMusic {
        authenticate(cookiesStr: string): Promise<IYouTubeMusicAuthenticated>;
        guest(): Promise<IYouTubeMusicGuest>;
    }
    export interface IYouTubeMusicAuthenticated extends IYouTubeMusicGuest {
        getLibraryPlaylists(): Promise<IPlaylistSummary[]>;
        getPlaylist(id: string): Promise<IPlaylistDetail>;
    }
    export interface IYouTubeMusicGuest {
    }
}

declare module 'youtube-music-ts-api/interfaces-supplementary' {
    export interface IAlbumSummary {
        id?: string;
        name?: string;
    }
    export interface IArtistSummary {
        id?: string;
        name?: string;
    }
    export interface IPlaylistDetail {
        id?: string;
        name?: string;
        description?: string;
        count?: number;
        privacy?: string;
        tracks?: ITrackDetail[];
    }
    export interface IPlaylistSummary {
        id?: string;
        name?: string;
        count?: number;
    }
    export interface ITrackDetail {
        id?: string;
        title?: string;
        artists?: IArtistSummary[];
        album?: IAlbumSummary;
        duration?: string;
    }
}


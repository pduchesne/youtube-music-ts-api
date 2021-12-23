import * as http from "http";
import sha1 from "sha1";
import YouTubeMusicGuest from "./youtube-music-guest";
import { IAlbumSummary, IArtistSummary, IPlaylistSummary, ITrackDetail } from "../interfaces-supplementary";
import { IYouTubeMusicAuthenticated} from "../interfaces-primary";

export default class YouTubeMusicAuthenticated extends YouTubeMusicGuest implements IYouTubeMusicAuthenticated {
    private hsid: string;
    private ssid: string;
    private apisid: string;
    private sapisid: string;
    private secure3psid: string;
    private secure3papisid: string;
    private authUser: number;

    constructor(hsid: string, ssid: string, apisid: string, sapisid: string, secure3psid: string, secure3papisid: string, authUser: number) {
        super();
        this.hsid = hsid;
        this.ssid = ssid;
        this.apisid = apisid;
        this.sapisid = sapisid;
        this.secure3psid = secure3psid;
        this.secure3papisid = secure3papisid;
        this.authUser = authUser;
    }

    protected generateHeaders(): http.OutgoingHttpHeaders {
        return {
            ...super.generateHeaders(),
            "Authorization": this.generateAuthorization(),
            "Cookie": this.generateCookie(),
            "X-Goog-AuthUser": this.authUser
        };
    }

    private generateAuthorization(): string {
        let time = new Date().getTime();
        const input = `${time} ${this.secure3papisid} ${this.origin}`;
        const digest = sha1(input);
        return `SAPISIDHASH ${time}_${digest}`;
    }

    private generateCookie(): string {
        return `HSID=${this.hsid}; SSID=${this.ssid}; APISID=${this.apisid}; SAPISID=${this.sapisid}; __Secure-3PSID=${this.secure3psid}; __Secure-3PAPISID=${this.secure3papisid}`;
    }

    async getLibraryAlbums(): Promise<IAlbumSummary[]> {
        const response = await this.sendRequest("browse", {
            browseId: "FEmusic_liked_albums",
        });
        return this.albumParser.parseAlbumsSummaryResponse(response);
    }

    async getLibraryArtists(): Promise<IArtistSummary[]> {
        const response = await this.sendRequest("browse", {
            browseId: "FEmusic_library_corpus_track_artists",
        });
        return this.artistParser.parseArtistsSummaryResponse(response);
    }

    async getLibraryPlaylists(): Promise<IPlaylistSummary[]> {
        const response = await this.sendRequest("browse", {
            browseId: "FEmusic_liked_playlists",
        });
        return this.playlistParser.parsePlaylistsSummaryResponse(response);
    }

    async getLibraryTracks(): Promise<ITrackDetail[]> {
        return this.getLibraryTracksInternal();
    }

    async getHistory(): Promise<ITrackDetail[]> {
        const response = await this.sendRequest("browse", {
            browseId: "FEmusic_history",
        });
        return this.historyParser.parseHistoryResponse(response);
    }

    private async getLibraryTracksInternal(): Promise<ITrackDetail[]> {
        const data = {
            browseId: "FEmusic_liked_videos",
        };
        const response = await this.sendRequest("browse", data);
        const tracksDetailResponse = this.trackParser.parseTracksDetailResponse(response);
        while (tracksDetailResponse.continuationToken) {
            const continuation = await this.sendRequest("browse", data, `ctoken=${tracksDetailResponse.continuationToken}&continuation=${tracksDetailResponse.continuationToken}`);
            this.trackParser.parseTracksDetailContinuation(tracksDetailResponse, continuation);
        }
        return tracksDetailResponse.tracks;
    }

    private async getHistoryInternal(): Promise<ITrackDetail[]> {
        const data = {
            browseId: "FEmusic_liked_videos",
        };
        const response = await this.sendRequest("browse", data);
        const tracksDetailResponse = this.trackParser.parseTracksDetailResponse(response);
        while (tracksDetailResponse.continuationToken) {
            const continuation = await this.sendRequest("browse", data, `ctoken=${tracksDetailResponse.continuationToken}&continuation=${tracksDetailResponse.continuationToken}`);
            this.trackParser.parseTracksDetailContinuation(tracksDetailResponse, continuation);
        }
        return tracksDetailResponse.tracks;
    }

    async createPlaylist(name: string, description?: string, privacy?: string, sourcePlaylistId?: string): Promise<IPlaylistSummary> {
        const response = await this.sendRequest("playlist/create", {
            title: name,
            description: description,
            privacyStatus: privacy || 'PRIVATE',
            sourcePlaylistId: this.playlistIdTrim(sourcePlaylistId)
        });
        if (!response || !response.playlistId) {
            return undefined;
        }
        return {
            id: response.playlistId,
            name: name,
            count: 0
        };
    }

    async deletePlaylist(playlistId: string): Promise<boolean> {
        const response = await this.sendRequest("playlist/delete", {
            playlistId: this.playlistIdTrim(playlistId)
        });
        return response.status === "STATUS_SUCCEEDED";
    }

    async addTracksToPlaylist(playlistId: string, ...tracks: ITrackDetail[]): Promise<boolean> {
        const response = await this.sendRequest("browse/edit_playlist", {
            playlistId: this.playlistIdTrim(playlistId),
            actions: tracks.map(track => {
                return {
                    action: "ACTION_ADD_VIDEO",
                    addedVideoId: track.id
                };
            })
        });
        return response.status === "STATUS_SUCCEEDED";
    }

    async removeTracksFromPlaylist(playlistId: string, ...tracks: ITrackDetail[]): Promise<boolean> {
        const actions: any[] = [];
        for (const track of tracks) {
            if (!track.id) {
                throw new Error("Track ID is missing. Ensure you have both the ID and the Alternate ID.");
            } else if (!track.alternateId) {
                throw new Error("Track Alternate ID is missing. Ensure you have both the ID and the Alternate ID.")
            } else {
                actions.push({
                    action: "ACTION_REMOVE_VIDEO",
                    removedVideoId: track.id,
                    setVideoId: track.alternateId
                });
            }
        }
        const response = await this.sendRequest("browse/edit_playlist", {
            playlistId: this.playlistIdTrim(playlistId),
            actions: actions
        });
        return response.status === "STATUS_SUCCEEDED";
    }
}

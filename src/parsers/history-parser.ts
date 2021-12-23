import BaseParser from "./base-parser";
import TrackParser from "./track-parser";
import { IInternalPlaylistDetail } from "../interfaces-internal";
import { IPlaylistSummary, ITrackDetail } from "../interfaces-supplementary";

export default class HistoryParser extends BaseParser {

    parseHistoryResponse(response: any): ITrackDetail[] {
        const trackParser = new TrackParser();

        let history: IPlaylistSummary[] = [];
        const items: any[] = this.traverse(response, "contents", "singleColumnBrowseResultsRenderer", "tabs", "0", "tabRenderer", "content", "sectionListRenderer", "contents", "*", "musicShelfRenderer", "contents", "*", "musicResponsiveListItemRenderer");
        if (Array.isArray(items)) {
            history = items.map(item => trackParser.parseTrackDetail(item))
        }
        return history;
    }




}

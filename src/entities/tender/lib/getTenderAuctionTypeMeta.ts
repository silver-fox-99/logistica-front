import { TenderAuctionType } from "../model/types";

export function getTenderAuctionTypeLabel(
    auctionType: TenderAuctionType,
    t: (key: string) => string,
) {
    switch (auctionType) {
        case TenderAuctionType.DECREASING:
            return t("tenders.auctionType.DECREASING");

        case TenderAuctionType.INCREASING:
            return t("tenders.auctionType.INCREASING");

        default:
            return auctionType;
    }
}
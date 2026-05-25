import type { TenderBid } from "@/entities/tender/model/types";

export function sortedBids(bids: TenderBid[]) {
    return [...bids].sort((a, b) => {
        const byAmount = Number(a.amount) - Number(b.amount);

        if (byAmount !== 0) return byAmount;

        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
}

export function getBidderName(bid: TenderBid, fallback: string) {
    if (!bid.bidder) return fallback;

    return [bid.bidder.first_name, bid.bidder.last_name].filter(Boolean).join(" ") || fallback;
}
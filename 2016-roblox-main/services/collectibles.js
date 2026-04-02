import { getCollectibleInventory } from "./inventory";
import { getResaleData } from "./economy";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getEntryAssetId = (entry) => {
  return entry?.assetId
    || entry?.asset?.id
    || entry?.asset?.assetId
    || entry?.item?.id
    || entry?.itemId
    || entry?.collectibleItemId
    || entry?.id
    || null;
};

export const getUserCollectibleRapTotal = async ({ userId, maxPages = 25 }) => {
  const numericUserId = Number(userId);
  if (!Number.isFinite(numericUserId)) {
    return 0;
  }

  const collectibleEntries = [];
  let cursor = "";

  for (let page = 0; page < maxPages; page++) {
    const response = await getCollectibleInventory({
      userId: numericUserId,
      cursor,
      limit: 100,
    });

    const batch = response?.data || response?.Data || response?.items || [];
    collectibleEntries.push(...batch);

    const nextCursor = response?.nextPageCursor || response?.nextCursor || null;
    if (!nextCursor) {
      break;
    }
    cursor = nextCursor;
  }

  const assetIds = [...new Set(
    collectibleEntries
      .map(getEntryAssetId)
      .filter(v => Number.isFinite(Number(v)))
      .map(v => Number(v))
  )];

  let totalRap = 0;
  for (const assetId of assetIds) {
    try {
      const resale = await getResaleData({ assetId });
      totalRap += toNumber(resale?.recentAveragePrice);
    } catch (e) {
      // ignore missing resale data for specific items
    }
  }

  return totalRap;
};


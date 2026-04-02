import { useEffect, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import Link from "../link";
import Theme2016 from "../theme2016";
import PlayerImage from "../playerImage";
import ItemImage from "../itemImage";
import Paging from "../pagination2016";
import { getCollectibleInventory } from "../../services/inventory";
import { getItemDetails, getItemUrl } from "../../services/catalog";
import { getResaleData } from "../../services/economy";
import { getUserInfo } from "../../services/users";

const useStyles = createUseStyles({
  page: {
    background: '#e3e3e3',
    minHeight: '100vh',
    paddingBottom: '2rem',
  },
  backRow: {
    paddingTop: '1.5rem',
    paddingBottom: '0.5rem',
  },
  backLink: {
    color: '#0055b3',
    fontSize: '18px',
    fontWeight: 500,
    textDecoration: 'none',
  },
  title: {
    fontSize: '44px',
    fontWeight: 300,
    color: 'rgb(25,25,25)',
    marginBottom: '0.25rem',
  },
  subtitle: {
    color: '#757575',
    marginBottom: '1.5rem',
  },
  sideCard: {
    background: '#fff',
    boxShadow: '0 1px 4px 0 rgb(25 25 25 / 25%)',
    padding: '1rem',
    marginBottom: '1rem',
  },
  avatarWrap: {
    maxWidth: '360px',
    margin: '0 auto',
  },
  avatarImage: {
    maxWidth: '100%',
  },
  statCard: {
    background: '#fff',
    boxShadow: '0 1px 4px 0 rgb(25 25 25 / 25%)',
    padding: '0.75rem 1rem',
  },
  statLabel: {
    color: '#757575',
    fontSize: '12px',
    textTransform: 'uppercase',
    marginBottom: '0.25rem',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 600,
    color: 'rgb(25,25,25)',
    marginBottom: 0,
  },
  gridCard: {
    background: '#fff',
    boxShadow: '0 1px 4px 0 rgb(25 25 25 / 25%)',
    padding: '1.25rem',
    '@media (min-width: 992px)': {
      width: 'calc(100% + 260px)',
      marginRight: '-260px',
    },
    '@media (max-width: 991px)': {
      width: '100%',
      marginRight: 0,
    },
  },
  limitedsColumn: {
    paddingLeft: '28px',
    '@media(max-width: 992px)': {
      paddingLeft: '12px',
    },
  },
  gridHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  gridTitle: {
    fontSize: '24px',
    fontWeight: 300,
    marginBottom: 0,
  },
  countLabel: {
    color: '#757575',
    marginBottom: 0,
  },
  collectibleCard: {
    background: '#fff',
    border: '1px solid #d6d6d6',
    boxShadow: '0 1px 3px rgb(25 25 25 / 12%)',
    height: '100%',
    padding: '0.4rem',
  },
  imageWrap: {
    background: '#f6f6f6',
    border: '1px solid #ededed',
    marginBottom: '0.35rem',
    minHeight: '108px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemThumb: {
    maxWidth: '100%',
    width: '100%',
    margin: '0 auto',
    display: 'block',
    paddingTop: '0 !important',
  },
  limitedLabel: {
    marginBottom: '0.4rem',
    display: 'block',
  },
  fakeLimitedLabel: {
    display: 'block',
    height: '16px',
    marginBottom: '0.4rem',
  },
  itemName: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'rgb(25,25,25)',
    marginBottom: '0.3rem',
    minHeight: '34px',
  },
  itemMeta: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '0.1rem',
  },
  valueRow: {
    borderTop: '1px solid #efefef',
    marginTop: '0.5rem',
    paddingTop: '0.5rem',
  },
  valueLabel: {
    color: '#757575',
    fontSize: '12px',
    textTransform: 'uppercase',
    marginBottom: '0.15rem',
  },
  valueNumber: {
    fontWeight: 600,
    fontSize: '16px',
    color: 'rgb(25,25,25)',
    marginBottom: 0,
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    padding: '2rem 0',
  },
  error: {
    color: '#111',
    marginBottom: '1rem',
  },
});

const chunk = (items, size) => {
  const result = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value) => {
  return `R$ ${toNumber(value).toLocaleString()}`;
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

const getEntryUserAssetId = (entry) => {
  return entry?.userAssetId
    || entry?.userAsset?.id
    || entry?.instanceId
    || entry?.userItemId
    || null;
};

const getEntrySerial = (entry) => {
  const serial = entry?.serialNumber
    || entry?.serial
    || entry?.userAsset?.serialNumber
    || entry?.collectibleItemInstanceId
    || null;
  return typeof serial === 'number' || typeof serial === 'string' ? serial : null;
};

const getDisplayErrorMessage = (error) => {
  const apiError = error?.response?.data?.errors?.[0]?.message;
  const raw = (apiError || error?.message || 'Failed to load collectibles.').toString().trim();

  return raw
    .replace(/^Request failed with status code \d+:\s*/i, '')
    .replace(/^\d+:\s*/, '')
    .trim();
};

const UserCollectibles = props => {
  const itemsPerPage = 8;
  const s = useStyles();
  const [userInfo, setUserInfo] = useState(null);
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!props.userId) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const userId = parseInt(props.userId, 10);
        const infoPromise = getUserInfo({ userId });

        const collectibleEntries = [];
        let cursor = '';

        for (let page = 0; page < 25; page++) {
          const response = await getCollectibleInventory({
            userId,
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

        const detailsMap = new Map();
        for (const group of chunk(assetIds, 50)) {
          const detailResponse = await getItemDetails(group);
          (detailResponse?.data?.data || []).forEach(item => {
            detailsMap.set(item.id, item);
          });
        }

        const resaleEntries = await Promise.all(assetIds.map(async (assetId) => {
          try {
            const resale = await getResaleData({ assetId });
            return [assetId, resale];
          } catch (e) {
            return [assetId, null];
          }
        }));
        const resaleMap = new Map(resaleEntries);

        const normalizedEntries = collectibleEntries
          .map((entry, index) => {
            const assetId = Number(getEntryAssetId(entry));
            if (!Number.isFinite(assetId)) {
              return null;
            }

            const details = detailsMap.get(assetId) || {};
            const resale = resaleMap.get(assetId) || {};

            const itemRestrictions = details.itemRestrictions || entry.itemRestrictions || [];
            const recentAveragePrice = toNumber(resale.recentAveragePrice ?? details.recentAveragePrice);
            const value = toNumber(
              resale.lowestResalePrice
              ?? resale.lowestPrice
              ?? details.lowestPrice
              ?? details.price
            );

            return {
              key: `${getEntryUserAssetId(entry) || assetId}-${getEntrySerial(entry) || index}`,
              assetId,
              userAssetId: getEntryUserAssetId(entry),
              serialNumber: getEntrySerial(entry),
              name: details.name || entry?.name || `Collectible ${assetId}`,
              creatorName: details.creatorName || entry?.creator?.name || 'Unknown',
              creatorType: details.creatorType || entry?.creator?.type || 'User',
              creatorTargetId: details.creatorTargetId || entry?.creator?.id || 1,
              itemRestrictions,
              recentAveragePrice,
              value,
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.value - a.value || b.recentAveragePrice - a.recentAveragePrice);

        const user = await infoPromise;

        if (!cancelled) {
          setUserInfo(user);
          setEntries(normalizedEntries);
          setPage(1);
        }
      } catch (e) {
        if (!cancelled) {
          setError(getDisplayErrorMessage(e));
          setEntries([]);
          setPage(1);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [props.userId]);

  const totals = useMemo(() => {
    return entries.reduce((acc, item) => {
      acc.rap += toNumber(item.recentAveragePrice);
      acc.value += toNumber(item.value);
      return acc;
    }, { rap: 0, value: 0 });
  }, [entries]);

  const totalPages = Math.max(1, Math.ceil(entries.length / itemsPerPage));
  const pageStart = (page - 1) * itemsPerPage;
  const pagedEntries = entries.slice(pageStart, pageStart + itemsPerPage);

  return <Theme2016>
    <div className={s.page}>
      <div className='container'>
        <div className={'row ' + s.backRow}>
          <div className='col-12'>
            <Link href='/home'>
              <a className={s.backLink}>&larr; Back to Zekoro</a>
            </Link>
          </div>
        </div>
        <div className='row'>
          <div className='col-12'>
            <h1 className={s.title}>{userInfo?.name || 'User'}&apos;s Collectibles</h1>
            <p className={s.subtitle}>All limiteds in one place, with your character and collection totals.</p>
          </div>
        </div>
        <div className='row align-items-start'>
          <div className='col-12 col-lg-5 mb-4'>
            <div className={s.sideCard}>
              <div className={s.avatarWrap}>
                <PlayerImage id={props.userId} name={userInfo?.name || 'Avatar'} className={s.avatarImage} />
              </div>
            </div>
            <div className={s.statCard}>
              <div className='row'>
                <div className='col-6'>
                  <p className={s.statLabel}>RAP</p>
                  <p className={s.statValue}>{formatCurrency(totals.rap)}</p>
                </div>
                <div className='col-6'>
                  <p className={s.statLabel}>Value</p>
                  <p className={s.statValue}>{formatCurrency(totals.value)}</p>
                </div>
              </div>
            </div>
          </div>
          <div className={'col-12 col-lg-7 mb-4 ' + s.limitedsColumn}>
            <div className={s.gridCard}>
              <div className={s.gridHeader}>
                <h2 className={s.gridTitle}>Limiteds</h2>
                <p className={s.countLabel}>{entries.length.toLocaleString()} item{entries.length === 1 ? '' : 's'}</p>
              </div>
              {error ? <p className={s.error}>{error}</p> : null}
              {loading ? <p className={s.empty}>Loading collectibles...</p> : null}
              {!loading && !error && entries.length === 0 ? <p className={s.empty}>This user does not have any collectibles yet.</p> : null}
              <div className='row'>
                {!loading && !error && pagedEntries.map(item => {
                  const isLimitedUnique = item.itemRestrictions.includes('LimitedUnique');
                  const isLimited = !isLimitedUnique && item.itemRestrictions.includes('Limited');

                  return <div className='col-6 col-md-4 col-lg-3 mb-2' key={item.key}>
                    <div className={s.collectibleCard}>
                      <Link href={getItemUrl({ assetId: item.assetId, name: item.name })}>
                        <a className='text-decoration-none'>
                          <div className={s.imageWrap}>
                            <ItemImage id={item.assetId} name={item.name} className={s.itemThumb} />
                          </div>
                          <span className={isLimitedUnique ? `icon-limited-unique-label ${s.limitedLabel}` : isLimited ? `icon-limited-label ${s.limitedLabel}` : s.fakeLimitedLabel} />
                          <p className={s.itemName}>{item.name}</p>
                        </a>
                      </Link>
                      <p className={s.itemMeta}>By {item.creatorName}</p>
                      <p className={s.itemMeta}>Serial: {item.serialNumber ? `#${item.serialNumber}` : 'N/A'}</p>
                      <div className={s.valueRow}>
                        <div className='row'>
                          <div className='col-6'>
                            <p className={s.valueLabel}>RAP</p>
                            <p className={s.valueNumber}>{formatCurrency(item.recentAveragePrice)}</p>
                          </div>
                          <div className='col-6'>
                            <p className={s.valueLabel}>Value</p>
                            <p className={s.valueNumber}>{formatCurrency(item.value)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                })}
              </div>
              {!loading && !error && entries.length > itemsPerPage ? <Paging
                page={page}
                totalItems={entries.length}
                limit={itemsPerPage}
                nextPageAvailable={() => page < totalPages}
                previousPageAvailable={() => page > 1}
                loadNextPage={() => setPage(page + 1)}
                loadPreviousPage={() => setPage(page - 1)}
              /> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  </Theme2016>;
};

export default UserCollectibles;

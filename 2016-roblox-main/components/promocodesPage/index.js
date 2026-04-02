import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import request from "../../lib/request";

const useStyles = createUseStyles({
  page: {
    maxWidth: '980px',
    margin: '34px auto 48px',
    background: '#fff',
    padding: '0 10px',
    '@media(max-width: 768px)': {
      margin: '20px auto 32px',
      padding: '0 16px',
    },
  },
  title: {
    fontSize: '24px',
    fontWeight: 400,
    color: '#1f2d3d',
    marginBottom: '18px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1.15fr 0.85fr',
    '@media(max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  info: {
    paddingRight: '34px',
    borderRight: '1px solid #cfcfcf',
    minHeight: '180px',
    '@media(max-width: 768px)': {
      borderRight: 0,
      borderBottom: '1px solid #cfcfcf',
      paddingRight: 0,
      paddingBottom: '24px',
      marginBottom: '24px',
    },
  },
  panel: {
    paddingLeft: '34px',
    '@media(max-width: 768px)': {
      paddingLeft: 0,
    },
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#222',
    marginBottom: '12px',
  },
  paragraph: {
    fontSize: '15px',
    lineHeight: 1.55,
    color: '#222',
    marginBottom: '18px',
  },
  note: {
    marginTop: '32px',
  },
  formRow: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    marginTop: '8px',
    '@media(max-width: 768px)': {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  },
  input: {
    width: '190px',
    border: '1px solid #888',
    borderRadius: 0,
    padding: '8px 10px',
    outline: 'none',
    '@media(max-width: 768px)': {
      width: '100%',
    },
  },
  button: {
    background: '#148f1d',
    color: '#fff',
    border: '1px solid #0f7417',
    borderRadius: 0,
    fontWeight: 700,
    minWidth: '88px',
    padding: '8px 14px',
    '&:hover': {
      background: '#19a824',
    },
    '&:disabled': {
      opacity: 0.7,
      cursor: 'not-allowed',
    },
  },
  alert: {
    padding: '10px 12px',
    marginBottom: '16px',
    border: '1px solid transparent',
  },
  error: {
    background: '#fbe3e3',
    borderColor: '#d86868',
    color: '#8b2020',
  },
  success: {
    background: '#e2f4e5',
    borderColor: '#6fbd7a',
    color: '#1f5f29',
  },
  reward: {
    marginTop: '18px',
  },
  rewardTitle: {
    fontSize: '16px',
    marginBottom: '10px',
  },
  rewardCard: {
    width: '180px',
    border: '1px solid #ddd',
    background: '#fff',
  },
  rewardImage: {
    width: '100%',
    height: '180px',
    display: 'block',
    objectFit: 'contain',
    background: '#fff',
    padding: '12px',
  },
  rewardBody: {
    padding: '10px 12px',
  },
  rewardName: {
    margin: 0,
    fontWeight: 600,
    color: '#222',
  },
});

const PromocodesPage = () => {
  const s = useStyles();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const response = await request('GET', `/promocodes/redeem?code=${encodeURIComponent(code.trim())}`);
      setResult({
        success: true,
        ...response.data,
      });
    } catch (err) {
      const msg = err?.response?.data?.errors?.[0]?.message || err?.message || 'Failed to redeem promocode';
      setResult({
        success: false,
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return <div className={s.page}>
    <h1 className={s.title}>Redeem ZEKORO Promotions</h1>
    <div className={s.layout}>
      <section className={s.info}>
        <h3 className={s.sectionTitle}>How to Use</h3>
        <p className={s.paragraph}>Have you received a ZEKORO promotional code from one of our many events or giveaways?</p>
        <p className={s.paragraph}>This is the place to claim your goods. Enter the promotional code in the section to the right.</p>
        <p className={`${s.paragraph} ${s.note}`}>Promotional codes may expire, or only be active for a short period of time.</p>
      </section>

      <section className={s.panel}>
        <h3 className={s.sectionTitle}>Enter Your Code:</h3>

        {result && <div className={`${s.alert} ${result.success ? s.success : s.error}`}>{result.message}</div>}

        <form onSubmit={onSubmit}>
          <div className={s.formRow}>
            <input
              className={s.input}
              type='text'
              placeholder='Enter code'
              value={code}
              onChange={(e) => setCode(e.currentTarget.value)}
            />
            <button className={s.button} type='submit' disabled={loading}>
              {loading ? '...' : 'Redeem'}
            </button>
          </div>
        </form>

        {result?.success && (result.assetId || result.robux) ? <div className={s.reward}>
          <h4 className={s.rewardTitle}>You received:</h4>
          <div className={s.rewardCard}>
            {result.assetId ? <a href={`/catalog/${result.assetId}/--`}>
              <img className={s.rewardImage} src={`/thumbs/asset.ashx?assetId=${result.assetId}`} alt={result.name || 'Reward'} />
            </a> : <img className={s.rewardImage} src='/UnsecuredContent/robux.png' alt='Robux reward' />}
            <div className={s.rewardBody}>
              <p className={s.rewardName}>{result.assetId ? (result.name || 'Unknown Item') : `${Number(result.robux).toLocaleString()} Robux`}</p>
            </div>
          </div>
        </div> : null}
      </section>
    </div>
  </div>
}

export default PromocodesPage;

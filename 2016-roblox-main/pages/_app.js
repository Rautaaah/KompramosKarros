import '../styles/globals.css';
import '../styles/helpers/textHelpers.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// Roblox CSS
import '../styles/roblox/icons.css';
import Navbar from '../components/navbar';
import React, {useEffect} from 'react';
import Head from 'next/head';
import Footer from '../components/footer';
import NextNProgress from "nextjs-progressbar";
import LoginModalStore from '../stores/loginModal';
import AuthenticationStore from '../stores/authentication';
import NavigationStore from '../stores/navigation';
import { apply, getTheme, themeType } from '../services/theme';
import MainWrapper from '../components/mainWrapper';
import GlobalAlert from '../components/globalAlert';
import ThumbnailStore from "../stores/thumbnailStore";
import getFlag from "../lib/getFlag";
import Chat from "../components/chat";

class ClientErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('[client-error-boundary] page render error', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='container mt-4'>
          <div style={{ background: '#fff', padding: '16px', color: '#000' }}>
            Something went wrong loading this page. Please refresh.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

if (typeof window !== 'undefined') {
  console.log(String.raw`
      _______      _________      _____       ______     _
     / _____ \    |____ ____|    / ___ \     | ____ \   | |
    / /     \_\       | |       / /   \ \    | |   \ \  | |
    | |               | |      / /     \ \   | |   | |  | |
    \ \______         | |      | |     | |   | |___/ /  | |
     \______ \        | |      | |     | |   |  ____/   | |
            \ \       | |      | |     | |   | |        | |
     _      | |       | |      \ \     / /   | |        |_|
    \ \_____/ /       | |       \ \___/ /    | |         _
     \_______/        |_|        \_____/     |_|        |_|

     Keep your account safe! Do not paste any text here.

     If someone is asking you to paste text here then you're
     giving someone access to your account, your gear, and
     your ROBUX.
	`);
}

function RobloxApp({ Component, pageProps }) {
  // Force refresh when a new build is deployed so users don't get stale chunks/white pages from cached JS.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const buildId = window.__NEXT_DATA__ && window.__NEXT_DATA__.buildId;
      if (!buildId) return;

      const lastBuildKey = 'zekoro:lastBuildId';
      const reloadGuardKey = 'zekoro:reloadedForBuild:' + buildId;
      const previousBuild = localStorage.getItem(lastBuildKey);

      if (previousBuild && previousBuild !== buildId && !sessionStorage.getItem(reloadGuardKey)) {
        sessionStorage.setItem(reloadGuardKey, '1');
        localStorage.setItem(lastBuildKey, buildId);

        const doReload = () => window.location.reload();
        if (window.caches && typeof window.caches.keys === 'function') {
          window.caches.keys()
            .then(keys => Promise.all(keys.map(key => window.caches.delete(key))))
            .finally(doReload);
        } else {
          doReload();
        }
        return;
      }

      localStorage.setItem(lastBuildKey, buildId);
    } catch (err) {
      console.error('[build-refresh] failed', err);
    }
  }, []);

  // set theme:
  // jss globals apparently don't support parameters/props, so the only way to do a dynamic global style is to either append a <style> element, use setAttribute(), or append a css file.
  // @ts-ignore
  useEffect(() => {
    const el = typeof window !== 'undefined' && document.getElementsByTagName('body');
    if (el && el.length) {
      const theme = getTheme();
      apply(theme);
      const divBackground =
        theme === themeType.obc2016
          ? 'url(/img/Unofficial/obc_theme_2016_bg.png) repeat-x #222224'
          : theme === themeType.dark
            ? '#141922'
            : document.getElementById('theme-2016-enabled')
              ? '#e3e3e3'
              : '#fff';
      el[0].setAttribute('style', 'background: ' + divBackground);
    }
  }, [pageProps]);

  return <div>
    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin={''} />
      <title>{pageProps.title || 'Zekoro'}</title>
      <link rel='icon' type='image/png' href='/img/favicon.png' />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
    </Head>
    <AuthenticationStore.Provider>
      <LoginModalStore.Provider>
        <NavigationStore.Provider>
          <Navbar/>
        </NavigationStore.Provider>
      </LoginModalStore.Provider>
      <GlobalAlert />
      <MainWrapper>
        {getFlag('clientSideRenderingEnabled', false) ? <NextNProgress options={{showSpinner: false}} color='#fff' height={2} /> : null}
        <ThumbnailStore.Provider>
          <ClientErrorBoundary>
            <Component {...pageProps} />
            <Chat />
          </ClientErrorBoundary>
        </ThumbnailStore.Provider>
      </MainWrapper>
      <Footer/>
    </AuthenticationStore.Provider>
  </div>
}

export default RobloxApp;

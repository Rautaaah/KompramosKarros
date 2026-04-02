import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { getTheme, themeType } from "../../services/theme";
import AuthenticationStore from "../../stores/authentication";
import NavigationStore from "../../stores/navigation";
import LinkEntry from "./components/linkEntry";
import request, { getBaseUrl, getFullUrl } from "../../lib/request";

const useNavSideBarStyles = createUseStyles({
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 999,
  },
  card: {
    width: '175px',
    background: '#f2f2f2',
    height: '100vh',
    paddingLeft: '10px',
    paddingRight: '10px',
  },
  username: {
    fontSize: '18px',
    paddingTop: '8px',
    paddingBottom: '5px',
    marginBottom: 0,
    color: '#1e1e1f',
  },
  divider: {
    borderBottom: '2px solid #c3c3c3',
    height: '2px',
    width: '100%',
  },
  upgradeNowButton: {
    marginTop: '10px',
    background: p => {
      if (p.theme === themeType.obc2016) return '#1f1f22';
      if (p.theme === themeType.dark) return '#1f3554';
      return '#2b5f9e';
    },
    fontSize: '15px',
    fontWeight: 500,
    width: '100%',
    paddingTop: '8px',
    paddingBottom: '8px',
    textAlign: 'center',
    color: p => p.theme === themeType.obc2016 ? 'white' : 'white',
    borderRadius: '4px',
    '&:hover': {
      background: p => {
        if (p.theme === themeType.obc2016) return '#2a2a2f';
        if (p.theme === themeType.dark) return '#29466d';
        return '#3870b4';
      },
    },
  },
});

const NavSideBar = props => {
  const authStore = AuthenticationStore.useContainer();
  const navStore = NavigationStore.useContainer();
  const mainNavBarRef = props.mainNavBarRef;
  const [avatarMenu, setAvatarMenu] = useState('R15');
  const getWindowDimensions = () => {
    if (typeof window === 'undefined') {
      return { height: 0, width: 1920 };
    }
    return {
      height: window.innerHeight,
      width: window.innerWidth,
    };
  };
  const [dimensions, setDimensions] = useState(getWindowDimensions);
  const [userData, setUserData] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const s = useNavSideBarStyles({
    theme: getTheme(),
  });
  
  useEffect(() => {
    const menuType = localStorage.getItem('rbx_avatarmenu_type');
      if (menuType === 'Legacy' || menuType === 'R15') {
        setAvatarMenu(menuType);
      }

    const onResize = () => {
      setDimensions(getWindowDimensions());
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onResize);
      onResize();
    }
    
    const getStaffData = async () => {
      try {
        const response = await request('GET', getFullUrl('users', '/v1/users/authenticated'));
        setUserData(response.data);
        
        if (response.data.isStaff) {
          const [pendingIcons, pendingAssets, pendingGroupIcons] = await Promise.all([
            request('GET', `/admin-api/api/icons/pending-assets`),
            request('GET', `/admin-api/api/assets/pending-assets`),
            request('GET', `/admin-api/api/groups/pending-icons`)
          ]);
          
          let count = 0;
          
          if (pendingIcons.data) {
            count += pendingIcons.data.length;
          }

          if (pendingAssets.data) {
            count += pendingAssets.data.length;
          }

          if (pendingGroupIcons.data) {
            count += pendingGroupIcons.data.length;
          }
          
          setPendingCount(count);
        }
      } catch (error) {
        console.error('Failed to fetch staff data:', error);
      }
    };
    
    getStaffData();
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', onResize);
      }
    };
  }, []);
  
  const paddingTop = mainNavBarRef.current && mainNavBarRef.current.clientHeight + 'px' || 0;

  if (navStore.isSidebarOpen === false && dimensions.width <= 1300) {
    return null;
  }
  
  const characterUrl = avatarMenu === 'R15' ? '/My/Avatar' : '/My/Character.aspx';

  return <div className={s.container}>
    <div className={s.card} style={{ paddingTop: paddingTop }}>
      <p className={s.username}>{authStore.username}</p>
      <div className={s.divider} />
      <LinkEntry name='Home' url='/home' icon='icon-nav-home' />
      <LinkEntry name='Profile' url={'/users/' + authStore.userId + '/profile'} icon='icon-nav-profile' />
      <LinkEntry name='Messages' url='/My/Messages' icon='icon-nav-message' count={authStore.notificationCount.messages} />
      <LinkEntry name='Friends' url={'/users/' + authStore.userId + '/friends'} icon='icon-nav-friends' count={authStore.notificationCount.friendRequests} />
      <LinkEntry name='Avatar' url={characterUrl} icon='icon-nav-charactercustomizer' />
      <LinkEntry name='Inventory' url={'/users/' + authStore.userId + '/inventory'} icon='icon-nav-inventory' />
      <LinkEntry name='Trade' url='/My/Trades.aspx' icon='icon-nav-trade' count={authStore.notificationCount.trades} />
      <LinkEntry name='Groups' url='/My/Groups.aspx' icon='icon-nav-group' />
      <LinkEntry name='Forums' url='/Forum/Default.aspx' icon='icon-nav-forum' />
      {userData?.isStaff && <LinkEntry name='Admin' url='/admin' icon='icon-nav-friends' count={pendingCount} />}
	  <LinkEntry name='Promocodes' url='/promocodes' icon='icon-nav-blog' />
      <a href='/BuildersClub/Upgrade.ashx'><p className={s.upgradeNowButton}>Upgrade Now</p></a>
    </div>
  </div>
}

export default NavSideBar;

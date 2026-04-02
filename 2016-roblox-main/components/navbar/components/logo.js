import { createUseStyles } from "react-jss";
import NavigationStore from "../../../stores/navigation";

const useLogoStyles = createUseStyles({
  imgDesktop: {
    width: '168px',
    height: '34px',
    display: 'none',
    '@media(min-width: 1301px)': {
      display: 'block',
    },
  },
  imgMobile: {
    width: '30px',
    height: '30px',
    display: 'block',
    '@media(min-width: 1301px)': {
      display: 'none',
    },
  },
  imgMobileWrapper: {
    marginLeft: '40px',
  },
  col: {
    maxWidth: '190px',
  },
  openSideNavMobile: {
    display: 'none',
    '@media(max-width: 1300px)': {
      display: 'block',
      float: 'left',
      height: '30px',
      width: '30px',
      cursor: 'pointer',
    },
  },
});
const Logo = () => {
  const s = useLogoStyles();
  const navStore = NavigationStore.useContainer();

  return <div className={`${s.col} col-2 col-lg-2`}>
    <div className={s.openSideNavMobile + ' icon-menu'} onClick={() => {
      navStore.setIsSidebarOpen(!navStore.isSidebarOpen);
    }}></div>
    <img className={s.imgDesktop} src='/img/zekoro_logo.png' alt='Zekoro' />
    <div className={s.imgMobileWrapper}>
      <img className={s.imgMobile} src='/img/favicon.png' alt='Zekoro' />
    </div>
  </div>
}

export default Logo;

import { useState } from "react";
import { createUseStyles } from "react-jss";
import getFlag from "../../../lib/getFlag";
import { launchGame } from "../../../services/games";
import AuthenticationStore from "../../../stores/authentication";
import gameDetailsStore from "../stores/gameDetailsStore";
import useButtonStyles from "../../../styles/buttonStyles";
import ActionButton from "../../actionButton";

const useStyles = createUseStyles({
  buttonWrapper: {
    width: '100%',
    maxWidth: '200px',
  },
  button: {
    width: '100%',
    paddingTop: '2px',
    paddingBottom: '4px',
  },
  disabledText: {
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: '8px',
  },
  webPlayButton: {
    width: '100%',
    marginTop: '8px',
    padding: '4px 8px',
    border: '1px solid #8f8f8f',
    background: '#f7f7f7',
    color: '#1a1a1a',
    cursor: 'pointer',
    '&:hover': {
      background: '#efefef',
    },
    '&:disabled': {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  },
})

/**
 * Play button
 * @param {{placeId: number}} props 
 * @returns 
 */
const PlayButton = props => {
  const [error, setError] = useState(null);
  const auth = AuthenticationStore.useContainer();
  const gameDetails = gameDetailsStore.useContainer();
  const s = useStyles();
  const buttonStyles = useButtonStyles();
  
  const onClick = e => {
    if (!gameDetails.placeDetails?.isPlayable) return;
    
    if (getFlag('launchUsingEsURI', false)) {
      e?.preventDefault();
      if (!auth.isAuthenticated) {
        window.location.href = '/';
        return;
      }
      launchGame({
        placeId: props.placeId,
		year: gameDetails.placeDetails?.year || 2016,
      }).catch(e => {
		// todo: modal
        setError(e.message);
      });
    } else if (getFlag('launchUsingEsWeb', false)) {
      window.location.href = '/RobloxApp/Play?placeId=' + props.placeId;
    } else {
	  // TODO: Roblox URI handling here (is this even possible?)
      alert('Support for joining ROBLOX games is not implemented. You will be redirected to ROBLOX to play this game.');
      window.location.href = 'https://www.roblox.com/games/' + props.placeId + '/--';
    }
  }

  const onWebPlayClick = () => {
    if (!gameDetails.placeDetails?.isPlayable) return;
    if (!auth.isAuthenticated) {
      window.location.href = '/';
      return;
    }
    window.location.href = `/webplayer/4883.html?placeId=${encodeURIComponent(props.placeId)}`;
  }

  const isDisabled = !gameDetails.placeDetails?.isPlayable;

  return <div className='row'>
    <div className={'col-12 mx-auto ' + s.buttonWrapper}>
      {error && <p className='text-danger mb-1 mt-1'>{error}</p>}
      {isDisabled && <p className={s.disabledText}>You cannot access this place at this time.</p>}
      <ActionButton 
        label='Play' 
        className={s.button + ' ' + buttonStyles.buyButton} 
        onClick={onClick}
        disabled={isDisabled}
      />
      <button className={s.webPlayButton} onClick={onWebPlayClick} disabled={isDisabled}>
        Play in Browser (Beta)
      </button>
    </div>
  </div>
}

export default PlayButton;

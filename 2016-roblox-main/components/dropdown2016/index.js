import { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import useCardStyles from "../userProfile/styles/card";

const useStyles = createUseStyles({
  wrapper: {
    position: 'relative',
    display: 'inline-flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    userSelect: 'none',
  },
  trigger: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    border: 0,
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: '2px',
    '&:hover': {
      background: '#f2f2f2',
    },
    '&:focus': {
      outline: 'none',
      boxShadow: '0 0 0 2px rgba(0, 162, 255, 0.35)',
    },
  },
  dropdown: {
    minWidth: '140px',
    background: 'white',
    position: 'absolute',
    top: 'calc(100% + 6px)',
    right: 0,
    borderRadius: '2px',
    zIndex: 20,
    overflow: 'hidden',
  },
  dropdownEntry: {
    width: '100%',
    display: 'block',
    textDecoration: 'none',
    '&:hover': {
      background: '#e3e3e3',
    },
  },
  dropdownText: {
    marginBottom: 0,
    fontSize: '16px',
    padding: '8px 10px',
    color: 'rgb(33, 37, 41)',
  },
  dropdownDots: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  dot: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: '#111',
  },
});

/**
 * Dropdown
 * @param {{options: {url?: string; name: string; onClick?: (e: any) => void}[]}} props
 * @returns
 */
const Dropdown2016 = props => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const cardStyles = useCardStyles();
  const s = useStyles();

  useEffect(() => {
    const onPointerDown = event => {
      if (!wrapperRef.current || wrapperRef.current.contains(event.target)) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, []);

  return <div className={s.wrapper} ref={wrapperRef}>
    <button
      type='button'
      className={s.trigger}
      aria-haspopup='menu'
      aria-expanded={isOpen}
      onClick={() => {
        setIsOpen(!isOpen);
      }}
    >
      <span className={s.dropdownDots} aria-hidden='true'>
        <span className={s.dot} />
        <span className={s.dot} />
        <span className={s.dot} />
      </span>
    </button>
    {
      isOpen && <div className={s.dropdown + ' ' + cardStyles.card}>
        {
          props.options.map(v => {
            return <a
              href={v.url || '#'}
              onClick={e => {
                if (v.onClick) {
                  v.onClick(e);
                }
                setIsOpen(false);
              }}
              className={s.dropdownEntry}
              key={v.name}
            >
              <p className={s.dropdownText}>{v.name}</p>
            </a>
          })
        }
      </div>
    }
  </div>
}

export default Dropdown2016;

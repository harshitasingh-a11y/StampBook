import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Crown, Eye, Pencil } from 'lucide-react';
import type { ShareRecipient } from '@/types/book';
import styles from './ParticipantsAvatar.module.css';

interface ParticipantsAvatarProps {
  ownerName?: string;
  recipients?: ShareRecipient[];
  yourAccessLevel?: 'can edit' | 'view only';
  isSharedView?: boolean;
  accentColor?: string;
}

export default function ParticipantsAvatar({
  ownerName = 'Owner',
  recipients = [],
  yourAccessLevel = 'view only',
  isSharedView = false,
  accentColor = '#5e6b7a',
}: ParticipantsAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitial = (name: string) => name.charAt(0).toUpperCase();
  const getColor = (canEdit: boolean) => (canEdit ? accentColor : '#c0bab3');

  // Build participant list
  const participants = isSharedView
    ? [
        { name: ownerName, role: 'owner', color: accentColor },
        { name: 'You', role: yourAccessLevel, color: getColor(yourAccessLevel === 'can edit') },
      ]
    : [
        { name: 'You', role: 'owner', color: accentColor },
        ...recipients.map((r) => ({
          name: r.displayName,
          role: r.canEdit ? 'can edit' : 'view only',
          color: getColor(r.canEdit),
        })),
      ];

  const displayCount = Math.min(4, participants.length);
  const moreCount = Math.max(0, participants.length - 4);

  return (
    <div ref={dropdownRef} className={styles.container}>
      <button className={styles.avatarButton} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.avatarStack}>
          {participants.slice(0, displayCount).map((p, i) => (
            <div
              key={i}
              className={styles.avatar}
              style={{
                background: p.color,
                zIndex: displayCount - i,
                transform: `translateX(${-i * 10}px)`,
              }}
            >
              {getInitial(p.name)}
            </div>
          ))}
          {moreCount > 0 && (
            <div className={styles.moreCount}>+{moreCount}</div>
          )}
        </div>
        <ChevronDown size={16} className={styles.chevron} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {participants.map((p, i) => (
            <div key={i} className={styles.participantItem}>
              <div
                className={styles.participantAvatar}
                style={{ background: p.color }}
              >
                {getInitial(p.name)}
              </div>
              <div className={styles.participantInfo}>
                <div className={styles.participantName}>{p.name}</div>
                <div className={styles.participantRole}>
                  {p.role === 'owner' && (
                    <>
                      <Crown size={14} strokeWidth={1.7} className={styles.roleIcon} />
                      <span>owner</span>
                    </>
                  )}
                  {p.role === 'can edit' && (
                    <>
                      <Pencil size={14} strokeWidth={1.7} className={styles.roleIcon} />
                      <span>can edit</span>
                    </>
                  )}
                  {p.role === 'view only' && (
                    <>
                      <Eye size={14} strokeWidth={1.7} className={styles.roleIcon} />
                      <span>view only</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

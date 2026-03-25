import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Crown, Eye, Pencil } from 'lucide-react';
import type { ShareRecipient } from '@/types/book';
import styles from './ParticipantsAvatar.module.css';

interface Participant {
  name: string;
  role: 'owner' | 'can edit' | 'view only';
  color: string;
}

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build participant list
  const buildParticipants = (): Participant[] => {
    const list: Participant[] = [];

    if (isSharedView) {
      if (ownerName?.trim()) {
        list.push({ name: ownerName, role: 'owner', color: accentColor });
      }
      list.push({
        name: 'You',
        role: yourAccessLevel || 'view only',
        color: yourAccessLevel === 'can edit' ? accentColor : '#c0bab3',
      });
    } else {
      list.push({ name: 'You', role: 'owner', color: accentColor });
      recipients.forEach((r) => {
        if (r.displayName?.trim()) {
          list.push({
            name: r.displayName,
            role: r.canEdit ? 'can edit' : 'view only',
            color: r.canEdit ? accentColor : '#c0bab3',
          });
        }
      });
    }

    return list;
  };

  const participants = buildParticipants();
  const displayCount = Math.min(4, participants.length);
  const hiddenCount = participants.length - displayCount;

  return (
    <div ref={dropdownRef} className={styles.container}>
      <button className={styles.avatarButton} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.avatarStack}>
          {participants.slice(0, displayCount).map((p) => (
            <div
              key={p.name}
              className={styles.avatar}
              style={{
                background: p.color,
                zIndex: displayCount,
              }}
              title={p.name}
            >
              {p.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {hiddenCount > 0 && (
            <div className={styles.moreCount} title={`+${hiddenCount} more`}>
              +{hiddenCount}
            </div>
          )}
        </div>
        <ChevronDown size={16} className={styles.chevron} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {participants.map((p) => (
            <div key={p.name} className={styles.participantItem}>
              <div className={styles.participantAvatar} style={{ background: p.color }}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className={styles.participantInfo}>
                <div className={styles.participantName}>{p.name}</div>
                <div className={styles.participantRole}>
                  {p.role === 'owner' && <Crown size={14} strokeWidth={1.7} />}
                  {p.role === 'can edit' && <Pencil size={14} strokeWidth={1.7} />}
                  {p.role === 'view only' && <Eye size={14} strokeWidth={1.7} />}
                  <span>{p.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

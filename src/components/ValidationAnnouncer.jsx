import React from 'react';

/**
 * Component for announcing validation errors to screen readers
 * Uses aria-live region to announce errors without interrupting user flow
 */
const ValidationAnnouncer = ({ announcements = [] }) => {
  if (announcements.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}
    >
      {announcements.map(announcement => (
        <div key={announcement.id}>
          {announcement.message}
        </div>
      ))}
    </div>
  );
};

export default ValidationAnnouncer;
import React from 'react';

export default function WarningBanner() {
  return (
    <div className="warning-banner">
      <strong>WARNING:</strong> VulnLab is an intentionally vulnerable application for educational purposes.
      NEVER deploy this to a production environment or expose it to the internet.
    </div>
  );
}

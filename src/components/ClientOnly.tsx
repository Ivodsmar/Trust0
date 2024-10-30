import React, { useState, useEffect } from 'react';

const ClientOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set isClient to true only after the component has mounted, confirming we're on the client side
    setIsClient(true);
  }, []);

  // If not on the client, render nothing
  if (!isClient) return null;

  // Render children only on the client
  return <>{children}</>;
};

export default ClientOnly;

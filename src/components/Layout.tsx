import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <header className="bg-gray-800 p-4">
        <h1 className="text-2xl font-bold">Movie Tracker</h1>
      </header>
      <main className="p-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;

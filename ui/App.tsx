import React, { useState } from 'react';
import Layout from './components/Layout';
import Placeholder from './components/Placeholder';
import { ViewType, Language } from './types';

function App() {
  const [activeView, setActiveView] = useState<ViewType>('Dashboard');
  const [language, setLanguage] = useState<Language>('en');

  return (
    <Layout
      activeView={activeView}
      setActiveView={setActiveView}
      language={language}
    >
      <Placeholder />
    </Layout>
  );
}

export default App;

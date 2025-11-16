import React from 'react';
import ClientWrapper from './components/client-wrapper';
import Header from './components/header';
import Hero from './components/hero';
import BackedBy from './components/backed-by';
import Features from './components/features';
import UseCases from './components/use-cases';
import Footer from './components/footer';
import WorkflowBuilder from './components/workflow-builder';
import Mascot from './components/mascot';

// This will be expanded with more components in the next steps
// For now, it sets up the structure.

export default function MinitapCloneV2Page() {
  return (
    <ClientWrapper>
      <main className="bg-black">
        <Header />
        <Hero />
        <Mascot />
        <BackedBy />
        <Features />
        <WorkflowBuilder />
        <UseCases />
        <Footer />
      </main>
    </ClientWrapper>
  );
}

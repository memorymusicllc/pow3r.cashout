/**
 * New Post Flow Page
 * Dedicated page for the New Post Flow workflow
 * 
 * @version 1.0.0
 * @date 2025-01-08
 */

import React from 'react';
import { NewPostFlow } from '@/components/NewPostFlow';

export function NewPostFlowPage() {
  return (
    <div className="min-h-screen bg-background">
      <NewPostFlow />
    </div>
  );
}

export default NewPostFlowPage;

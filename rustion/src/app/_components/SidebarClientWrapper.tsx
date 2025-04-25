"use client";
import dynamic from 'next/dynamic';

const ResizableSidebar = dynamic(() => import('./sidebar'), { ssr: false });

export default function SidebarClientWrapper() {
  return <ResizableSidebar />;
} 
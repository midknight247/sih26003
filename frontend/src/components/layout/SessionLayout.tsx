import React from 'react';
import { Outlet } from 'react-router-dom';
export const SessionLayout: React.FC = () => { return <div className='p-8 bg-stone-100 min-h-screen flex items-center justify-center'><Outlet /></div> };

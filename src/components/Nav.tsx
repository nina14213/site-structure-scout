import React from 'react';

interface NavProps {
    onStartGame: () => void;
}

export default function Nav({ onStartGame }: NavProps) {
    return (
        <nav className="bg-white/80 border-b border-gray-200 dark:bg-slate-900/80 dark:border-slate-700 backdrop-blur-sm sticky top-0 z-40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between items-center">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            🎮 DwC Data Quest
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onStartGame}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                        >
                            Start Game
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

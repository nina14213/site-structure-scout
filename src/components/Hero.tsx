import React from "react";

interface HeroProps {
	title?: string;
	tagline?: string;
	ctaText?: string;
	onCta?: () => void;
}

export default function Hero({
	title = "DwC Data Quest",
	tagline = "Master the Darwin Core standard and become a data steward!",
	ctaText = "Rozpocznij Grę!",
	onCta,
}: HeroProps) {
	return (
		<div className='relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950 py-24 sm:py-32'>
			<div className='mx-auto max-w-7xl px-6 lg:px-8'>
				<div className='mx-auto max-w-2xl text-center'>
					<h1 className='text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl'>
						{title}
					</h1>
					<p className='mt-6 text-lg leading-8 text-gray-600 dark:text-slate-400'>
						{tagline}
					</p>
					<div className='mt-10 flex items-center justify-center gap-x-6'>
						<button
							onClick={onCta}
							className='rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400'>
							{ctaText}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

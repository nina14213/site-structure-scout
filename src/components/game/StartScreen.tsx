import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
	Play,
	BookOpen,
	Trophy,
	Zap,
	Link as LinkIcon,
	Package,
	Shield,
	Search,
	Volume2,
	VolumeX,
	Sun,
	Moon,
	Gamepad2,
	ExternalLink,
	HelpCircle,
	Database,
	CheckCircle2,
	AlertTriangle,
	Info,
	RefreshCw,
	Hash,
	Lock,
	RotateCcw,
} from "lucide-react";
import { GameState, LeaderboardEntry } from "@/hooks/useGameProgress";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import MascotIcon from "@/components/MascotIcon";
import type { AssistantId } from "@/lib/assistants";
import { PORTAL_DEMO_DURATION_MINUTES } from "@/demo/portalDemo";

interface StartScreenProps {
	onStart: (
		playerName: string,
		targetLevel?: number,
		assistantId?: AssistantId,
	) => void;
	gameState: GameState;
	leaderboard: LeaderboardEntry[];
	soundEnabled?: boolean;
	toggleSound?: () => void;
	darkMode?: boolean;
	toggleDarkMode?: () => void;
	onLevelClick?: (levelId: number) => void;
	isLevelUnlocked?: (levelId: number) => boolean;
	getLevelProgress?: (levelId: number) => number;
	getRecommendedLevel?: () => number;
	onDataImport?: () => void;
	onAssistantChange?: (assistantId: AssistantId) => void;
	onStartOver?: (playerName: string, assistantId?: AssistantId) => void;
}

type DarwinTermsCheckStatus =
	| "idle"
	| "checking"
	| "current"
	| "changed"
	| "unavailable";

const DARWIN_TERMS_SNAPSHOT = {
	url: "https://dwc.tdwg.org/terms/",
	hash: -30719789,
	length: 401320,
	checkedAt: "2026-06-24",
	lastModified: "Fri, 12 Jun 2026 16:23:39 GMT",
};

const CONTACT_FORM_URL =
	"https://docs.google.com/forms/d/e/1FAIpQLSfS4JH25R0miP8ew-Zq5zuP3_A0dPNIxQohRM3tw-4EW4lh6g/viewform?usp=dialog"; // Wklej tutaj link do formularza kontaktowego.

function normalizeTermsPage(text: string) {
	return text.replace(/\s+/g, " ").trim();
}

function checksumText(text: string) {
	let hash = 0;
	for (let index = 0; index < text.length; index += 1) {
		hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
	}
	return hash;
}

export default function StartScreen({
	onStart,
	gameState,
	leaderboard,
	soundEnabled,
	toggleSound,
	darkMode,
	toggleDarkMode,
	onLevelClick,
	isLevelUnlocked,
	getLevelProgress,
	getRecommendedLevel,
	onDataImport,
	onAssistantChange,
	onStartOver,
}: StartScreenProps) {
	const { t } = useLanguage();
	const [playerName, setPlayerName] = useState(gameState?.playerName || "");
	const [showTutorial, setShowTutorial] = useState(false);
	const [darwinTermsStatus, setDarwinTermsStatus] =
		useState<DarwinTermsCheckStatus>("idle");
	const [darwinTermsMessage, setDarwinTermsMessage] = useState(
		`Ostatni stan bazowy zapisano ${DARWIN_TERMS_SNAPSHOT.checkedAt}. Najedź na link, aby spróbować porównać aktualną stronę TDWG.`,
	);
	const isContactFormConfigured = CONTACT_FORM_URL.trim().length > 0;

	const trimmedPlayerName = playerName.trim();
	const selectedAssistantId = gameState.assistantId;
	const isSavedPlayer = Boolean(
		gameState?.playerId && gameState.playerName === trimmedPlayerName,
	);
	const savedProgressValues = Object.values(gameState?.levelProgress ?? {});
	const hasSavedProgress =
		isSavedPlayer &&
		((gameState?.levelsCompleted?.length ?? 0) > 0 ||
			savedProgressValues.some((progress) => progress > 0));
	const recommendedLevel = isSavedPlayer
		? (getRecommendedLevel?.() ?? gameState?.currentLevel ?? 1)
		: 1;

	const levels = [
		{
			id: 1,
			nameKey: "level.1.name",
			icon: Zap,
			color:
				"from-rose-100 via-pink-100 to-fuchsia-100 dark:from-[#97356a] dark:via-[#772551] dark:to-[#56173a]",
			hoverClass:
				"hover:from-rose-200 hover:via-pink-200 hover:to-fuchsia-200 dark:hover:from-[#872d5e] dark:hover:via-[#691f48] dark:hover:to-[#4b1332]",
			textClass: "text-slate-900 dark:text-white",
			descKey: "level.1.desc",
		},
		{
			id: 2,
			nameKey: "level.2.name",
			icon: LinkIcon,
			color:
				"from-violet-100 via-purple-100 to-indigo-100 dark:from-violet-700 dark:via-purple-700 dark:to-indigo-800",
			hoverClass:
				"hover:from-violet-200 hover:via-purple-200 hover:to-indigo-200 dark:hover:brightness-110",
			textClass: "text-slate-900 dark:text-white",
			descKey: "level.2.desc",
		},
		{
			id: 3,
			nameKey: "level.3.name",
			icon: Package,
			color:
				"from-teal-100 via-cyan-100 to-sky-100 dark:from-teal-700 dark:via-cyan-700 dark:to-sky-800",
			hoverClass:
				"hover:from-teal-200 hover:via-cyan-200 hover:to-sky-200 dark:hover:brightness-110",
			textClass: "text-slate-900 dark:text-white",
			descKey: "level.3.desc",
		},
		{
			id: 4,
			nameKey: "level.4.name",
			icon: Search,
			color:
				"from-emerald-100 via-teal-100 to-cyan-100 dark:from-emerald-700 dark:via-teal-700 dark:to-cyan-800",
			hoverClass:
				"hover:from-emerald-200 hover:via-teal-200 hover:to-cyan-200 dark:hover:brightness-110",
			textClass: "text-slate-900 dark:text-white",
			descKey: "level.4.desc",
		},
		{
			id: 5,
			nameKey: "level.5.name",
			icon: Shield,
			color:
				"from-rose-100 via-orange-100 to-amber-100 dark:from-red-700 dark:via-orange-700 dark:to-orange-800",
			hoverClass:
				"hover:from-rose-200 hover:via-orange-200 hover:to-amber-200 dark:hover:brightness-110",
			textClass: "text-slate-900 dark:text-white",
			descKey: "level.5.desc",
			spanClass: "col-span-2",
		},
	];

	const handleStart = () => {
		if (trimmedPlayerName) {
			onStart(
				trimmedPlayerName,
				hasSavedProgress ? recommendedLevel : 1,
				selectedAssistantId,
			);
		}
	};

	const handleStartOver = () => {
		if (trimmedPlayerName && isSavedPlayer) {
			onStartOver?.(trimmedPlayerName, selectedAssistantId);
		}
	};

	const handleWatchDemo = () => {
		const url = new URL(window.location.href);
		url.searchParams.set("demo", "1");
		window.location.assign(url.toString());
	};

	const checkDarwinTermsFreshness = async () => {
		if (darwinTermsStatus === "checking") return;

		setDarwinTermsStatus("checking");
		setDarwinTermsMessage(
			"Pobieram aktualną stronę Darwin Core Terms i porównuję z zapamiętanym stanem...",
		);

		const controller = new AbortController();
		const timeout = window.setTimeout(() => controller.abort(), 4000);

		try {
			const response = await fetch(DARWIN_TERMS_SNAPSHOT.url, {
				cache: "no-store",
				signal: controller.signal,
			});
			if (!response.ok) throw new Error(`HTTP ${response.status}`);

			const normalized = normalizeTermsPage(await response.text());
			const currentHash = checksumText(normalized);
			const currentLength = normalized.length;
			const changed =
				currentHash !== DARWIN_TERMS_SNAPSHOT.hash ||
				currentLength !== DARWIN_TERMS_SNAPSHOT.length;

			if (changed) {
				setDarwinTermsStatus("changed");
				setDarwinTermsMessage(
					`Wykryto różnicę względem stanu z ${DARWIN_TERMS_SNAPSHOT.checkedAt}. Warto otworzyć Darwin Core Terms i sprawdzić, co zmieniło się na stronie TDWG.`,
				);
			} else {
				setDarwinTermsStatus("current");
				setDarwinTermsMessage(
					`No changes detected from the remembered state of ${DARWIN_TERMS_SNAPSHOT.checkedAt}. Last modified by server: ${DARWIN_TERMS_SNAPSHOT.lastModified}.`,
				);
			}
		} catch {
			setDarwinTermsStatus("unavailable");
			setDarwinTermsMessage(
				"Nie udało się pobrać strony z poziomu przeglądarki. Jeśli pracujesz publikacyjnie, otwórz Darwin Core Terms i sprawdź aktualny stan ręcznie.",
			);
		} finally {
			window.clearTimeout(timeout);
		}
	};

	const primaryActionClass = hasSavedProgress
		? "w-full border border-emerald-700/20 bg-gradient-to-r from-emerald-200 via-teal-200 to-sky-200 py-6 text-lg text-slate-950 shadow-md shadow-emerald-950/10 hover:from-emerald-300 hover:via-teal-300 hover:to-sky-300 hover:text-slate-950 focus-visible:ring-secondary dark:border-emerald-300/40 dark:from-emerald-700 dark:to-cyan-800 dark:text-white dark:hover:from-lime-300 dark:hover:via-green-300 dark:hover:to-emerald-400 dark:hover:text-slate-950"
		: "w-full border border-emerald-700/20 bg-gradient-to-r from-emerald-200 via-teal-200 to-sky-200 py-6 text-lg text-slate-950 shadow-md shadow-emerald-950/10 hover:from-emerald-300 hover:via-teal-300 hover:to-sky-300 hover:text-slate-950 focus-visible:ring-secondary dark:border-emerald-300/40 dark:from-emerald-700 dark:to-cyan-800 dark:text-white dark:hover:brightness-110";

	const getVisibleLevelProgress = (levelId: number) => {
		if (!isSavedPlayer) return 0;
		if (getLevelProgress) return getLevelProgress(levelId);
		if (gameState?.levelsCompleted?.includes(levelId)) return 100;
		return Math.max(
			0,
			Math.min(100, Math.round(gameState?.levelProgress?.[levelId] ?? 0)),
		);
	};

	const getVisibleUnlockState = (levelId: number) => {
		if (!isSavedPlayer) return levelId !== 5;
		return isLevelUnlocked ? isLevelUnlocked(levelId) : levelId === 1;
	};

	const handleLevelButtonClick = (levelId: number, unlocked: boolean) => {
		if (!trimmedPlayerName || !unlocked) return;

		if (isSavedPlayer && onLevelClick) {
			onAssistantChange?.(selectedAssistantId);
			onLevelClick(levelId);
			return;
		}

		onStart(trimmedPlayerName, levelId, selectedAssistantId);
	};

	const isCurrentPlayerEntry = (entry: LeaderboardEntry) => {
		if (!gameState?.playerName) return false;
		if (entry.playerId && gameState.playerId)
			return entry.playerId === gameState.playerId;
		return entry.name === gameState.playerName;
	};

	const handleLeaderboardEntryClick = (entry: LeaderboardEntry) => {
		if (!isCurrentPlayerEntry(entry)) return;
		setPlayerName(gameState.playerName || entry.name);
	};

	const handleContactFormOpen = () => {
		const url = CONTACT_FORM_URL.trim();
		if (!url) return;
		window.open(url, "_blank", "noopener,noreferrer");
	};

	const learningLinks = [
		{
			href: DARWIN_TERMS_SNAPSHOT.url,
			label: "Darwin Core Terms",
			demoId: "resource-darwin-terms",
			title: "Are Darwin Core terms up to date?",
			description:
				"The portal compares the current TDWG page with the saved state. If a change is detected, it will be updated within 24 hours.",
			onHover: checkDarwinTermsFreshness,
		},
		{
			href: "https://www.gbif.org/ipt",
			label: "GBIF IPT",
			demoId: "resource-gbif-ipt",
			title: "Publishing through the GBIF IPT",
			description:
				"If you wish to submit data for publication, you can do so via the GBIF IPT portal after preparing and reviewing your data package.",
		},
		{
			href: "https://www.gbif.org/tool/81281/gbif-data-validator",
			label: "GBIF Validator",
			demoId: "resource-gbif-validator",
			title: "Validate your package",
			description:
				"If you already have your data prepared, use GBIF Validator to ensure your files are structured correctly before publishing.",
		},
	];

	return (
		<div className='min-h-screen p-4 md:p-8 bg-background dark:bg-gradient-to-br dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950'>
			<div className='max-w-6xl mx-auto'>
				{/* Header with settings */}
				<div
					className='flex justify-end gap-4 mb-8'
					role='toolbar'
					aria-label='Ustawienia gry'>
					<LanguageToggle />
					<Button
						variant='ghost'
						size='icon'
						onClick={toggleSound}
						aria-label={soundEnabled ? "Wylacz dzwiek" : "Wlacz dzwiek"}
						aria-pressed={!!soundEnabled}
						className='text-muted-foreground hover:text-foreground'>
						{soundEnabled ? (
							<Volume2 className='w-5 h-5' aria-hidden='true' />
						) : (
							<VolumeX className='w-5 h-5' aria-hidden='true' />
						)}
					</Button>
					<Button
						variant='ghost'
						size='icon'
						onClick={toggleDarkMode}
						aria-label={darkMode ? "Wlacz jasny motyw" : "Wlacz ciemny motyw"}
						aria-pressed={!!darkMode}
						className='text-muted-foreground hover:text-foreground'>
						{darkMode ? (
							<Sun className='w-5 h-5' aria-hidden='true' />
						) : (
							<Moon className='w-5 h-5' aria-hidden='true' />
						)}
					</Button>
				</div>

				{/* Title */}
				<motion.div
					initial={{ opacity: 0, y: -30 }}
					animate={{ opacity: 1, y: 0 }}
					className='text-center mb-12'>
					<motion.div
						animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
						transition={{ duration: 4, repeat: Infinity }}
						className='mb-4 flex justify-center'
						aria-hidden='true'>
						<MascotIcon assistantId={selectedAssistantId} />
					</motion.div>
					<h1 className='text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent mb-4'>
						DwC Data Quest
					</h1>
					<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
						{t("start.tagline")}
					</p>
					<div className='flex justify-center gap-2 mt-4'>
						<Badge
							variant='outline'
							className='text-secondary border-secondary/50'>
							<Database className='w-3 h-3 mr-1' aria-hidden='true' /> Darwin
							Core
						</Badge>
						<Badge variant='outline' className='text-primary border-primary/50'>
							GBIF
						</Badge>
						<Badge variant='outline' className='text-accent border-accent/50'>
							DwC-DP
						</Badge>
					</div>
				</motion.div>

				<div className='grid lg:grid-cols-3 gap-8 items-start'>
					{/* Start Panel */}
					<motion.div
						initial={{ opacity: 0, x: 30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2 }}
						className='space-y-8 lg:order-2 lg:col-span-2'>
						<Card className='bg-card/50 border-border backdrop-blur'>
							<CardHeader>
								<CardTitle className='text-foreground flex items-center gap-2'>
									<Gamepad2
										className='w-6 h-6 text-primary'
										aria-hidden='true'
									/>
									{t("start.startMission")}
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-6'>
								<div className='space-y-2'>
									<Label htmlFor='name' className='text-muted-foreground'>
										{t("start.playerNameLabel")}
									</Label>
									<Input
										id='name'
										placeholder={t("start.playerNamePlaceholder")}
										value={playerName}
										onChange={(e) => setPlayerName(e.target.value)}
										onKeyDown={(e) => e.key === "Enter" && handleStart()}
										className='bg-muted/50 border-border text-foreground text-lg py-6'
									/>
									{isSavedPlayer && (
										<div className='flex flex-wrap items-center gap-2 pt-2'>
											<Badge
												variant='outline'
												className='border-primary/40 text-primary bg-primary/10'>
												<Hash className='w-3 h-3 mr-1' aria-hidden='true' />
												{t("start.playerId")}: {gameState.playerName} #
												{gameState.playerId}
											</Badge>
										</div>
									)}
								</div>

								<div className='space-y-3'>
									<Button
										data-demo-id='start-game'
										onClick={handleStart}
										disabled={!trimmedPlayerName}
										size='lg'
										className={primaryActionClass}>
										<Play className='w-6 h-6 mr-2' aria-hidden='true' />
										{hasSavedProgress
											? t("start.continueGame")
											: t("start.startGame")}
									</Button>

									{hasSavedProgress && (
										<Button
											onClick={handleStartOver}
											disabled={!trimmedPlayerName}
											variant='outline'
											size='lg'
											className='w-full border-amber-500/80 bg-amber-400 py-6 text-base text-slate-950 shadow-md shadow-amber-950/20 hover:border-emerald-500 hover:bg-gradient-to-r hover:from-lime-300 hover:via-green-300 hover:to-emerald-400 hover:text-slate-950 hover:shadow-lg hover:shadow-emerald-950/25 focus-visible:ring-amber-300 dark:border-amber-300 dark:bg-amber-400 dark:text-slate-950 dark:hover:border-lime-200 dark:hover:from-lime-300 dark:hover:via-green-300 dark:hover:to-emerald-400'>
											<RotateCcw className='w-5 h-5 mr-2' aria-hidden='true' />
											{t("start.startOver")}
										</Button>
									)}
								</div>

								{/* Levels preview */}
								<div className='grid grid-cols-2 gap-3 pt-4'>
									{levels.map((level, idx) => {
										const unlocked = getVisibleUnlockState(level.id);
										const levelProgress = getVisibleLevelProgress(level.id);
										const isCompleted = levelProgress >= 100;
										const progressLabel = isCompleted
											? t("levelSelect.completed")
											: levelProgress > 0
												? t("levelSelect.inProgress")
												: t("levelSelect.notStarted");
										const LevelIcon = level.icon;
										const isWideBossTile = level.id === 5;
										return (
											<motion.button
												key={level.id}
												type='button'
												layoutId={`level-${level.id}`}
												onClick={() =>
													handleLevelButtonClick(level.id, unlocked)
												}
												disabled={!unlocked || !trimmedPlayerName}
												aria-label={`${t(level.nameKey)}. ${t(level.descKey)}. ${progressLabel}: ${levelProgress}%. ${unlocked ? t("start.startGame") : t("levelSelect.locked")}`}
												aria-describedby={`start-level-${level.id}-desc`}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: 0.3 + idx * 0.1 }}
												whileHover={
													unlocked && trimmedPlayerName
														? {
																scale: 1.05,
																transition: { duration: 0.08, ease: "easeOut" },
															}
														: {}
												}
												whileTap={
													unlocked && trimmedPlayerName
														? {
																scale: 0.98,
																transition: { duration: 0.05, ease: "easeOut" },
															}
														: {}
												}
												data-task-button
												className={`relative p-4 pr-14 rounded-xl bg-gradient-to-br ${level.color} ${level.hoverClass ?? "hover:brightness-110"} ${level.spanClass ?? ""} border border-slate-700/15 shadow-lg shadow-primary/10 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed dark:border-white/25 dark:shadow-black/25 ${isWideBossTile ? "text-center" : "text-left"} hover:border-primary/40 dark:hover:border-white/60 focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-white/90 ${level.textClass ?? "text-slate-900 dark:text-white"} ${!unlocked ? "opacity-60 grayscale-[0.15]" : ""}`}>
												<div className='absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/20 bg-white/80 text-[11px] font-bold text-slate-900 shadow-inner dark:border-white/35 dark:bg-black/20 dark:text-white'>
													{!unlocked ? (
														<Lock className='w-4 h-4' aria-hidden='true' />
													) : isCompleted ? (
														<CheckCircle2
															className='w-6 h-6 text-emerald-700 drop-shadow-sm dark:text-emerald-300'
															aria-hidden='true'
														/>
													) : (
														<span>{levelProgress}%</span>
													)}
												</div>
												<div
													className={`mb-2 flex items-center gap-3 ${isWideBossTile ? "justify-center" : ""}`}>
													<LevelIcon className='w-5 h-5' aria-hidden='true' />
													<span className='font-bold text-sm leading-tight'>
														{t(level.nameKey)}
													</span>
												</div>
												<p
													id={`start-level-${level.id}-desc`}
													className='text-xs font-semibold opacity-95'>
													{t(level.descKey)}
												</p>
												<div className='mt-3 space-y-1'>
													<div className='flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-normal text-slate-700 dark:text-white/90'>
														<span className='truncate'>{progressLabel}</span>
														<span className='shrink-0'>{levelProgress}%</span>
													</div>
													<div className='h-2 overflow-hidden rounded-full border border-slate-700/15 bg-white/75 dark:border-white/15 dark:bg-black/25'>
														<div
															className='h-full rounded-full bg-primary transition-[width] duration-300 dark:bg-white'
															style={{ width: `${levelProgress}%` }}
														/>
													</div>
												</div>
											</motion.button>
										);
									})}
								</div>

								{/* Custom Data Package Option */}
								<motion.button
									type='button'
									data-demo-id='open-data-package'
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.7 }}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									onClick={onDataImport}
									aria-label={`${t("start.createDataPackage")}. ${t("start.importOwnData")}`}
									className='group w-full p-4 rounded-xl bg-gradient-to-br from-emerald-100/80 to-sky-100/80 border border-emerald-700/20 hover:border-primary/50 hover:bg-gradient-to-r hover:from-emerald-200 hover:via-teal-100 hover:to-sky-200 hover:text-slate-950 hover:shadow-lg hover:shadow-emerald-950/10 dark:from-emerald-700/20 dark:to-cyan-800/20 dark:border-emerald-600/50 dark:hover:border-emerald-500 dark:hover:from-lime-300 dark:hover:via-green-300 dark:hover:to-emerald-400 transition-all cursor-pointer text-left'>
									<div className='flex items-center gap-3 mb-2'>
										<Database
											className='w-5 h-5 text-primary group-hover:text-slate-950'
											aria-hidden='true'
										/>
										<span className='font-semibold text-foreground group-hover:text-slate-950'>
											{t("start.createDataPackage")}
										</span>
									</div>
									<p className='text-xs text-muted-foreground group-hover:text-slate-800'>
										{t("start.importOwnData")}
									</p>
								</motion.button>
							</CardContent>
						</Card>
						<section
							id='about-us'
							className='rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur'
							aria-labelledby='about-us-title'>
							<div className='mb-6'>
								<p
									id='about-us-title'
									className='mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
									About Us
								</p>
								<p className='mt-3 max-w-xl text-muted-foreground'>
									We work at Adam Mickiewicz University in Poznań, Poland, on
									biodiversity data, natural history collections, mapping,
									geotagging, and databases.
								</p>
							</div>

							<div className='grid gap-4 md:grid-cols-2'>
								<article className='rounded-xl border border-border/60 bg-background/70 p-5'>
									<a
										href='https://www.researchgate.net/profile/Katarzyna-Slupecka?ev=hdr_xprf'
										target='_blank'
										rel='noopener noreferrer'
										className='hover:underline'>
										Katarzyna Słupecka
									</a>
								</article>

								<article className='rounded-xl border border-border/60 bg-background/70 p-5'>
									<a
										href='https://www.researchgate.net/profile/Krystian-Florkowski'
										target='_blank'
										rel='noopener noreferrer'
										className='hover:underline'>
										Krystian Florkowski
									</a>
								</article>
							</div>

							<div className='mt-6 rounded-xl border border-primary/25 bg-primary/10 p-5'>
								<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
									<div className='space-y-1'>
										<h3 className='text-base font-semibold text-foreground'>
											Contact us
										</h3>
										<p className='text-sm text-muted-foreground'>
											You will be redirected to the contact form, which will open in
											a new browser tab.
										</p>
									</div>
									<Button
										type='button'
										onClick={handleContactFormOpen}
										disabled={!isContactFormConfigured}
										className='w-full sm:w-auto'>
										<ExternalLink className='w-4 h-4' aria-hidden='true' />
										Open contact form
									</Button>
								</div>
							</div>
						</section>
					</motion.div>

					{/* Side Panel */}
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.3 }}
						className='space-y-6 lg:order-1'>
						{/* How to Play */}
						<Button
							data-demo-id='how-to-play-toggle'
							variant='outline'
							className='w-full border-emerald-600/50 text-foreground hover:border-emerald-500 hover:bg-gradient-to-r hover:from-lime-300 hover:via-green-300 hover:to-emerald-400 hover:text-slate-950 hover:shadow-lg hover:shadow-emerald-950/20'
							onClick={() => setShowTutorial(!showTutorial)}
							aria-expanded={showTutorial}
							aria-controls='start-tutorial-panel'>
							<HelpCircle className='w-4 h-4 mr-2' aria-hidden='true' />
							{t("start.howToPlay")}
						</Button>

						{showTutorial && (
							<motion.div
								id='start-tutorial-panel'
								data-demo-id='how-to-play-panel'
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								className='p-4 rounded-xl bg-card/80 border border-border'>
								<h4 className='font-semibold text-foreground mb-2'>
									{t("start.tutorial.title")}
								</h4>
								<ol className='text-sm text-muted-foreground space-y-2 list-decimal list-inside'>
									<li>{t("start.tutorial.1")}</li>
									<li>{t("start.tutorial.2")}</li>
									<li>{t("start.tutorial.3")}</li>
									<li>{t("start.tutorial.4")}</li>
									<li>{t("start.tutorial.5")}</li>
								</ol>
								<p className='text-xs text-muted-foreground mt-3'>
									{t("start.tutorial.time")}
								</p>
								<Button
									data-demo-id='watch-demo'
									onClick={handleWatchDemo}
									variant='outline'
									className='mt-4 w-full border-cyan-500/50 bg-cyan-50/70 text-cyan-900 hover:border-cyan-500 hover:bg-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-100 dark:hover:bg-cyan-500/20'>
									<Play className='h-4 w-4' aria-hidden='true' />
									<span>{t("start.watchDemo")}</span>
									<Badge
										variant='outline'
										className='ml-1 border-cyan-500/40 text-cyan-800 dark:text-cyan-100'>
										{t("start.watchDemoDuration", {
											minutes: PORTAL_DEMO_DURATION_MINUTES,
										})}
									</Badge>
								</Button>
							</motion.div>
						)}

						{/* Leaderboard */}
						<Card className='border-primary/25 bg-card/85 shadow-lg shadow-primary/10 backdrop-blur dark:border-border dark:bg-card/50'>
							<CardHeader className='pb-3'>
								<CardTitle className='text-foreground flex items-center gap-2 text-lg'>
									<Trophy
										className='w-5 h-5 text-amber-700 dark:text-yellow-500'
										aria-hidden='true'
									/>
									{t("start.topRangers")}
								</CardTitle>
							</CardHeader>
							<CardContent>
								{leaderboard.length > 0 ? (
									<div className='space-y-2'>
										{leaderboard.slice(0, 5).map((entry, idx) => {
											const ownEntry = isCurrentPlayerEntry(entry);
											const rowContent = (
												<>
													<div className='flex items-center gap-2'>
														<span
															className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-black ring-1 ring-slate-950/10 ${idx === 0 ? "bg-amber-400 text-slate-950" : idx === 1 ? "bg-slate-300 text-slate-950" : idx === 2 ? "bg-orange-300 text-slate-950" : "bg-muted text-foreground"}`}>
															{idx + 1}
														</span>
														<span className='max-w-[120px] truncate text-base font-bold text-foreground'>
															{entry.name}
														</span>
													</div>
													<span className='text-base font-black text-primary dark:text-yellow-400'>
														{entry.score}
													</span>
												</>
											);

											return ownEntry ? (
												<button
													key={`${entry.playerId ?? entry.name}-${idx}`}
													type='button'
													onClick={() => handleLeaderboardEntryClick(entry)}
													aria-label={`${t("start.showProgress")}: ${entry.name}`}
													className='flex w-full items-center justify-between rounded-lg border border-primary/40 bg-emerald-100/90 p-3 shadow-sm shadow-primary/10 transition-colors hover:border-primary/60 hover:bg-emerald-200/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-primary/15 dark:hover:bg-primary/25'>
													{rowContent}
												</button>
											) : (
												<div
													key={`${entry.playerId ?? entry.name}-${idx}`}
													className='flex items-center justify-between rounded-lg border border-border/80 bg-white/70 p-3 dark:bg-muted/30'>
													{rowContent}
												</div>
											);
										})}
									</div>
								) : (
									<p className='text-center text-muted-foreground py-4'>
										{t("start.beFirst")}
									</p>
								)}
							</CardContent>
						</Card>

						{/* Links */}
						<Card className='bg-card/50 border-border backdrop-blur'>
							<CardHeader className='pb-3'>
								<CardTitle className='text-foreground flex items-center gap-2 text-lg'>
									<BookOpen
										className='w-5 h-5 text-accent'
										aria-hidden='true'
									/>
									{t("start.learning")}
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-2'>
								{learningLinks.map((link) => (
									<HoverCard key={link.href} openDelay={120} closeDelay={120}>
										<HoverCardTrigger asChild>
											<a
												data-demo-id={link.demoId}
												href={link.href}
												target='_blank'
												rel='noopener noreferrer'
												onMouseEnter={link.onHover}
												onFocus={link.onHover}
												className='flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'>
												<ExternalLink className='w-4 h-4' aria-hidden='true' />
												<span className='text-sm'>{link.label}</span>
												{link.demoId === "resource-darwin-terms" &&
													darwinTermsStatus === "changed" && (
														<Badge className='ml-auto bg-amber-500 text-white'>
															zmiana
														</Badge>
													)}
												{link.demoId === "resource-darwin-terms" &&
													darwinTermsStatus === "checking" && (
														<RefreshCw
															className='ml-auto h-3.5 w-3.5 animate-spin text-cyan-600'
															aria-hidden='true'
														/>
													)}
											</a>
										</HoverCardTrigger>
										<HoverCardContent
											side='right'
											align='center'
											className='w-80 text-sm'
											data-demo-id={`${link.demoId}-hint`}>
											<div className='space-y-3'>
												<div className='flex items-start gap-2'>
													<Info
														className='mt-0.5 h-4 w-4 shrink-0 text-primary'
														aria-hidden='true'
													/>
													<div>
														<h3 className='font-semibold text-foreground'>
															{link.title}
														</h3>
														<p className='mt-1 leading-relaxed text-muted-foreground'>
															{link.description}
														</p>
													</div>
												</div>
												{link.demoId === "resource-darwin-terms" && (
													<Alert
														className={
															darwinTermsStatus === "changed"
																? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100"
																: darwinTermsStatus === "current"
																	? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100"
																	: "border-cyan-300 bg-cyan-50 text-cyan-900 dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-100"
														}>
														{darwinTermsStatus === "changed" ? (
															<AlertTriangle className='h-4 w-4' />
														) : darwinTermsStatus === "current" ? (
															<CheckCircle2 className='h-4 w-4' />
														) : (
															<Info className='h-4 w-4' />
														)}
														<AlertDescription>
															{darwinTermsMessage}
														</AlertDescription>
													</Alert>
												)}
											</div>
										</HoverCardContent>
									</HoverCard>
								))}
							</CardContent>
						</Card>
					</motion.div>
				</div>


				{/* Footer */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className='text-center mt-12 text-muted-foreground text-sm'>
					<p>🎓 {t("start.footer.project")}</p>
					<p className='mt-1'>{t("start.footer.learn")}</p>
				</motion.div>
			</div>
		</div>
	);
}

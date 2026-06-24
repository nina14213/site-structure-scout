import { useEffect, useRef, useState } from "react";
import { MousePointer2 } from "lucide-react";
import { DEMO_PLAYER_NAME, isPortalDemoMode } from "@/demo/portalDemo";

type DemoStep =
  | { action: "wait"; waitAfter?: number }
  | { action: "type"; target: string; value: string; waitAfter?: number }
  | { action: "click"; target: string; waitAfter?: number }
  | { action: "hover"; target: string; waitAfter?: number }
  | { action: "scroll"; target: string; waitAfter?: number }
  | { action: "drag"; target: string; to: "top-right" | "right-middle"; waitAfter?: number }
  | { action: "map"; column: string; term: string; waitAfter?: number }
  | { action: "select"; target: string; optionIndex: number; value?: string; source?: SourceNoteText; waitAfter?: number }
  | { action: "tutorial"; waitAfter?: number }
  | { action: "assistant"; waitAfter?: number }
  | { action: "event"; name: string; target?: string; waitAfter?: number }
  | { action: "magicFill"; waitAfter?: number }
  | { action: "quiz"; waitAfter?: number }
  | { action: "species"; waitAfter?: number };

type CursorPosition = {
  x: number;
  y: number;
};

type DragPreview = {
  label: string;
  x: number;
  y: number;
};

type SourceNoteText = {
  title: string;
  body: string;
};

type SourceNote = SourceNoteText & {
  x: number;
  y: number;
};

type MagicNote = {
  title: string;
  body: string;
};

const STEP_DELAY = 560;
const TYPING_DELAY = 30;
const DRAG_STEP_DELAY = 48;

const source = (title: string, body: string): SourceNoteText => ({ title, body });

const demoSteps: DemoStep[] = [
  { action: "wait", waitAfter: 800 },
  { action: "click", target: '[data-demo-id="welcome-how-to-play-toggle"]', waitAfter: 1600 },
  { action: "type", target: '[data-demo-id="welcome-name"]', value: DEMO_PLAYER_NAME, waitAfter: 900 },
  { action: "click", target: '[data-demo-id="assistant-liliana"]', waitAfter: 850 },
  { action: "click", target: '[data-demo-id="welcome-enter"]', waitAfter: 1100 },
  { action: "click", target: '[data-demo-id="guide-assistant-next"]', waitAfter: 1000 },
  { action: "click", target: '[data-demo-id="guide-assistant-close"]', waitAfter: 700 },
  { action: "drag", target: '[data-demo-id="guide-assistant-avatar"]', to: "top-right", waitAfter: 900 },
  { action: "assistant", waitAfter: 700 },
  { action: "hover", target: '[data-demo-id="resource-darwin-terms"]', waitAfter: 1400 },
  { action: "hover", target: '[data-demo-id="resource-gbif-validator"]', waitAfter: 1300 },
  { action: "hover", target: '[data-demo-id="resource-gbif-ipt"]', waitAfter: 1300 },
  { action: "click", target: '[data-demo-id="how-to-play-toggle"]', waitAfter: 1500 },
  { action: "click", target: '[data-demo-id="start-game"]', waitAfter: 1100 },
  { action: "click", target: '[data-demo-id="core-import-own-data"]', waitAfter: 900 },
  { action: "click", target: '[data-demo-id="load-demo-csv"]', waitAfter: 1000 },
  { action: "click", target: '[data-demo-id="import-demo-data"]', waitAfter: 1200 },
  { action: "tutorial", waitAfter: 700 },
  { action: "assistant", waitAfter: 650 },
  { action: "map", column: "gbifID", term: "eventID", waitAfter: 900 },
  { action: "click", target: '[data-demo-id="core-optional-tab"]', waitAfter: 850 },
  { action: "map", column: "scientificName", term: "scientificName", waitAfter: 850 },
  { action: "map", column: "decimalLatitude", term: "decimalLatitude", waitAfter: 850 },
  { action: "map", column: "decimalLongitude", term: "decimalLongitude", waitAfter: 950 },
  { action: "click", target: '[data-demo-id="core-complete-level"]', waitAfter: 1200 },
  { action: "quiz", waitAfter: 800 },
  { action: "tutorial", waitAfter: 700 },
  { action: "assistant", waitAfter: 650 },
  {
    action: "select",
    target: '[data-demo-id="extension-cell-0-scientificName"]',
    optionIndex: 0,
    source: source("Source: species label", "The label above the table shows Ailanthus altissima, so this value goes into scientificName."),
    waitAfter: 560,
  },
  {
    action: "select",
    target: '[data-demo-id="extension-cell-0-recordedBy"]',
    optionIndex: 0,
    source: source("Source: collector label", "The recordedBy field comes from the person named on the field label: K. Słupecka."),
    waitAfter: 560,
  },
  {
    action: "select",
    target: '[data-demo-id="extension-cell-0-organismQuantity"]',
    optionIndex: 0,
    source: source("Source: quantity label", "The quantity label gives the numeric value: 1 goes into organismQuantity."),
    waitAfter: 560,
  },
  {
    action: "select",
    target: '[data-demo-id="extension-cell-0-organismQuantityType"]',
    optionIndex: 0,
    source: source("Source: quantity type label", "The second part of the same label describes the unit: individual goes into organismQuantityType."),
    waitAfter: 620,
  },
  { action: "magicFill", waitAfter: 1600 },
  { action: "click", target: '[data-demo-id="extension-validate"]', waitAfter: 1200 },
  { action: "click", target: '[data-demo-id="extension-complete-level"]', waitAfter: 1200 },
  { action: "quiz", waitAfter: 800 },
  { action: "tutorial", waitAfter: 700 },
  { action: "assistant", waitAfter: 650 },
  { action: "type", target: '[data-demo-id="meta-title"]', value: "Ailanthus altissima in Poznan", waitAfter: 650 },
  { action: "type", target: '[data-demo-id="meta-description"]', value: "Darwin Core demo package from the learning portal.", waitAfter: 650 },
  { action: "type", target: '[data-demo-id="meta-creator"]', value: "AMUNATCOLL Demo", waitAfter: 650 },
  { action: "click", target: '[data-demo-id="meta-generate-xml"]', waitAfter: 850 },
  { action: "click", target: '[data-demo-id="meta-generate-json"]', waitAfter: 900 },
  { action: "click", target: '[data-demo-id="meta-complete-level"]', waitAfter: 1200 },
  { action: "quiz", waitAfter: 800 },
  { action: "tutorial", waitAfter: 700 },
  { action: "assistant", waitAfter: 650 },
  { action: "species", waitAfter: 850 },
  { action: "click", target: '[data-demo-id="species-finish-level"]', waitAfter: 1100 },
  { action: "quiz", waitAfter: 800 },
  { action: "tutorial", waitAfter: 700 },
  { action: "assistant", waitAfter: 650 },
  { action: "click", target: '[data-demo-id="validator-run"]', waitAfter: 4300 },
  { action: "type", target: '[data-demo-id="validator-cell-2-eventDate"]', value: "2025-10-25", waitAfter: 500 },
  { action: "type", target: '[data-demo-id="validator-cell-2-decimalLongitude"]', value: "16.9187", waitAfter: 500 },
  { action: "type", target: '[data-demo-id="validator-cell-3-occurrenceID"]', value: "OCC003", waitAfter: 500 },
  { action: "type", target: '[data-demo-id="validator-cell-3-scientificName"]', value: "Quercus robur", waitAfter: 500 },
  { action: "select", target: '[data-demo-id="validator-cell-4-eventID"]', optionIndex: 3, value: "EVT-004", waitAfter: 650 },
  { action: "type", target: '[data-demo-id="validator-cell-4-scientificName"]', value: "Robinia pseudoacacia", waitAfter: 500 },
  { action: "type", target: '[data-demo-id="validator-cell-5-occurrenceID"]', value: "OCC005", waitAfter: 500 },
  { action: "type", target: '[data-demo-id="validator-cell-5-eventDate"]', value: "2025-01-13", waitAfter: 650 },
  { action: "click", target: '[data-demo-id="validator-run"]', waitAfter: 4300 },
  { action: "click", target: '[data-demo-id="validator-victory"]', waitAfter: 1300 },
  { action: "quiz", waitAfter: 800 },
  { action: "scroll", target: '[data-demo-id="complete-bottom-actions"]', waitAfter: 1700 },
  { action: "click", target: '[data-demo-id="complete-back-menu"]', waitAfter: 1100 },
  { action: "assistant", waitAfter: 700 },
  { action: "click", target: '[data-demo-id="open-data-package"]', waitAfter: 1400 },
  { action: "assistant", waitAfter: 700 },
  { action: "click", target: '[data-demo-id="wizard-have-data"]', waitAfter: 1100 },
  { action: "assistant", waitAfter: 700 },
  { action: "click", target: '[data-demo-id="load-demo-csv"]', waitAfter: 1200 },
  { action: "click", target: '[data-demo-id="import-demo-data"]', waitAfter: 1300 },
  { action: "click", target: '[data-demo-id="wizard-next"]', waitAfter: 1200 },
  { action: "assistant", waitAfter: 700 },
  { action: "click", target: '[data-demo-id="detect-headers"]', waitAfter: 1200 },
  { action: "click", target: '[data-demo-id="auto-match-apply"]', waitAfter: 1300 },
  { action: "assistant", waitAfter: 700 },
  { action: "click", target: '[data-demo-id="wizard-next"]', waitAfter: 1400 },
  { action: "assistant", waitAfter: 650 },
  { action: "click", target: '[data-demo-id="setup-id-generators"]', waitAfter: 1600 },
  { action: "click", target: '[data-demo-id="apply-id-generators"]', waitAfter: 1200 },
  { action: "click", target: '[data-demo-id="preview-schema-occurrence"]', waitAfter: 1600 },
  { action: "scroll", target: '[data-demo-id="download-all"]', waitAfter: 1500 },
  { action: "hover", target: '[data-demo-id="download-all"]', waitAfter: 1600 },
  { action: "click", target: '[data-demo-id="schema-review-back-menu"]', waitAfter: 1400 },
  { action: "click", target: '[data-demo-id="wcag-trigger"]', waitAfter: 2600 },
  { action: "wait", waitAfter: 1200 },
];

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeout);
        reject(new DOMException("Demo aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

async function waitForElement(selector: string, signal: AbortSignal, timeoutMs = 16000) {
  const started = performance.now();
  while (performance.now() - started < timeoutMs) {
    const element = document.querySelector<HTMLElement>(selector);
    if (element && !element.hasAttribute("disabled") && element.getAttribute("aria-disabled") !== "true") {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return element;
    }
    await sleep(120, signal);
  }
  throw new Error(`Demo target not found: ${selector}`);
}

function getElementCenter(element: HTMLElement): CursorPosition {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function dispatchClick(element: HTMLElement) {
  const center = getElementCenter(element);
  const eventOptions = {
    bubbles: true,
    cancelable: true,
    clientX: center.x,
    clientY: center.y,
    view: window,
  };

  element.dispatchEvent(new PointerEvent("pointerdown", { ...eventOptions, pointerId: 1, pointerType: "mouse" }));
  element.dispatchEvent(new MouseEvent("mousedown", eventOptions));
  element.dispatchEvent(new PointerEvent("pointerup", { ...eventOptions, pointerId: 1, pointerType: "mouse" }));
  element.dispatchEvent(new MouseEvent("mouseup", eventOptions));
  element.dispatchEvent(new MouseEvent("click", eventOptions));
}

function dispatchHover(element: HTMLElement) {
  const center = getElementCenter(element);
  const eventOptions = {
    bubbles: true,
    cancelable: true,
    clientX: center.x,
    clientY: center.y,
    view: window,
  };

  element.dispatchEvent(new PointerEvent("pointerover", { ...eventOptions, pointerId: 1, pointerType: "mouse" }));
  element.dispatchEvent(new PointerEvent("pointerenter", { ...eventOptions, pointerId: 1, pointerType: "mouse" }));
  element.dispatchEvent(new MouseEvent("mouseover", eventOptions));
  element.dispatchEvent(new MouseEvent("mouseenter", eventOptions));
  element.focus({ preventScroll: true });
}

function dataAttributeSelector(attribute: string, value: string) {
  return `[${attribute}="${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"]`;
}

function dispatchDragEvent(
  element: HTMLElement,
  type: string,
  dataTransfer: DataTransfer | undefined,
  position: CursorPosition,
) {
  element.dispatchEvent(new DragEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: position.x,
    clientY: position.y,
    dataTransfer,
    view: window,
  }));
}

function setNativeInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

async function typeIntoField(element: HTMLElement, value: string, signal: AbortSignal) {
  if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) return;
  element.focus();
  setNativeInputValue(element, "");
  for (let index = 0; index < value.length; index += 1) {
    setNativeInputValue(element, value.slice(0, index + 1));
    await sleep(TYPING_DELAY, signal);
  }
}

function isVisible(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function closeOpenSelectMenus() {
  const eventOptions = {
    bubbles: true,
    cancelable: true,
    key: "Escape",
    code: "Escape",
  };

  document.dispatchEvent(new KeyboardEvent("keydown", eventOptions));
  window.dispatchEvent(new KeyboardEvent("keydown", eventOptions));

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

function getSourceNotePosition(element: HTMLElement): Pick<SourceNote, "x" | "y"> {
  const rect = element.getBoundingClientRect();
  const width = Math.min(360, window.innerWidth - 32);
  const x = Math.min(Math.max(16, rect.left), Math.max(16, window.innerWidth - width - 16));
  const y = rect.top > 168 ? rect.top - 138 : rect.bottom + 18;

  return {
    x,
    y: Math.min(Math.max(16, y), Math.max(16, window.innerHeight - 170)),
  };
}

async function selectOptionByIndex(
  trigger: HTMLElement,
  optionIndex: number,
  setCursor: (position: CursorPosition) => void,
  signal: AbortSignal,
) {
  trigger.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
  await sleep(220, signal);
  setCursor(getElementCenter(trigger));
  await sleep(STEP_DELAY, signal);
  dispatchClick(trigger);
  await sleep(260, signal);

  const started = performance.now();
  while (performance.now() - started < 5000) {
    const options = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'))
      .filter((option) => isVisible(option) && option.getAttribute("aria-disabled") !== "true");
    const option = options[optionIndex];
    if (option) {
      setCursor(getElementCenter(option));
      await sleep(STEP_DELAY, signal);
      dispatchClick(option);
      await sleep(220, signal);
      closeOpenSelectMenus();
      return;
    }
    await sleep(120, signal);
  }

  throw new Error(`Demo select option not found at index ${optionIndex}`);
}

function syncDemoSelectValue(target: string, value?: string) {
  const extensionMatch = target.match(/extension-cell-(\d+)-([a-zA-Z]+)/);
  if (extensionMatch) {
    window.dispatchEvent(new CustomEvent("portal-demo-set-extension-cell", {
      detail: {
        rowIndex: Number(extensionMatch[1]),
        field: extensionMatch[2],
      },
    }));
    return;
  }

  const validatorMatch = target.match(/validator-cell-([^-]+)-([a-zA-Z]+)/);
  if (validatorMatch && value !== undefined) {
    window.dispatchEvent(new CustomEvent("portal-demo-set-validator-cell", {
      detail: {
        rowId: validatorMatch[1],
        field: validatorMatch[2],
        value,
      },
    }));
  }
}

async function completeTutorial(setCursor: (position: CursorPosition) => void, signal: AbortSignal) {
  const startButton = await waitForElement('[data-demo-id="tutorial-start"]', signal, 18000);
  const scrollArea = document.querySelector<HTMLElement>('[data-demo-id="tutorial-scroll-area"]');

  if (scrollArea && scrollArea.scrollHeight > scrollArea.clientHeight + 24) {
    const rect = scrollArea.getBoundingClientRect();
    const firstScrollPoint = { x: rect.right - 18, y: rect.top + rect.height * 0.36 };
    const secondScrollPoint = { x: rect.right - 18, y: rect.top + rect.height * 0.78 };

    setCursor(firstScrollPoint);
    await sleep(STEP_DELAY, signal);
    scrollArea.dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 520, clientX: firstScrollPoint.x, clientY: firstScrollPoint.y }));
    scrollArea.scrollTo({ top: Math.min(scrollArea.scrollHeight, scrollArea.clientHeight * 0.82), behavior: "smooth" });
    await sleep(800, signal);

    setCursor(secondScrollPoint);
    await sleep(STEP_DELAY, signal);
    scrollArea.dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 680, clientX: secondScrollPoint.x, clientY: secondScrollPoint.y }));
    scrollArea.scrollTo({ top: scrollArea.scrollHeight, behavior: "smooth" });
    await sleep(900, signal);
  }

  startButton.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
  await sleep(780, signal);
  setCursor(getElementCenter(startButton));
  await sleep(STEP_DELAY, signal);
  dispatchClick(startButton);
}

async function scrollToElement(element: HTMLElement, setCursor: (position: CursorPosition) => void, signal: AbortSignal) {
  const before = element.getBoundingClientRect();
  const startPosition = {
    x: Math.min(window.innerWidth - 28, Math.max(28, before.right - 16)),
    y: Math.min(window.innerHeight - 64, Math.max(64, before.top + before.height / 2)),
  };

  setCursor(startPosition);
  await sleep(STEP_DELAY, signal);

  for (let index = 0; index < 4; index += 1) {
    const position = {
      x: window.innerWidth - 28,
      y: Math.min(window.innerHeight - 72, Math.max(72, startPosition.y + index * 28)),
    };
    setCursor(position);
    window.dispatchEvent(new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaY: 560,
      clientX: position.x,
      clientY: position.y,
    }));
    window.scrollBy({ top: 480, behavior: "smooth" });
    await sleep(520, signal);
  }

  element.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
  await sleep(950, signal);
  setCursor(getElementCenter(element));
}

async function showAssistantHint(setCursor: (position: CursorPosition) => void, signal: AbortSignal) {
  const avatar = await waitForElement('[data-demo-id="guide-assistant-avatar"]', signal, 10000);
  avatar.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
  await sleep(250, signal);
  setCursor(getElementCenter(avatar));

  if (!document.querySelector('[data-demo-id="guide-assistant-close"]')) {
    await sleep(STEP_DELAY, signal);
    dispatchClick(avatar);
  }

  await sleep(430, signal);

  for (let index = 0; index < 2; index += 1) {
    const next = document.querySelector<HTMLElement>('[data-demo-id="guide-assistant-next"]');
    if (!next || !isVisible(next) || next.hasAttribute("disabled") || next.getAttribute("aria-disabled") === "true") {
      break;
    }
    setCursor(getElementCenter(next));
    await sleep(STEP_DELAY, signal);
    dispatchClick(next);
    await sleep(500, signal);
  }

  const close = document.querySelector<HTMLElement>('[data-demo-id="guide-assistant-close"]');
  if (close && isVisible(close)) {
    setCursor(getElementCenter(close));
    await sleep(STEP_DELAY, signal);
    dispatchClick(close);
  }
}

function getDragDestination(to: "top-right" | "right-middle"): CursorPosition {
  if (to === "right-middle") {
    return { x: window.innerWidth - 72, y: Math.max(180, window.innerHeight * 0.42) };
  }
  return { x: window.innerWidth - 72, y: 72 };
}

async function dragElement(element: HTMLElement, to: "top-right" | "right-middle", setCursor: (position: CursorPosition) => void, signal: AbortSignal) {
  const from = getElementCenter(element);
  const destination = getDragDestination(to);

  setCursor(from);
  await sleep(180, signal);
  element.dispatchEvent(new PointerEvent("pointerdown", {
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    pointerType: "mouse",
    button: 0,
    clientX: from.x,
    clientY: from.y,
    view: window,
  }));

  const steps = 12;
  for (let index = 1; index <= steps; index += 1) {
    const position = {
      x: from.x + ((destination.x - from.x) * index) / steps,
      y: from.y + ((destination.y - from.y) * index) / steps,
    };
    setCursor(position);
    window.dispatchEvent(new PointerEvent("pointermove", {
      bubbles: true,
      cancelable: true,
      pointerId: 1,
      pointerType: "mouse",
      clientX: position.x,
      clientY: position.y,
      view: window,
    }));
    await sleep(DRAG_STEP_DELAY, signal);
  }

  window.dispatchEvent(new PointerEvent("pointerup", {
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    pointerType: "mouse",
    clientX: destination.x,
    clientY: destination.y,
    view: window,
  }));
}

async function dragColumnToTerm(
  column: string,
  term: string,
  setCursor: (position: CursorPosition) => void,
  setDragPreview: (preview: DragPreview | null) => void,
  signal: AbortSignal,
) {
  const source = await waitForElement(dataAttributeSelector("data-demo-column", column), signal);
  const target = await waitForElement(dataAttributeSelector("data-demo-term", term), signal);

  source.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
  target.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
  await sleep(360, signal);

  const from = getElementCenter(source);
  const destination = getElementCenter(target);
  const dataTransfer = typeof DataTransfer === "undefined" ? undefined : new DataTransfer();
  dataTransfer?.setData("text/plain", column);
  dataTransfer?.setData("columnIndex", "0");

  setCursor(from);
  setDragPreview({ label: column, x: from.x, y: from.y });
  await sleep(280, signal);
  dispatchDragEvent(source, "dragstart", dataTransfer, from);

  const steps = 20;
  for (let index = 1; index <= steps; index += 1) {
    const position = {
      x: from.x + ((destination.x - from.x) * index) / steps,
      y: from.y + ((destination.y - from.y) * index) / steps,
    };
    setCursor(position);
    setDragPreview({ label: column, x: position.x, y: position.y });
    dispatchDragEvent(target, index === 1 ? "dragenter" : "dragover", dataTransfer, position);
    await sleep(DRAG_STEP_DELAY, signal);
  }

  dispatchDragEvent(target, "drop", dataTransfer, destination);
  dispatchDragEvent(source, "dragend", dataTransfer, destination);
  window.dispatchEvent(new CustomEvent("portal-demo-map-core", { detail: { columnName: column, termName: term } }));
  await sleep(220, signal);
  setDragPreview(null);
}

async function answerSpeciesRound(setCursor: (position: CursorPosition) => void, signal: AbortSignal) {
  for (let index = 0; index < 2; index += 1) {
    const finish = document.querySelector<HTMLElement>('[data-demo-id="species-finish-level"]');
    if (finish) return;

    let correct: HTMLElement;
    try {
      correct = await waitForElement('[data-demo-id="species-correct-option"]', signal, 4200);
    } catch (err) {
      if (document.querySelector<HTMLElement>('[data-demo-id="species-finish-level"]')) return;
      throw err;
    }
    correct.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
    await sleep(180, signal);
    setCursor(getElementCenter(correct));
    await sleep(STEP_DELAY, signal);
    dispatchClick(correct);
    await sleep(2300, signal);
  }

  window.dispatchEvent(new CustomEvent("portal-demo-finish-species"));
  await waitForElement('[data-demo-id="species-finish-level"]', signal, 8000);
}

async function answerQuiz(setCursor: (position: CursorPosition) => void, signal: AbortSignal) {
  const existingContinue = document.querySelector<HTMLElement>('[data-demo-id="quiz-continue"]');
  if (existingContinue) {
    existingContinue.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
    await sleep(220, signal);
    setCursor(getElementCenter(existingContinue));
    await sleep(STEP_DELAY, signal);
    dispatchClick(existingContinue);
    return;
  }

  const correct = await waitForElement('[data-demo-id="quiz-correct-option"]', signal, 12000);
  correct.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
  await sleep(240, signal);
  setCursor(getElementCenter(correct));
  await sleep(STEP_DELAY, signal);
  dispatchClick(correct);
  await sleep(820, signal);

  const skip = await waitForElement('[data-demo-id="quiz-skip"]', signal, 8000);
  setCursor(getElementCenter(skip));
  await sleep(STEP_DELAY, signal);
  dispatchClick(skip);
  await sleep(620, signal);

  const continueButton = await waitForElement('[data-demo-id="quiz-continue"]', signal, 12000);
  setCursor(getElementCenter(continueButton));
  await sleep(STEP_DELAY, signal);
  dispatchClick(continueButton);
}

export default function PortalDemoPlayer() {
  const enabled = isPortalDemoMode();
  const [cursor, setCursor] = useState<CursorPosition>({ x: 96, y: 96 });
  const [clicking, setClicking] = useState(false);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [sourceNote, setSourceNote] = useState<SourceNote | null>(null);
  const [magicNote, setMagicNote] = useState<MagicNote | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [stopped, setStopped] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled || stopped) return;

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    const run = async () => {
      try {
        for (let index = 0; index < demoSteps.length; index += 1) {
          const step = demoSteps[index];
          setStepIndex(index);
          (window as typeof window & { __portalDemoStep?: number }).__portalDemoStep = index;

          if (step.action === "wait") {
            await sleep(step.waitAfter ?? 800, controller.signal);
            continue;
          }

          if (step.action === "species") {
            await answerSpeciesRound(setCursor, controller.signal);
            await sleep(step.waitAfter ?? 800, controller.signal);
            continue;
          }

          if (step.action === "quiz") {
            await answerQuiz(setCursor, controller.signal);
            await sleep(step.waitAfter ?? 800, controller.signal);
            continue;
          }

          if (step.action === "tutorial") {
            await completeTutorial(setCursor, controller.signal);
            await sleep(step.waitAfter ?? 800, controller.signal);
            continue;
          }

          if (step.action === "assistant") {
            await showAssistantHint(setCursor, controller.signal);
            await sleep(step.waitAfter ?? 800, controller.signal);
            continue;
          }

          if (step.action === "magicFill") {
            setMagicNote({
              title: "The rest is filled from labels",
              body: "After one visible row, the portal copies the remaining field-note values into the occurrence table.",
            });
            const table = await waitForElement('[data-demo-id="extension-table"]', controller.signal, 8000);
            table.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
            await sleep(900, controller.signal);
            setCursor({
              x: Math.min(window.innerWidth - 80, table.getBoundingClientRect().right - 80),
              y: Math.max(140, table.getBoundingClientRect().top + 80),
            });
            await sleep(700, controller.signal);
            window.dispatchEvent(new CustomEvent("portal-demo-fill-extension"));
            await sleep(step.waitAfter ?? 1400, controller.signal);
            setMagicNote(null);
            continue;
          }

          if (step.action === "map") {
            await dragColumnToTerm(step.column, step.term, setCursor, setDragPreview, controller.signal);
            await sleep(step.waitAfter ?? 800, controller.signal);
            continue;
          }

          let targetElement: HTMLElement | null = null;
          if ("target" in step && step.target) {
            targetElement = await waitForElement(step.target, controller.signal);
            if (step.action !== "scroll") {
              targetElement.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
              await sleep(360, controller.signal);
              setCursor(getElementCenter(targetElement));
              await sleep(STEP_DELAY, controller.signal);
            }
          }

          if (step.action === "type" && targetElement) {
            await typeIntoField(targetElement, step.value, controller.signal);
          }

          if (step.action === "hover" && targetElement) {
            dispatchHover(targetElement);
          }

          if (step.action === "select" && targetElement) {
            if (step.source) {
              setSourceNote({ ...step.source, ...getSourceNotePosition(targetElement) });
              await sleep(1050, controller.signal);
            }
            await selectOptionByIndex(targetElement, step.optionIndex, setCursor, controller.signal);
            syncDemoSelectValue(step.target, step.value);
            await sleep(360, controller.signal);
            closeOpenSelectMenus();
            setSourceNote(null);
          }

          if (step.action === "click" && targetElement) {
            setClicking(true);
            dispatchClick(targetElement);
            await sleep(190, controller.signal);
            setClicking(false);
          }

          if (step.action === "scroll" && targetElement) {
            await scrollToElement(targetElement, setCursor, controller.signal);
          }

          if (step.action === "drag" && targetElement) {
            await dragElement(targetElement, step.to, setCursor, controller.signal);
          }

          if (step.action === "event") {
            window.dispatchEvent(new CustomEvent(step.name));
          }

          await sleep(step.waitAfter ?? 800, controller.signal);
        }

        setStepIndex(demoSteps.length);
        setCompleted(true);
        window.dispatchEvent(new CustomEvent("portal-demo-complete"));
      } catch (err) {
        if ((err as DOMException).name !== "AbortError") {
          console.warn("Portal demo stopped:", err);
        }
      }
    };

    void run();

    return () => controller.abort();
  }, [enabled, stopped]);

  if (!enabled || stopped) return null;

  const progress = completed ? 100 : Math.min(99, Math.round(((stepIndex + 1) / demoSteps.length) * 100));
  const stopDemo = () => {
    abortRef.current?.abort();
    setStopped(true);
    const url = new URL(window.location.href);
    url.searchParams.delete("demo");
    window.history.replaceState({}, "", url.toString());
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-[11000]">
      <div className="fixed inset-x-0 bottom-0 z-[11003] h-2 bg-slate-950/30 backdrop-blur">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300 transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="fixed bottom-4 left-4 z-[11004] flex items-center gap-3">
        {!completed && (
          <button
            type="button"
            data-demo-id="stop-demo"
            onClick={stopDemo}
            className="pointer-events-auto rounded-lg border border-red-300 bg-red-600 px-3 py-2 text-xs font-bold text-white shadow-xl shadow-black/30 hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
          >
            Stop demo
          </button>
        )}
        <div className="rounded-lg border border-cyan-300/50 bg-slate-950/90 px-3 py-2 text-xs font-semibold text-cyan-100 shadow-xl shadow-black/30">
          Demo progress {progress}%
        </div>
      </div>
      {dragPreview && (
        <div
          data-demo-id="drag-preview"
          className="fixed left-0 top-0 z-[11001] min-w-36 rounded-xl border-2 border-yellow-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-2xl shadow-black/30 transition-transform duration-75 ease-linear dark:bg-slate-900 dark:text-white"
          style={{ transform: `translate(${dragPreview.x + 18}px, ${dragPreview.y + 18}px)` }}
        >
          <div className="text-[11px] font-medium uppercase tracking-normal text-slate-500 dark:text-slate-400">
            CSV column
          </div>
          {dragPreview.label}
        </div>
      )}
      {sourceNote && (
        <div
          data-demo-id="demo-source-note"
          className="fixed left-0 top-0 z-[11001] w-[min(360px,calc(100vw-2rem))] rounded-lg border border-cyan-300 bg-white/95 p-4 text-left shadow-2xl shadow-black/20 backdrop-blur dark:border-cyan-500/60 dark:bg-slate-950/95"
          style={{ transform: `translate(${sourceNote.x}px, ${sourceNote.y}px)` }}
        >
          <div className="mb-1 text-xs font-semibold uppercase tracking-normal text-cyan-700 dark:text-cyan-300">
            {sourceNote.title}
          </div>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {sourceNote.body}
          </p>
        </div>
      )}
      {magicNote && (
        <div
          data-demo-id="demo-magic-fill-note"
          className="fixed right-6 top-28 z-[11001] w-[min(380px,calc(100vw-2rem))] rounded-lg border border-violet-300 bg-white/95 p-4 text-left shadow-2xl shadow-black/20 backdrop-blur dark:border-violet-500/60 dark:bg-slate-950/95"
        >
          <div className="mb-1 text-xs font-semibold uppercase tracking-normal text-violet-700 dark:text-violet-300">
            {magicNote.title}
          </div>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {magicNote.body}
          </p>
        </div>
      )}
      <div
        className="fixed left-0 top-0 z-[11002] transition-transform duration-200 ease-out"
        style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
      >
        <div className="-translate-x-1 -translate-y-1">
          <MousePointer2 className="h-8 w-8 fill-white text-slate-950 drop-shadow-[0_3px_8px_rgba(0,0,0,0.35)]" />
          <span
            className={`absolute left-2 top-2 h-10 w-10 rounded-full border-2 border-cyan-400 transition-all duration-200 ${
              clicking ? "scale-125 opacity-90" : "scale-50 opacity-0"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

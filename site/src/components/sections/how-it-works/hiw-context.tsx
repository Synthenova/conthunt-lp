"use client";

/**
 * Shared state for the how-it-works section: the active brief (scenario), a run
 * counter that restarts the step visuals when the visitor picks a brief, and the
 * step currently in view (drives the heading's verb pills).
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_SCENARIO, SCENARIOS, type Scenario, type ScenarioId } from "./content";

export type StepNumber = 1 | 2 | 3;

interface HiwState {
  scenario: Scenario;
  /** Increments every time the visitor picks a brief (even the same one). */
  runKey: number;
  /** True once the visitor has picked a brief: visuals restart without waiting for scroll. */
  userDriven: boolean;
  pickScenario: (id: ScenarioId) => void;
  activeStep: StepNumber;
  setActiveStep: (step: StepNumber) => void;
}

const HiwContext = createContext<HiwState | null>(null);

export function HiwProvider({ initialScenario = DEFAULT_SCENARIO, children }: { initialScenario?: ScenarioId; children: ReactNode }) {
  const [scenarioId, setScenarioId] = useState<ScenarioId>(initialScenario);
  const [runKey, setRunKey] = useState(0);
  const [activeStep, setActiveStep] = useState<StepNumber>(1);

  const pickScenario = useCallback((id: ScenarioId) => {
    setScenarioId(id);
    setRunKey((k) => k + 1);
  }, []);

  const value = useMemo<HiwState>(
    () => ({
      scenario: SCENARIOS[scenarioId],
      runKey,
      userDriven: runKey > 0,
      pickScenario,
      activeStep,
      setActiveStep,
    }),
    [scenarioId, runKey, pickScenario, activeStep],
  );

  return <HiwContext.Provider value={value}>{children}</HiwContext.Provider>;
}

export function useHiw(): HiwState {
  const ctx = useContext(HiwContext);
  if (!ctx) throw new Error("useHiw must be used inside <HiwProvider>");
  return ctx;
}

import { create } from "zustand";

export type Agent = {
  id: string;
  name: string;
  summary: string;
  status: "healthy" | "degraded" | "offline";
};

type AgentState = {
  agents: Agent[];
  addAgent: (agent: Agent) => void;
  updateStatus: (id: string, status: Agent["status"]) => void;
};

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  addAgent: (agent) =>
    set((state) => ({
      agents: [...state.agents, agent],
    })),
  updateStatus: (id, status) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id
          ? {
              ...agent,
              status,
            }
          : agent,
      ),
    })),
}));

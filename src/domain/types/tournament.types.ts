export type Player = {
  id: string;
  name: string;
  chips: number;
  status: "active" | "eliminated";
  seat: number;
  rebuyCount: number;
  hasAddon: boolean;
};

export type BlindLevel = {
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  duration: number;
};

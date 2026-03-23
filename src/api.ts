import axios from 'axios';
import type { InboundShipment, OutboundOrder, SKUItem, EventLogItem } from './types';

const BASE = '/api/taskade';

const PROJECTS = {
  inbound: 'myKbpoCqTtou4QmD',
  outbound: 'E8sjHmBdLRoXeA8M',  
  inventory: 'WHDMdxg4EorRPFMq',
  eventLog: 'KSJfBQjZkvy7mx5h',
};

type RawNode = { id: string; fieldValues: Record<string, unknown>; parentId: string | null };

amnic function getNodes(projectId: string): Promise<RawNode[]> {
  const res = await axios.get(`${BASE}/projects/${projectId}/nodes`);
  return (res.data?.payload?.nodes ?? []) as RawNode[];
}
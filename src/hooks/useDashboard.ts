import { useState, useCallback, useMemo } from 'react';
import { Server, User, IP, Domain, ServerStatus } from '@/types';
import { mockData } from '@/data/mockData';

export const useDashboard = () => {
  const [users] = useState<User[]>(mockData.users);
  const [servers, setServers] = useState<Server[]>(mockData.servers);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServers = useMemo(() => {
    if (!searchQuery.trim()) return servers;
    
    const query = searchQuery.toLowerCase();
    return servers.filter(server => {
      const user = users.find(u => u.id === server.assignedUserId);
      return (
        server.name.toLowerCase().includes(query) ||
        server.mainIp.includes(query) ||
        user?.name.toLowerCase().includes(query)
      );
    });
  }, [servers, users, searchQuery]);

  const updateServerStatus = useCallback((serverId: string, status: ServerStatus) => {
    setServers(prevServers => 
      prevServers.map(server => 
        server.id === serverId ? { ...server, status } : server
      )
    );
  }, []);

  const addServer = useCallback((serverData: Omit<Server, 'id' | 'ips'>) => {
    const newServer: Server = {
      ...serverData,
      id: Date.now().toString(),
      ips: []
    };
    setServers(prevServers => [...prevServers, newServer]);
  }, []);

  const updateServer = useCallback((serverId: string, serverData: Partial<Server>) => {
    setServers(prevServers => 
      prevServers.map(server => 
        server.id === serverId ? { ...server, ...serverData } : server
      )
    );
  }, []);

  const deleteServer = useCallback((serverId: string) => {
    setServers(prevServers => prevServers.filter(server => server.id !== serverId));
  }, []);

  const addIPToServer = useCallback((serverId: string, ipAddresses: string[]) => {
    setServers(prevServers => 
      prevServers.map(server => {
        if (server.id === serverId) {
          const newIPs: IP[] = ipAddresses.map((address, index) => ({
            id: `${serverId}-ip-${Date.now()}-${index}`,
            address: address.trim(),
            serverId,
            domains: []
          }));
          return { ...server, ips: [...server.ips, ...newIPs] };
        }
        return server;
      })
    );
  }, []);

  const deleteIP = useCallback((serverId: string, ipId: string) => {
    setServers(prevServers => 
      prevServers.map(server => {
        if (server.id === serverId) {
          return { ...server, ips: server.ips.filter(ip => ip.id !== ipId) };
        }
        return server;
      })
    );
  }, []);

  const updateDomains = useCallback((serverId: string, ipId: string, domains: Domain[]) => {
    setServers(prevServers => 
      prevServers.map(server => {
        if (server.id === serverId) {
          return {
            ...server,
            ips: server.ips.map(ip => 
              ip.id === ipId ? { ...ip, domains } : ip
            )
          };
        }
        return server;
      })
    );
  }, []);

  return {
    users,
    servers: filteredServers,
    searchQuery,
    setSearchQuery,
    updateServerStatus,
    addServer,
    updateServer,
    deleteServer,
    addIPToServer,
    deleteIP,
    updateDomains
  };
};
import { useState } from 'react';
import { Server, User, ServerStatus } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  server?: Server;
  users: User[];
  onSave: (serverData: Omit<Server, 'id' | 'ips'>) => void;
  onUpdate?: (serverId: string, serverData: Partial<Server>) => void;
}

const statuses: ServerStatus[] = ['Production', 'Test', 'Down', 'Timed out'];

export const ServerModal = ({ isOpen, onClose, server, users, onSave, onUpdate }: ServerModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: server?.name || '',
    mainIp: server?.mainIp || '',
    status: (server?.status || 'Test') as ServerStatus,
    assignedUserId: server?.assignedUserId || '',
    delay: server?.delay || 0,
    notes: server?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.mainIp.trim() || !formData.assignedUserId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (server && onUpdate) {
      onUpdate(server.id, formData);
      toast({
        title: "Success",
        description: "Server updated successfully"
      });
    } else {
      onSave(formData);
      toast({
        title: "Success", 
        description: "Server created successfully"
      });
    }
    
    onClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      mainIp: '',
      status: 'Test',
      assignedUserId: '',
      delay: 0,
      notes: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border elevation-3">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {server ? 'Edit Server' : 'Add New Server'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Server Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Server-A10"
              className="bg-surface border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mainIp">Main IP Address *</Label>
            <Input
              id="mainIp"
              value={formData.mainIp}
              onChange={(e) => setFormData(prev => ({ ...prev, mainIp: e.target.value }))}
              placeholder="e.g., 192.168.1.10"
              className="bg-surface border-border font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: ServerStatus) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="bg-surface border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delay">Delay (ms)</Label>
              <Input
                id="delay"
                type="number"
                value={formData.delay}
                onChange={(e) => setFormData(prev => ({ ...prev, delay: parseInt(e.target.value) || 0 }))}
                min="0"
                className="bg-surface border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedUser">Assigned User *</Label>
            <Select 
              value={formData.assignedUserId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, assignedUserId: value }))}
            >
              <SelectTrigger className="bg-surface border-border">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this server..."
              className="bg-surface border-border resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-hover">
              {server ? 'Update Server' : 'Create Server'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
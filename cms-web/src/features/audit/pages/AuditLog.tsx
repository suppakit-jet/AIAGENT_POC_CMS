import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { useAuthStore } from '../../auth/store/auth.store';

export const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const token = useAuthStore((state: any) => state.token);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/admin/audit', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h2" gutterBottom>Audit Log</Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Actor</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Target Type</TableCell>
              <TableCell>Target ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.occurredAt).toLocaleString()}</TableCell>
                <TableCell>{log.actor?.email || log.actorId || 'SYSTEM'}</TableCell>
                <TableCell>
                  <Chip label={log.action} color="primary" size="small" />
                </TableCell>
                <TableCell>{log.targetType}</TableCell>
                <TableCell>{log.targetId}</TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">No logs found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

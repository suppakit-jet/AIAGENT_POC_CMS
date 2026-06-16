import React, { useState } from 'react';
import { Button, TextField, Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useAuthStore } from '../../auth/store/auth.store';

export const ContentEditor: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [contentId, setContentId] = useState<string | null>(null);
  const token = useAuthStore((state: any) => state.token);

  const handleSaveDraft = async () => {
    setStatus('loading');
    try {
      const res = await fetch('http://localhost:3000/api/admin/content', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title || 'Untitled',
          slug: title ? title.toLowerCase().replace(/ /g, '-') : 'untitled',
          type: 'ARTICLE',
          body: { text: content, seoDescription: seoDesc }
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setContentId(data.id);
        setStatus('success');
        setFeedback('Draft saved successfully!');
      } else {
        throw new Error(data.message || 'Failed to save draft');
      }
    } catch (err: any) {
      setStatus('error');
      setFeedback(err.message);
    }
  };

  const handleReview = async () => {
    if (!contentId) {
      setStatus('error');
      setFeedback('Please save a draft first!');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch(`http://localhost:3000/api/admin/content/${contentId}/review`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setFeedback(`Review Complete: ${data.reviewNotes}`);
      } else {
        throw new Error(data.message || 'Failed to submit for review');
      }
    } catch (err: any) {
      setStatus('error');
      setFeedback(err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h1" gutterBottom>Content Editor</Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          Write your content below. The Hermes Agent will review it before publishing.
        </Typography>

        {feedback && (
          <Alert severity={status === 'success' ? 'success' : 'warning'} sx={{ mb: 3 }}>
            {feedback}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Content Body"
          multiline
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="SEO Description"
          value={seoDesc}
          onChange={(e) => setSeoDesc(e.target.value)}
          sx={{ mb: 4 }}
        />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleSaveDraft} disabled={status === 'loading'}>
            Save Draft
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleReview}
            disabled={status === 'loading'}
            startIcon={status === 'loading' ? <CircularProgress size={20} color="inherit" /> : null}
          >
            Submit for Agent Review
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

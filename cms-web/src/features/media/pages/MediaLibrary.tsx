import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Card, CardMedia, CardContent, CircularProgress } from '@mui/material';
import { useAuthStore } from '../../auth/store/auth.store';

export const MediaLibrary: React.FC = () => {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const token = useAuthStore((state: any) => state.token);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/admin/media', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMedia(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setLoading(true);

    try {
      // 1. Get Presigned URL
      const presignRes = await fetch('http://localhost:3000/api/admin/media/presigned-url', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ filename: file.name, mimeType: file.type })
      });
      const { url, objectName } = await presignRes.json();

      // 2. Upload to MinIO directly
      await fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      // 3. Confirm with Backend
      await fetch('http://localhost:3000/api/admin/media/confirm', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          storageKey: objectName,
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size
        })
      });

      fetchMedia();
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h2" gutterBottom>Media Library</Typography>
      <Box sx={{ mb: 4 }}>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="raised-button-file"
          type="file"
          onChange={handleUpload}
        />
        <label htmlFor="raised-button-file">
          <Button variant="contained" component="span" disabled={loading}>
            Upload Image
          </Button>
        </label>
        {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
      </Box>

      <Grid container spacing={3}>
        {media.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={`http://localhost:9000/cms-media/${item.storageKey}`}
                alt={item.filename}
              />
              <CardContent>
                <Typography variant="body2" color="textSecondary" noWrap>
                  {item.filename}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

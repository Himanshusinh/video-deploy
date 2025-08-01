'use client';

import { useState, useEffect } from 'react';
import VideoResult from './VideoResult';

interface ResultType {
  task_id?: string;
  base_resp?: any;
  status?: string;
  file_id?: string;
  download_url?: string;
  [key: string]: any;
}

interface PollingStatus {
  isPolling: boolean;
  taskId: string | null;
  status: string;
  fileId: string | null;
  downloadUrl: string | null;
  error: string | null;
  pollCount: number;
}

export default function VideoForm() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(6);
  const [resolution, setResolution] = useState<'1080P' | '768P'>('1080P');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultType|null>(null);
  const [error, setError] = useState<string|null>(null);
  const [pollingStatus, setPollingStatus] = useState<PollingStatus>({
    isPolling: false,
    taskId: null,
    status: '',
    fileId: null,
    downloadUrl: null,
    error: null,
    pollCount: 0
  });

  // Function to check status manually
  const checkStatus = async (taskId: string) => {
    try {
      console.log(`🔄 Checking status for task: ${taskId} (poll #${pollingStatus.pollCount + 1})`);
      
      const startTime = Date.now();
      const response = await fetch(`/api/status/${taskId}`);
      const responseTime = Date.now() - startTime;
      
      console.log(`⏱️ Status check response time: ${responseTime}ms`);
      
      const data = await response.json();
      console.log(`📊 Status response:`, data);

      if (response.ok) {
        // Handle official MiniMax API status values
        if (data.status === 'Success') {
          console.log(`✅ Task completed: ${taskId}, file_id: ${data.file_id}`);
          
          // Get download URL for the file
          if (data.file_id) {
            const downloadResponse = await fetch(`/api/download-video/${data.file_id}`);
            const downloadData = await downloadResponse.json();
            
            if (downloadResponse.ok && downloadData.download_url) {
              setPollingStatus(prev => ({
                ...prev,
                isPolling: false,
                status: data.status,
                fileId: data.file_id,
                downloadUrl: downloadData.download_url
              }));
              setResult({ ...data, download_url: downloadData.download_url });
            } else {
              setPollingStatus(prev => ({
                ...prev,
                isPolling: false,
                status: data.status,
                fileId: data.file_id,
                error: 'Failed to get download URL'
              }));
              setError('Failed to get download URL');
            }
          } else {
            setPollingStatus(prev => ({
              ...prev,
              isPolling: false,
              status: data.status,
              error: 'No file ID received'
            }));
            setError('No file ID received');
          }
        } else if (data.status === 'Fail') {
          console.log(`❌ Task failed: ${taskId}`);
          setPollingStatus(prev => ({
            ...prev,
            isPolling: false,
            status: data.status,
            error: data.error || 'Video generation failed'
          }));
          setError(data.error || 'Video generation failed');
        } else {
          // Handle processing states: Preparing, Queueing, Processing
          console.log(`⏳ Task still processing: ${taskId} - ${data.status}`);
          setPollingStatus(prev => ({
            ...prev,
            status: data.status || 'Processing',
            pollCount: prev.pollCount + 1
          }));
        }
      } else {
        console.log(`❌ Status check failed: ${response.status}`);
        setPollingStatus(prev => ({
          ...prev,
          isPolling: false,
          error: data.error || 'Failed to check status'
        }));
        setError(data.error || 'Failed to check status');
      }
    } catch (err) {
      console.error(`💥 Network error checking status:`, err);
      setPollingStatus(prev => ({
        ...prev,
        isPolling: false,
        error: 'Network error while checking status'
      }));
      setError('Network error while checking status');
    }
  };

  // Polling effect with exponential backoff
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (pollingStatus.isPolling && pollingStatus.taskId) {
      // Start with 10 seconds, then increase to 30 seconds after 5 polls
      const pollInterval = pollingStatus.pollCount >= 5 ? 30000 : 10000;
      
      console.log(`🔄 Starting polling for ${pollingStatus.taskId} every ${pollInterval}ms`);
      
      intervalId = setInterval(async () => {
        await checkStatus(pollingStatus.taskId!);
      }, pollInterval);
    }

    return () => {
      if (intervalId) {
        console.log(`🛑 Stopping polling for ${pollingStatus.taskId}`);
        clearInterval(intervalId);
      }
    };
  }, [pollingStatus.isPolling, pollingStatus.taskId, pollingStatus.pollCount]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    setPollingStatus({
      isPolling: false,
      taskId: null,
      status: '',
      fileId: null,
      downloadUrl: null,
      error: null,
      pollCount: 0
    });

    try {
      console.log(`🚀 Submitting video generation request:`, { prompt, duration, resolution });
      
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, duration, resolution }),
      });
      
      const data = await res.json();
      console.log(`📊 Generation response:`, data);
      
      if (!res.ok) {
        console.log(`❌ Generation failed:`, data.error);
        setError(data.error || 'Failed to generate video');
        setLoading(false);
      } else {
        console.log(`✅ Generation submitted successfully:`, data.task_id);
        setResult(data);
        setLoading(false);
        
        // Start polling if we have a task ID
        if (data.task_id) {
          setPollingStatus({
            isPolling: true,
            taskId: data.task_id,
            status: 'submitted',
            fileId: null,
            downloadUrl: null,
            error: null,
            pollCount: 0
          });
        }
      }
    } catch (err) {
      console.error(`💥 Network error during submission:`, err);
      setError('Network error occurred');
      setLoading(false);
    }
  }

  const getStatusMessage = () => {
    if (pollingStatus.isPolling) {
      const statusText = pollingStatus.status === 'Preparing' ? 'Preparing...' :
                        pollingStatus.status === 'Queueing' ? 'In queue...' :
                        pollingStatus.status === 'Processing' ? 'Generating...' :
                        pollingStatus.status;
      return `${statusText} - Poll #${pollingStatus.pollCount}`;
    }
    if (pollingStatus.downloadUrl) {
      return 'Video generated successfully!';
    }
    if (pollingStatus.error) {
      return `Error: ${pollingStatus.error}`;
    }
    return '';
  };

  const handleRefresh = () => {
    if (pollingStatus.taskId) {
      console.log(`🔄 Manual refresh for task: ${pollingStatus.taskId}`);
      checkStatus(pollingStatus.taskId);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Prompt:<br/>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            required
            rows={4}
            style={{width: '100%'}}
            placeholder='Describe your scene, e.g. "A woman drinking coffee. [Pan right, Zoom in]"'
          />
        </label>
        <br/>
        <label>
          Duration (seconds):&nbsp;
          <select value={duration} onChange={e => setDuration(Number(e.target.value))}>
            <option value={6}>6</option>
            <option value={10}>10</option>
          </select>
        </label>
        <br/>
        <label>
          Resolution: &nbsp;
          <select value={resolution} onChange={e => setResolution(e.target.value as any)}>
            <option value="1080P">1080P</option>
            <option value="768P">768P</option>
          </select>
        </label>
        <br /><br/>
        <button type="submit" disabled={loading || pollingStatus.isPolling}>
          {loading ? 'Submitting...' : pollingStatus.isPolling ? 'Processing...' : 'Generate Video'}
        </button>
      </form>
      <br />
      {error && <div style={{color:'red'}}>{error}</div>}
      {getStatusMessage() && (
        <div style={{
          padding: '10px',
          backgroundColor: pollingStatus.error ? '#ffebee' : pollingStatus.downloadUrl ? '#e8f5e8' : '#fff3e0',
          border: '1px solid',
          borderColor: pollingStatus.error ? '#f44336' : pollingStatus.downloadUrl ? '#4caf50' : '#ff9800',
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          {getStatusMessage()}
        </div>
      )}
      {result && <VideoResult result={result} pollingStatus={pollingStatus} onRefresh={handleRefresh}/>}
    </div>
  );
}

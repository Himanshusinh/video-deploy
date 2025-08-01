interface Props {
  result: any;
  pollingStatus?: {
    isPolling: boolean;
    taskId: string | null;
    status: string;
    fileId: string | null;
    downloadUrl: string | null;
    error: string | null;
  };
  onRefresh?: () => void;
}

export default function VideoResult({ result, pollingStatus, onRefresh }: Props) {
  if ('error' in result) return <div style={{color:'red'}}>Error: {result.error}</div>;
  
  const taskId = result.task_id || pollingStatus?.taskId;
  const status = pollingStatus?.status || result.status || 'unknown';
  const downloadUrl = pollingStatus?.downloadUrl || result.download_url;
  const fileId = pollingStatus?.fileId || result.file_id;
  
  return (
    <div style={{
      padding: '15px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      marginTop: '10px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Video Generation Result</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Task ID:</strong> {taskId || '-'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Status:</strong> 
        <span style={{
          color: status === 'Success' ? '#4caf50' : 
                 status === 'Processing' || status === 'Preparing' || status === 'Queueing' ? '#ff9800' : 
                 status === 'Fail' ? '#f44336' : '#666',
          fontWeight: 'bold',
          marginLeft: '5px'
        }}>
          {status}
        </span>
      </div>
      
      {fileId && (
        <div style={{ marginBottom: '10px' }}>
          <strong>File ID:</strong> {fileId}
        </div>
      )}
      
      {downloadUrl && (
        <div style={{ marginBottom: '15px' }}>
          <strong>Download URL:</strong>
          <br />
          <a 
            href={downloadUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: '#2196F3',
              textDecoration: 'none',
              wordBreak: 'break-all'
            }}
          >
            {downloadUrl}
          </a>
        </div>
      )}
      
      {downloadUrl && (
        <div style={{ marginBottom: '15px' }}>
          <strong>Video Preview:</strong>
          <br />
          <video 
            controls 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            <source src={downloadUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
      
      {pollingStatus?.isPolling && (
        <div style={{
          padding: '10px',
          backgroundColor: '#fff3e0',
          border: '1px solid #ff9800',
          borderRadius: '4px',
          marginTop: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #ff9800',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span>Polling for status updates...</span>
          </div>
        </div>
      )}
      
      {!pollingStatus?.isPolling && status !== 'Success' && onRefresh && (
        <div style={{ marginTop: '10px' }}>
          <button 
            onClick={onRefresh}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Refresh Status
          </button>
        </div>
      )}
      
      {!pollingStatus?.downloadUrl && !pollingStatus?.isPolling && status === 'Success' && (
        <div style={{ 
          marginTop: '10px',
          fontStyle: 'italic',
          color: '#666'
        }}>
          Video generation completed. Check the MiniMax dashboard for the final video.
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
  
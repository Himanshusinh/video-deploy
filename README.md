# MiniMax Hailuo Text-to-Video Generator

A Next.js application that generates videos using the MiniMax Hailuo API. This application provides a complete video generation workflow with real-time status tracking and polling.

## Features

- **Video Generation**: Submit text prompts to generate videos using MiniMax Hailuo API
- **Real-time Status Tracking**: Automatic polling to check video generation status
- **Manual Refresh**: Manual status refresh button for better user control
- **Video Preview**: Display generated videos with embedded player
- **Error Handling**: Comprehensive error handling and user feedback
- **Responsive UI**: Clean and modern user interface

## API Endpoints

### POST `/api/generate-video`
Generates a new video based on the provided prompt.

**Request Body:**
```json
{
  "prompt": "A beautiful sunset over the ocean",
  "duration": 6,
  "resolution": "1080P"
}
```

**Response:**
```json
{
  "task_id": "296929905094731",
  "status": "submitted",
  "prompt": "A beautiful sunset over the ocean",
  "duration": 6,
  "resolution": "1080P",
  "base_resp": {
    "status_code": 0,
    "status_msg": "success"
  },
  "submitted_at": "2025-08-01T10:51:37.584Z"
}
```

### GET `/api/status/[taskId]`
Checks the status of a video generation task.

**Response:**
```json
{
  "task_id": "296929905094731",
  "status": "completed",
  "video_url": "https://example.com/video.mp4",
  "base_resp": {
    "status_code": 0,
    "status_msg": "success"
  },
  "result": {
    "video_url": "https://example.com/video.mp4"
  }
}
```

### POST `/api/callback`
Handles webhook callbacks from MiniMax API (for future use).

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```
   MINIMAX_API_KEY=your_minimax_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Enter a prompt**: Describe the scene you want to generate
2. **Select duration**: Choose between 6 or 10 seconds
3. **Choose resolution**: Select 1080P or 768P
4. **Submit**: Click "Generate Video" to start the process
5. **Monitor progress**: The application will automatically poll for status updates
6. **View results**: Once completed, the video will be displayed with a preview player

## Status Tracking

The application automatically polls the status every 5 seconds when a video is being generated. The status can be:

- **submitted**: Task has been submitted to MiniMax
- **processing**: Video is being generated
- **completed**: Video generation is complete
- **failed**: Video generation failed

## Error Handling

The application handles various error scenarios:

- Network errors
- API authentication failures
- Invalid input validation
- Task not found errors
- Video generation failures

## Development

This application uses:

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **React Hooks** for state management
- **CSS-in-JS** for styling

## API Integration

The application integrates with the MiniMax Hailuo API:

- Video generation endpoint: `POST /v1/video_generation`
- Status query endpoint: `GET /v1/video_generation/query`
- Webhook callback support for real-time updates

## Mock Data

For testing purposes, the application includes mock status responses for specific task IDs:

- `296929905094731`: Returns completed status with video URL
- `296928772870212`: Returns processing status

This allows testing the complete workflow without requiring actual API responses.
# video-deploy
